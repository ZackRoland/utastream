"""Conservative line-timed LRC normalization."""

import re

_LINE = re.compile(r"^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?]\s?(.*)$")


def parse_lrc(value: str | None) -> list[dict[str, object]]:
    if not value:
        return []
    parsed: list[tuple[float, str]] = []
    for line in value.splitlines():
        match = _LINE.match(line.strip())
        if not match:
            continue
        minutes, seconds, fraction, text = match.groups()
        fraction_seconds = float(f"0.{fraction}") if fraction else 0.0
        start = int(minutes) * 60 + int(seconds) + fraction_seconds
        parsed.append((start, text))
    parsed.sort(key=lambda item: item[0])
    return [
        {
            "startSeconds": start,
            "endSeconds": parsed[index + 1][0] if index + 1 < len(parsed) else None,
            "text": text,
        }
        for index, (start, text) in enumerate(parsed)
    ]
