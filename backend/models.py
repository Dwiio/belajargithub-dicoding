import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ---------- Auth ----------
class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    plan: str = "Free"
    role: str = "user"
    created_at: str


# ---------- Projects / Clips ----------
class AnalyzeInput(BaseModel):
    url: str
    num_clips: int = 6
    clip_duration: str = "auto"   # 15 | 30 | 45 | 60 | auto


class ScoreBreakdown(BaseModel):
    hook: int = 0
    engagement: int = 0
    clarity: int = 0
    emotion: int = 0
    shareability: int = 0


class ContentPack(BaseModel):
    title: str = ""
    hook: str = ""
    social_caption: str = ""
    hashtags: List[str] = Field(default_factory=list)
    thumbnail_text: str = ""
    cta: str = ""


class CaptionSegment(BaseModel):
    text: str
    start: float
    end: float


class Clip(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    project_id: str
    video_id: str
    order: int = 0
    title: str
    hook: str = ""
    reason: str = ""
    category: str = "Viral"
    start: float
    end: float
    duration: float
    score: int = 0
    score_breakdown: ScoreBreakdown = Field(default_factory=ScoreBreakdown)
    confidence: int = 0
    transcript_text: str = ""
    captions: List[CaptionSegment] = Field(default_factory=list)
    content_pack: ContentPack = Field(default_factory=ContentPack)
    caption_style: str = "Bold"
    aspect_ratio: str = "9:16"
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class Project(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    title: str = "Untitled Project"
    url: str
    video_id: str = ""
    thumbnail: str = ""
    author: str = ""
    duration_seconds: int = 0
    source: str = "youtube"          # youtube | sample
    status: str = "processing"       # processing | completed | failed | draft
    progress_stage: int = 0          # 0..5
    error: Optional[str] = None
    num_clips_requested: int = 6
    clip_duration: str = "auto"
    clip_count: int = 0
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class ClipUpdate(BaseModel):
    title: Optional[str] = None
    caption_style: Optional[str] = None
    aspect_ratio: Optional[str] = None
    captions: Optional[List[CaptionSegment]] = None
    content_pack: Optional[ContentPack] = None


class BrandPreset(BaseModel):
    id: str = Field(default_factory=new_id)
    owner_id: str
    brand_name: str = "My Brand"
    username: str = "@creator"
    logo_url: str = ""
    watermark_opacity: int = 80
    logo_position: str = "bottom-right"
    primary_color: str = "#7C3AED"
    secondary_color: str = "#4F46E5"
    caption_style: str = "Bold"
    font: str = "Outfit"
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)
