import os
from motor.motor_asyncio import AsyncIOMotorClient

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


async def ensure_indexes():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.projects.create_index("owner_id")
    await db.projects.create_index("id", unique=True)
    await db.clips.create_index("owner_id")
    await db.clips.create_index("project_id")
    await db.clips.create_index("id", unique=True)
    await db.brand_presets.create_index("owner_id")
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
