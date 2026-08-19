"""AI service layer. Modular so the provider can be swapped without touching
callers (brief §53). Uses Emergent Universal Key + Claude Sonnet 4.6.
"""
import os
import json
import re
import logging

logger = logging.getLogger("clapclip.ai")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
MODEL_PROVIDER = "anthropic"
MODEL_NAME = "claude-sonnet-4-6"

CATEGORIES = [
    "Viral", "Educational", "Funny", "Emotional", "Controversial",
    "Storytelling", "Inspirational", "Business", "Podcast", "Tutorial",
    "Hot Take", "Unexpected",
]

DURATION_HINTS = {
    "15": "about 15 seconds", "30": "about 30 seconds",
    "45": "about 45 seconds", "60": "about 60 seconds",
    "auto": "between 20 and 55 seconds (choose the best natural length)",
}


def _fmt_ts(seconds: float) -> str:
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m:02d}:{s:02d}"


def _condense(segments, max_lines=140):
    """Compact timestamped transcript for the prompt."""
    if len(segments) > max_lines:
        step = len(segments) / max_lines
        picked, i = [], 0.0
        while int(i) < len(segments):
            picked.append(segments[int(i)])
            i += step
        segments = picked
    return "\n".join(f"[{_fmt_ts(s['start'])}] {s['text']}" for s in segments)


def _extract_json(text: str):
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return json.loads(text[start:end + 1])
    raise ValueError("No JSON object found in model response")


def _captions_for_range(segments, start, end):
    """Build word-level-ish caption segments within [start, end]."""
    caps = []
    for s in segments:
        s_start = s["start"]
        s_end = s["start"] + s.get("duration", 3.0)
        if s_end < start or s_start > end:
            continue
        words = s["text"].split()
        if not words:
            continue
        seg_start = max(s_start, start)
        seg_end = min(s_end, end)
        per = (seg_end - seg_start) / max(len(words), 1)
        # chunk into 3-word caption groups for readability
        group = []
        gstart = seg_start
        for idx, w in enumerate(words):
            group.append(w)
            if len(group) == 3 or idx == len(words) - 1:
                gend = min(gstart + per * len(group), end)
                caps.append({
                    "text": " ".join(group),
                    "start": round(gstart - start, 2),
                    "end": round(gend - start, 2),
                })
                gstart = gend
                group = []
    return caps


async def analyze_video(video_title, segments, num_clips=6, clip_duration="auto"):
    """Returns list of normalized clip dicts using real Claude analysis."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    total_end = segments[-1]["start"] + segments[-1].get("duration", 4) if segments else 60
    condensed = _condense(segments)
    dur_hint = DURATION_HINTS.get(str(clip_duration), DURATION_HINTS["auto"])

    system_message = (
        "You are ClapClip's AI content strategist — an expert at finding the most "
        "shareable, high-retention moments inside long-form video transcripts and "
        "packaging them for short-form social media (TikTok, Reels, YouTube Shorts). "
        "You understand hooks, emotional arcs, story structure, punchlines, contrarian "
        "takes, and what makes people stop scrolling. You always respond with valid JSON only."
    )

    prompt = f"""Analyze this video transcript and select the {num_clips} BEST moments to turn into viral short-form clips.

VIDEO TITLE: {video_title}
TRANSCRIPT (timestamps in mm:ss):
{condensed}

RULES:
- Each clip should be {dur_hint} long and MUST start and end on natural sentence boundaries — never mid-sentence.
- Prioritise strong hooks: questions, surprising claims, bold opinions, emotional or memorable statements.
- Diversify categories. Valid categories: {", ".join(CATEGORIES)}.
- start_seconds and end_seconds are absolute seconds from the video start. The video is about {int(total_end)} seconds long — stay within range.
- The AI Viral Potential Score reflects content characteristics only (NOT guaranteed performance).

Return ONLY this JSON (no prose, no markdown):
{{
  "clips": [
    {{
      "title": "punchy 3-7 word title",
      "hook": "the exact or paraphrased opening hook line",
      "reason": "one sentence on why this moment works",
      "category": "one of the valid categories",
      "start_seconds": 0,
      "end_seconds": 30,
      "score": 0-100 integer overall AI viral potential,
      "confidence": 0-100 integer,
      "score_breakdown": {{"hook":0-100,"engagement":0-100,"clarity":0-100,"emotion":0-100,"shareability":0-100}},
      "content_pack": {{
        "title": "SEO/scroll-stopping title for the short",
        "hook": "first-line hook for the caption",
        "social_caption": "ready-to-post caption with light emoji, 1-3 sentences",
        "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
        "thumbnail_text": "2-4 UPPERCASE words for thumbnail",
        "cta": "short call to action"
      }}
    }}
  ]
}}"""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"clapclip-{abs(hash(video_title)) % 100000}",
        system_message=system_message,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)

    resp = await chat.send_message(UserMessage(text=prompt))
    data = _extract_json(resp if isinstance(resp, str) else str(resp))
    raw_clips = data.get("clips", [])

    clips = []
    for i, c in enumerate(raw_clips):
        try:
            start = float(c.get("start_seconds", 0))
            end = float(c.get("end_seconds", start + 30))
        except (TypeError, ValueError):
            continue
        if end <= start:
            end = start + 30
        end = min(end, total_end)
        start = max(0.0, min(start, total_end - 5))
        transcript_text = " ".join(
            s["text"] for s in segments
            if s["start"] + s.get("duration", 3) >= start and s["start"] <= end
        )
        cp = c.get("content_pack", {}) or {}
        sb = c.get("score_breakdown", {}) or {}
        clips.append({
            "order": i,
            "title": (c.get("title") or f"Clip {i + 1}")[:120],
            "hook": c.get("hook", "")[:400],
            "reason": c.get("reason", "")[:400],
            "category": c.get("category") if c.get("category") in CATEGORIES else "Viral",
            "start": round(start, 2),
            "end": round(end, 2),
            "duration": round(end - start, 2),
            "score": int(max(0, min(100, c.get("score", 75)))),
            "confidence": int(max(0, min(100, c.get("confidence", 80)))),
            "score_breakdown": {
                "hook": int(max(0, min(100, sb.get("hook", 80)))),
                "engagement": int(max(0, min(100, sb.get("engagement", 78)))),
                "clarity": int(max(0, min(100, sb.get("clarity", 82)))),
                "emotion": int(max(0, min(100, sb.get("emotion", 70)))),
                "shareability": int(max(0, min(100, sb.get("shareability", 76)))),
            },
            "transcript_text": transcript_text[:1200],
            "captions": _captions_for_range(segments, start, end),
            "content_pack": {
                "title": cp.get("title", c.get("title", ""))[:160],
                "hook": cp.get("hook", c.get("hook", ""))[:300],
                "social_caption": cp.get("social_caption", "")[:600],
                "hashtags": [h if h.startswith("#") else f"#{h}" for h in (cp.get("hashtags") or [])][:8],
                "thumbnail_text": cp.get("thumbnail_text", "")[:60],
                "cta": cp.get("cta", "")[:120],
            },
        })
    clips.sort(key=lambda x: x["score"], reverse=True)
    for i, c in enumerate(clips):
        c["order"] = i
    return clips


async def regenerate_content_pack(clip: dict):
    """Regenerate just the content pack for a single clip."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    prompt = f"""Rewrite a fresh, distinct social media Content Pack for this short clip.

CLIP TITLE: {clip.get('title')}
CATEGORY: {clip.get('category')}
TRANSCRIPT: {clip.get('transcript_text', '')[:800]}

Return ONLY JSON:
{{"title":"","hook":"","social_caption":"","hashtags":["#a","#b","#c"],"thumbnail_text":"","cta":""}}"""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"clapclip-cp-{clip.get('id','x')}",
        system_message="You are ClapClip's viral copywriter. Respond with valid JSON only.",
    ).with_model(MODEL_PROVIDER, MODEL_NAME)
    resp = await chat.send_message(UserMessage(text=prompt))
    cp = _extract_json(resp if isinstance(resp, str) else str(resp))
    return {
        "title": cp.get("title", "")[:160],
        "hook": cp.get("hook", "")[:300],
        "social_caption": cp.get("social_caption", "")[:600],
        "hashtags": [h if h.startswith("#") else f"#{h}" for h in (cp.get("hashtags") or [])][:8],
        "thumbnail_text": cp.get("thumbnail_text", "")[:60],
        "cta": cp.get("cta", "")[:120],
    }
