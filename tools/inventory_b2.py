#!/usr/bin/env python3
"""Build a payload-free inventory of a Gears 5 B2 content directory."""

from __future__ import annotations

import argparse
import hashlib
import json
import struct
from pathlib import Path


HEADER_WINDOW_BYTES = 32


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def parse_b2_index_header(path: Path) -> dict[str, object]:
    with path.open("rb") as stream:
        header = stream.read(HEADER_WINDOW_BYTES)
    if len(header) < 8:
        raise ValueError(f"{path.name}: index is shorter than 8 bytes")

    magic_bytes = header[:4]
    try:
        magic = magic_bytes.decode("ascii")
    except UnicodeDecodeError as exc:
        raise ValueError(f"{path.name}: index magic is not ASCII") from exc

    return {
        "magic": magic,
        "u32_0x04_le": struct.unpack_from("<I", header, 4)[0],
        "headerWindowBytes": len(header),
        "headerWindowHex": header.hex(),
    }


def build_inventory(root: Path, source_label: str, hash_index: bool = True) -> dict[str, object]:
    if not root.is_dir():
        raise ValueError(f"B2 root does not exist or is not a directory: {root}")

    indexes = sorted(
        (path for path in root.iterdir() if path.is_file() and path.suffix.lower() == ".b2index"),
        key=lambda path: path.name.lower(),
    )
    if len(indexes) != 1:
        raise ValueError(f"expected exactly one .b2index, found {len(indexes)}")

    containers = sorted(
        (path for path in root.iterdir() if path.is_file() and path.suffix.lower() == ".b2container"),
        key=lambda path: path.name.lower(),
    )
    if not containers:
        raise ValueError("no .b2container files found")

    index = indexes[0]
    index_row: dict[str, object] = {
        "name": index.name,
        "sizeBytes": index.stat().st_size,
        "header": parse_b2_index_header(index),
    }
    if hash_index:
        index_row["sha256"] = sha256(index)

    container_rows = [
        {"name": path.name, "sizeBytes": path.stat().st_size}
        for path in containers
    ]
    return {
        "schema": "gears5_b2_inventory_v1",
        "source": {
            "label": source_label,
            "root": "GearGame/Content/B2",
        },
        "b2Index": index_row,
        "containers": {
            "count": len(container_rows),
            "totalBytes": sum(row["sizeBytes"] for row in container_rows),
            "entries": container_rows,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path, help="Path to GearGame/Content/B2")
    parser.add_argument("--output", type=Path, required=True, help="Destination JSON report")
    parser.add_argument("--source-label", required=True, help="Build-scoped source label")
    parser.add_argument("--skip-index-hash", action="store_true", help="Do not hash the index")
    args = parser.parse_args()

    try:
        report = build_inventory(args.root, args.source_label, not args.skip_index_hash)
    except (OSError, ValueError) as exc:
        parser.error(str(exc))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(
        f"wrote {args.output}: {report['containers']['count']} containers, "
        f"{report['containers']['totalBytes']} bytes"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

