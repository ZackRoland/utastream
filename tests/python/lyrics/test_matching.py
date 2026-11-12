from utastream.lyrics.matching import CandidateMetadata, SearchMetadata, score_candidate


def test_strong_candidate_normalizes_width_case_and_official_video_text() -> None:
    score = score_candidate(
        SearchMetadata(
            "\uff28\uff25\uff2c\uff2c\uff2f Official MV",
            "\uff21\uff49\uff4d\uff45\uff52",
            240,
            "Album",
        ),
        CandidateMetadata("hello", "aimer", 241, "album"),
    )

    assert score.total >= 90
    assert score.band == "strong"


def test_ambiguous_candidate_is_not_silently_strong() -> None:
    score = score_candidate(
        SearchMetadata("Blue", "Artist", 240),
        CandidateMetadata("Blue Acoustic", "Artist", 250),
    )

    assert score.band == "ambiguous"
    assert score.warnings


def test_wrong_edition_scores_below_ambiguous_threshold() -> None:
    score = score_candidate(
        SearchMetadata("Night Drive", "Original Artist", 200, "First"),
        CandidateMetadata("Night Drive Live", "Cover Band", 280, "Concert"),
    )

    assert score.total < 70
    assert score.band == "weak"
