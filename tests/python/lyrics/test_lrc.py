from utastream.lyrics.lrc import parse_lrc


def test_lrc_lines_become_stable_ordered_segments() -> None:
    assert parse_lrc("[00:02.50] 二行目\n[00:01.00] 一行目") == [
        {"startSeconds": 1.0, "endSeconds": 2.5, "text": "一行目"},
        {"startSeconds": 2.5, "endSeconds": None, "text": "二行目"},
    ]


def test_plain_or_instrumental_lyrics_have_no_timed_segments() -> None:
    assert parse_lrc(None) == []
    assert parse_lrc("untimed text") == []


def test_blank_timestamps_end_a_line_without_becoming_visible_segments() -> None:
    assert parse_lrc("[01:27.00] Discordに耽美して\n[01:33.00]\n[01:51.00] 不条理") == [
        {
            "startSeconds": 87.0,
            "endSeconds": 93.0,
            "text": "Discordに耽美して",
        },
        {"startSeconds": 111.0, "endSeconds": None, "text": "不条理"},
    ]
