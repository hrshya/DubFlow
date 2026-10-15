from dotenv import load_dotenv
import os

load_dotenv()

def require(name: str) -> str:
    val = os.environ.get(name)
    if not val:
        raise RuntimeError(f"Missing required env var: {name}")
    return val
