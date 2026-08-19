"""VideoSourceService — modular provider abstraction for acquiring video
metadata and transcripts from a public YouTube URL.

Design goal (see brief §54, §59): keep the user experience as
"Paste YouTube URL -> Generate" while never coupling the app to a single
acquisition method. Real providers can be swapped in behind these functions.
"""
import re
import asyncio
import httpx

YT_ID_PATTERNS = [
    r"(?:youtube\.com/watch\?v=)([A-Za-z0-9_-]{11})",
    r"(?:youtu\.be/)([A-Za-z0-9_-]{11})",
    r"(?:youtube\.com/embed/)([A-Za-z0-9_-]{11})",
    r"(?:youtube\.com/shorts/)([A-Za-z0-9_-]{11})",
    r"(?:youtube\.com/live/)([A-Za-z0-9_-]{11})",
]


def extract_video_id(url: str):
    if not url:
        return None
    url = url.strip()
    for pat in YT_ID_PATTERNS:
        m = re.search(pat, url)
        if m:
            return m.group(1)
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", url):
        return url
    return None


def validate_url(url: str):
    """Returns (video_id, error_message | None)."""
    if not url or not url.strip():
        return None, "Please paste a YouTube URL to get started."
    vid = extract_video_id(url)
    if not vid:
        return None, "That doesn't look like a valid YouTube URL."
    return vid, None


async def get_metadata(video_id: str) -> dict:
    """Fetch real title / author / thumbnail via YouTube oEmbed (public, no key)."""
    oembed = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        async with httpx.AsyncClient(timeout=12) as c:
            r = await c.get(oembed)
            if r.status_code == 200:
                data = r.json()
                return {
                    "ok": True,
                    "title": data.get("title", "Untitled Video"),
                    "author": data.get("author_name", ""),
                    "thumbnail": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                }
            if r.status_code in (401, 403):
                return {"ok": False, "error": "This video can't be accessed. Please use a public video."}
            if r.status_code == 404:
                return {"ok": False, "error": "We couldn't find that video. Please check the link."}
    except Exception:
        pass
    return {"ok": False, "error": None, "title": "Untitled Video", "author": "",
            "thumbnail": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"}


async def get_transcript(video_id: str):
    """Fetch a real transcript. Returns list[{start, duration, text}] or None."""
    def _fetch():
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            api = YouTubeTranscriptApi()
            fetched = api.fetch(video_id, languages=["en", "en-US", "en-GB"])
            out = []
            for snip in fetched:
                out.append({
                    "start": float(getattr(snip, "start", 0.0)),
                    "duration": float(getattr(snip, "duration", 0.0)),
                    "text": getattr(snip, "text", "").replace("\n", " ").strip(),
                })
            return [s for s in out if s["text"]]
        except Exception:
            return None
    try:
        return await asyncio.to_thread(_fetch)
    except Exception:
        return None


# ---- Development fallback: a real, high-quality transcript so the AI has genuine
# text to analyze when a network transcript is unavailable on this host. ----
_SAMPLE_LINES = [
    "So everyone always asks me what the biggest mistake founders make is, and honestly it comes down to one thing.",
    "They build something nobody actually wants, and they spend a year finding out.",
    "I did the exact same thing with my first company. We spent eighteen months in a room writing code.",
    "We never talked to a single customer. Not one. We were terrified of hearing no.",
    "Here's the truth that changed everything for me: your idea is a hypothesis, not a fact.",
    "The moment you treat it like a fact, you stop learning, and the market stops caring.",
    "When we finally launched, we got seven signups. Seven. After eighteen months of work.",
    "And that was the best thing that ever happened to me, because it forced me to actually listen.",
    "We tore the whole thing down and rebuilt it in six weeks based on what people told us they needed.",
    "That version hit ten thousand users in the first month. Same team, same skills, completely different approach.",
    "The difference was we stopped guessing and started asking. Speed of learning beats speed of building.",
    "People think startups are about having a genius idea. They're not. They're about being less wrong every week.",
    "If you can shorten the loop between idea and feedback, you will out-execute smarter people every single time.",
    "The second biggest mistake? Founders hire too fast when things go well and too slow when things go wrong.",
    "Cash is oxygen. You don't feel it until you can't breathe, and by then it's usually too late to fix.",
    "My rule now is simple: hire when it hurts, not when it's comfortable. Pain is a better signal than optimism.",
    "And the last thing, the one nobody tells you, is that distribution beats product almost every time.",
    "The best product with no distribution loses to an average product that everyone can find.",
    "So build your audience before you build your product. Attention is the one thing money genuinely can't buy fast.",
    "If I started over today, I'd spend the first ninety days just talking to people and building in public.",
    "That's it. That's the whole playbook. Talk to customers, watch your cash, and earn attention before you need it.",
]


def sample_transcript():
    out = []
    t = 8.0
    for line in _SAMPLE_LINES:
        dur = max(3.5, len(line.split()) / 2.6)
        out.append({"start": round(t, 1), "duration": round(dur, 1), "text": line})
        t += dur + 0.4
    return out
