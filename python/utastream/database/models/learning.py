"""Learning records owned by canonical track and lyric identities."""

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from utastream.database.base import Base


class LearningItemRow(Base):
    __tablename__ = "learning_items"
    __table_args__ = (
        ForeignKeyConstraint(
            ["lyric_document_id", "track_id"],
            ["lyric_documents.id", "lyric_documents.track_id"],
            ondelete="CASCADE",
            name="fk_learning_item_lyric_track",
        ),
        UniqueConstraint(
            "user_id",
            "lyric_document_id",
            "segment_key",
            "selection_kind",
            "selected_text",
            name="uq_learning_items_user_lyric_selection",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(PostgreSQLUUID(as_uuid=True), index=True)
    track_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("tracks.id", ondelete="CASCADE"),
        index=True,
    )
    lyric_document_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), index=True
    )
    segment_key: Mapped[str] = mapped_column(String(200))
    selected_text: Mapped[str] = mapped_column(String(1000))
    selection_kind: Mapped[str] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
