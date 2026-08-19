import asyncio
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from database import db
from auth import get_current_user
from models import (
    AnalyzeInput, Project, Clip, ClipUpdate, BrandPreset, new_id, now_iso,
)
import video_service as vs
import ai_service

logger = logging.getLogger("clapclip.routes")
api = APIRouter(prefix="/api", tags=["app"])

STAGE_LABELS = [
    "Fetching video & metadata",
    "Transcribing audio",
    "AI highlight & hook detection",
    "Smart reframe & captions",
    "Content pack synthesis",
]


def _clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


async def _set_stage(project_id: str, stage: int, extra: dict = None):
    upd = {"progress_stage": stage, "updated_at": now_iso()}
    if extra:
        upd.update(extra)
    await db.projects.update_one({"id": project_id}, {"$set": upd})


async def process_project(project_id: str, owner_id: str, url: str, video_id: str,
                          num_clips: int, clip_duration: str):
    try:
        await _set_stage(project_id, 1)
        meta = await vs.get_metadata(video_id)
        if meta.get("error"):
            await _set_stage(project_id, 1, {"status": "failed", "error": meta["error"]})
            return
        await db.projects.update_one({"id": project_id}, {"$set": {
            "title": meta.get("title", "Untitled Project"),
            "author": meta.get("author", ""),
            "thumbnail": meta.get("thumbnail", ""),
        }})
        await asyncio.sleep(0.4)

        await _set_stage(project_id, 2)
        segments = await vs.get_transcript(video_id)
        source = "youtube"
        if not segments or len(segments) < 4:
            segments = vs.sample_transcript()
            source = "sample"
        duration_seconds = int(segments[-1]["start"] + segments[-1].get("duration", 4))
        await db.projects.update_one({"id": project_id}, {"$set": {
            "source": source, "duration_seconds": duration_seconds,
        }})
        await asyncio.sleep(0.4)

        await _set_stage(project_id, 3)
        clips_data = await ai_service.analyze_video(
            meta.get("title", "Video"), segments, num_clips, clip_duration
        )
        if not clips_data:
            await _set_stage(project_id, 3, {"status": "failed",
                              "error": "We couldn't find clip-worthy moments in this video. Try another one."})
            return
        await asyncio.sleep(0.3)

        await _set_stage(project_id, 4)
        await asyncio.sleep(0.4)

        await _set_stage(project_id, 5)
        clip_docs = []
        for c in clips_data:
            clip = Clip(owner_id=owner_id, project_id=project_id, video_id=video_id, **c)
            clip_docs.append(clip.model_dump())
        if clip_docs:
            await db.clips.insert_many(clip_docs)

        await db.projects.update_one({"id": project_id}, {"$set": {
            "status": "completed", "progress_stage": 5,
            "clip_count": len(clip_docs), "updated_at": now_iso(),
        }})

        # usage accounting
        await db.usage.update_one(
            {"owner_id": owner_id, "month": datetime.now(timezone.utc).strftime("%Y-%m")},
            {"$inc": {"minutes": max(1, duration_seconds // 60),
                      "clips": len(clip_docs), "projects": 1}},
            upsert=True,
        )
    except Exception as e:
        logger.exception("processing failed")
        await db.projects.update_one({"id": project_id}, {"$set": {
            "status": "failed",
            "error": "We couldn't process this video. Please try again.",
            "updated_at": now_iso(),
        }})


@api.post("/projects/analyze")
async def analyze(body: AnalyzeInput, user: dict = Depends(get_current_user)):
    video_id, err = vs.validate_url(body.url)
    if err:
        raise HTTPException(status_code=400, detail=err)
    project = Project(
        owner_id=user["id"], url=body.url.strip(), video_id=video_id,
        thumbnail=f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        num_clips_requested=body.num_clips, clip_duration=body.clip_duration,
        status="processing", progress_stage=0,
    )
    await db.projects.insert_one(project.model_dump())
    asyncio.create_task(process_project(
        project.id, user["id"], body.url.strip(), video_id,
        body.num_clips, body.clip_duration,
    ))
    return {"project_id": project.id, "stages": STAGE_LABELS}


@api.get("/projects")
async def list_projects(user: dict = Depends(get_current_user)):
    docs = await db.projects.find({"owner_id": user["id"]}).sort("created_at", -1).to_list(200)
    return [_clean(d) for d in docs]


@api.get("/projects/{project_id}")
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    doc = await db.projects.find_one({"id": project_id, "owner_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return _clean(doc)


@api.get("/projects/{project_id}/clips")
async def project_clips(project_id: str, user: dict = Depends(get_current_user)):
    proj = await db.projects.find_one({"id": project_id, "owner_id": user["id"]})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    docs = await db.clips.find({"project_id": project_id, "owner_id": user["id"]}).sort("order", 1).to_list(200)
    return [_clean(d) for d in docs]


@api.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    res = await db.projects.delete_one({"id": project_id, "owner_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.clips.delete_many({"project_id": project_id, "owner_id": user["id"]})
    return {"ok": True}


@api.patch("/projects/{project_id}")
async def rename_project(project_id: str, body: dict, user: dict = Depends(get_current_user)):
    title = (body or {}).get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Title required")
    res = await db.projects.update_one({"id": project_id, "owner_id": user["id"]},
                                       {"$set": {"title": title, "updated_at": now_iso()}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}


# ---------- Clips ----------
@api.get("/clips")
async def list_clips(user: dict = Depends(get_current_user)):
    docs = await db.clips.find({"owner_id": user["id"]}).sort("score", -1).to_list(400)
    # attach project title
    proj_ids = list({d["project_id"] for d in docs})
    projs = await db.projects.find({"id": {"$in": proj_ids}}).to_list(400)
    pmap = {p["id"]: p.get("title", "") for p in projs}
    out = []
    for d in docs:
        d = _clean(d)
        d["project_title"] = pmap.get(d["project_id"], "")
        out.append(d)
    return out


@api.get("/clips/{clip_id}")
async def get_clip(clip_id: str, user: dict = Depends(get_current_user)):
    doc = await db.clips.find_one({"id": clip_id, "owner_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Clip not found")
    return _clean(doc)


@api.patch("/clips/{clip_id}")
async def update_clip(clip_id: str, body: ClipUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not updates:
        return {"ok": True}
    updates["updated_at"] = now_iso()
    res = await db.clips.update_one({"id": clip_id, "owner_id": user["id"]}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Clip not found")
    doc = await db.clips.find_one({"id": clip_id, "owner_id": user["id"]})
    return _clean(doc)


@api.post("/clips/{clip_id}/content-pack")
async def regen_content_pack(clip_id: str, user: dict = Depends(get_current_user)):
    doc = await db.clips.find_one({"id": clip_id, "owner_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Clip not found")
    cp = await ai_service.regenerate_content_pack(doc)
    await db.clips.update_one({"id": clip_id}, {"$set": {"content_pack": cp, "updated_at": now_iso()}})
    return cp


@api.post("/clips/{clip_id}/render")
async def render_clip(clip_id: str, body: dict = None, user: dict = Depends(get_current_user)):
    """Render/export step. Returns an export descriptor. The actual pixel render
    is handled by a swappable RenderService provider; here we finalize the
    export package (clip timing + embed + burned caption plan)."""
    doc = await db.clips.find_one({"id": clip_id, "owner_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Clip not found")
    body = body or {}
    await db.usage.update_one(
        {"owner_id": user["id"], "month": datetime.now(timezone.utc).strftime("%Y-%m")},
        {"$inc": {"exports": 1}}, upsert=True,
    )
    return {
        "ok": True,
        "clip_id": clip_id,
        "quality": body.get("quality", "1080p"),
        "aspect_ratio": body.get("aspect_ratio", doc.get("aspect_ratio", "9:16")),
        "burn_captions": body.get("burn_captions", True),
        "embed_url": f"https://www.youtube.com/embed/{doc['video_id']}?start={int(doc['start'])}&end={int(doc['end'])}&autoplay=1",
        "share_url": f"https://www.youtube.com/watch?v={doc['video_id']}&t={int(doc['start'])}s",
    }


# ---------- Brand Kit ----------
@api.get("/brand-kit")
async def get_brand(user: dict = Depends(get_current_user)):
    doc = await db.brand_presets.find_one({"owner_id": user["id"]})
    if not doc:
        preset = BrandPreset(owner_id=user["id"])
        await db.brand_presets.insert_one(preset.model_dump())
        return preset.model_dump()
    return _clean(doc)


@api.put("/brand-kit")
async def save_brand(body: dict, user: dict = Depends(get_current_user)):
    allowed = {"brand_name", "username", "logo_url", "watermark_opacity", "logo_position",
               "primary_color", "secondary_color", "caption_style", "font"}
    updates = {k: v for k, v in (body or {}).items() if k in allowed}
    updates["updated_at"] = now_iso()
    await db.brand_presets.update_one({"owner_id": user["id"]}, {"$set": updates}, upsert=True)
    doc = await db.brand_presets.find_one({"owner_id": user["id"]})
    return _clean(doc)


# ---------- Usage ----------
@api.get("/usage")
async def get_usage(user: dict = Depends(get_current_user)):
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    doc = await db.usage.find_one({"owner_id": user["id"], "month": month})
    limits = {"Free": 30, "Creator": 180, "Pro Studio": 600, "Agency": 2000}
    plan = user.get("plan", "Free")
    used = doc or {}
    return {
        "month": month,
        "plan": plan,
        "minutes_used": used.get("minutes", 0),
        "minutes_limit": limits.get(plan, 30),
        "clips_generated": used.get("clips", 0),
        "exports": used.get("exports", 0),
        "projects": used.get("projects", 0),
    }
