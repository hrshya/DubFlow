import os
from pathlib import Path
from uuid import UUID


OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "outputs"))


def get_user_output_dir(user_id: str | UUID) -> Path:
    return OUTPUT_DIR / "users" / str(UUID(str(user_id)))


def get_job_output_dir(user_id: str | UUID, job_id: str | UUID) -> Path:
    return get_user_output_dir(user_id) / "jobs" / str(UUID(str(job_id)))


def get_output_url(path: str | Path) -> str:
    relative_path = Path(path).resolve().relative_to(OUTPUT_DIR.resolve())
    return f"/outputs/{relative_path.as_posix()}"
