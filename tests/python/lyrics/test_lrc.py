from utastream.lyrics.lrc import parse_lrc


def test_lrc_lines_become_stable_ordered_segments() -> None:
    assert parse_lrc("[00:02.50] 二行目\n[00:01.00] 一行目") == [
        {"startSeconds": 1.0, "endSeconds": 2.5, "text": "一行目"},
        {"startSeconds": 2.5, "endSeconds": None, "text": "二行目"},
    ]


def test_plain_or_instrumental_lyrics_have_no_timed_segments() -> None:
    assert parse_lrc(None) == []
    assert parse_lrc("untimed text") == []
