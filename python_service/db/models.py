# models.py
from sqlalchemy import Column, DateTime, Integer, String, func
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    # Keep username/created_at if you want; email can be nullable until auth is added.
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Dubbing(Base):
    __tablename__ = "dubblings"

    id = Column(Integer, primary_key=True, index=True)

    # Unique identifier from YouTube link (store as slug/string)
    youtube_slug = Column(String, index=True, nullable=False, unique=True)

    original_lan = Column(String, nullable=False)
    dubbed_lan = Column(String, nullable=False)

    transcribed_text_path = Column(String, nullable=True)
    translated_text_path = Column(String, nullable=True)

    dubbed_audio_path = Column(String, nullable=True)
    dubbed_video_path = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Subtitle(Base):
    __tablename__ = "subtitles"

    id = Column(Integer, primary_key=True, index=True)

    youtube_slug = Column(String, index=True, nullable=False)
    language = Column(String, nullable=False)

    transcribed_text_path = Column(String, nullable=True)
    translated_text_path = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
