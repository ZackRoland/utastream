from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from utastream.database.models import LearningItemRow


class LearningRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(
        self,
        *,
        user_id: UUID,
        track_id: UUID,
        lyric_document_id: UUID,
        segment_key: str,
        selected_text: str,
        selection_kind: str,
    ) -> LearningItemRow:
        existing = self._session.scalar(
            select(LearningItemRow).where(
                LearningItemRow.user_id == user_id,
                LearningItemRow.lyric_document_id == lyric_document_id,
                LearningItemRow.segment_key == segment_key,
                LearningItemRow.selected_text == selected_text,
                LearningItemRow.selection_kind == selection_kind,
            )
        )
        if existing is not None:
            return existing
        row = LearningItemRow(
            user_id=user_id,
            track_id=track_id,
            lyric_document_id=lyric_document_id,
            segment_key=segment_key,
            selected_text=selected_text,
            selection_kind=selection_kind,
        )
        self._session.add(row)
        self._session.flush()
        return row

    def list_for_user(self, user_id: UUID) -> list[LearningItemRow]:
        return list(
            self._session.scalars(
                select(LearningItemRow)
                .where(LearningItemRow.user_id == user_id)
                .order_by(LearningItemRow.created_at, LearningItemRow.id)
            )
        )
