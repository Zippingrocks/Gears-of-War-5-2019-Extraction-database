#!/usr/bin/env python3
"""Dependency-free structural validation for the Gears 5 repository."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_PATHS = (
    "README.md",
    "AGENTS.md",
    "NOTICE.md",
    "LICENSE",
    "game.json",
    "docs/architecture.md",
    "docs/evidence-standard.md",
    "knowledge/project-status.md",
    "knowledge/formats/b2.md",
    "knowledge/maps/scene-reconstruction.md",
    "knowledge/platforms/pc-steam-build-10731442.md",
    "inventory/legacy-migration.json",
    "platforms/pc-steam-build-10731442/README.md",
    "schemas/evidence.schema.json",
    "schemas/game.schema.json",
)
FORBIDDEN_SUFFIXES = {
    ".blend", ".blend1", ".fbx", ".glb", ".gltf", ".obj", ".mtl",
    ".psk", ".pskx", ".uasset", ".uexp", ".ubulk", ".umap", ".pak",
    ".ucas", ".utoc", ".b2container", ".b2index", ".dds", ".tga",
    ".hdr", ".png", ".jpg", ".jpeg", ".wav", ".mp4", ".wmv",
    ".dll", ".exe", ".pdb", ".pyc", ".zip", ".bin",
}
CLAIM_STATES = {"hypothesis", "observed", "decoded", "validated", "rejected", "unknown"}
CONFIDENCE = {"low", "medium", "high"}
CLAIM_ID = re.compile(r"^[a-z0-9][a-z0-9-]+$")
WINDOWS_ABSOLUTE_PATH = re.compile(r"\b[A-Za-z]:\\")
SCOPE_KEYS = {"game", "platform", "build", "root", "maps", "packages", "objects"}


def load_json(path: Path, errors: list[str]) -> object | None:
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")
        return None


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def validate_claim(path: Path, errors: list[str]) -> None:
    value = load_json(path, errors)
    if not isinstance(value, dict):
        return
    required = {"id", "revision", "state", "confidence", "scope", "claim", "evidence", "limitations"}
    missing = required - value.keys()
    if missing:
        errors.append(f"{path.relative_to(ROOT)}: missing {sorted(missing)}")
        return
    if path.stem != value.get("id"):
        errors.append(f"{path.relative_to(ROOT)}: file name must match claim id")
    if not isinstance(value["id"], str) or not CLAIM_ID.fullmatch(value["id"]):
        errors.append(f"{path.relative_to(ROOT)}: invalid claim id")
    if value["state"] not in CLAIM_STATES:
        errors.append(f"{path.relative_to(ROOT)}: invalid state {value['state']!r}")
    if value["confidence"] not in CONFIDENCE:
        errors.append(f"{path.relative_to(ROOT)}: invalid confidence {value['confidence']!r}")
    if not isinstance(value["revision"], int) or value["revision"] < 1:
        errors.append(f"{path.relative_to(ROOT)}: revision must be positive")
    scope = value.get("scope")
    if not isinstance(scope, dict):
        errors.append(f"{path.relative_to(ROOT)}: scope must be an object")
    else:
        if scope.get("game") != "gears-5":
            errors.append(f"{path.relative_to(ROOT)}: invalid game scope")
        if scope.get("platform") != "pc-steam-build-10731442":
            errors.append(f"{path.relative_to(ROOT)}: invalid platform scope")
        extra_scope = set(scope) - SCOPE_KEYS
        if extra_scope:
            errors.append(f"{path.relative_to(ROOT)}: unknown scope keys {sorted(extra_scope)}")
    if not isinstance(value["evidence"], list) or not value["evidence"]:
        errors.append(f"{path.relative_to(ROOT)}: at least one evidence reference is required")
        return
    for entry in value["evidence"]:
        if not isinstance(entry, dict) or not isinstance(entry.get("ref"), str):
            errors.append(f"{path.relative_to(ROOT)}: invalid evidence reference")
            continue
        ref = entry["ref"]
        if "://" not in ref and not (ROOT / ref).is_file():
            errors.append(f"{path.relative_to(ROOT)}: missing evidence target {ref}")


def validate_migration_manifest(errors: list[str]) -> None:
    path = ROOT / "inventory" / "legacy-migration.json"
    value = load_json(path, errors)
    if not isinstance(value, dict) or not isinstance(value.get("items"), list):
        errors.append("inventory/legacy-migration.json: missing items array")
        return
    destinations: set[str] = set()
    for index, item in enumerate(value["items"]):
        if not isinstance(item, dict):
            errors.append(f"inventory/legacy-migration.json: item {index} is not an object")
            continue
        destination = item.get("destination")
        if not isinstance(destination, str) or Path(destination).is_absolute() or ".." in Path(destination).parts:
            errors.append(f"inventory/legacy-migration.json: item {index} has invalid destination")
            continue
        if destination in destinations:
            errors.append(f"inventory/legacy-migration.json: duplicate destination {destination}")
        destinations.add(destination)
        target = ROOT / destination
        if not target.is_file():
            errors.append(f"inventory/legacy-migration.json: missing destination {destination}")
            continue
        if target.stat().st_size != item.get("destinationBytes"):
            errors.append(f"inventory/legacy-migration.json: byte mismatch for {destination}")
        if file_sha256(target) != item.get("destinationSha256"):
            errors.append(f"inventory/legacy-migration.json: hash mismatch for {destination}")


def validate_curated_paths(errors: list[str]) -> None:
    roots = [ROOT / "README.md", ROOT / "AGENTS.md", ROOT / "docs", ROOT / "knowledge", ROOT / "platforms"]
    for item in roots:
        paths = [item] if item.is_file() else list(item.rglob("*"))
        for path in paths:
            if not path.is_file():
                continue
            try:
                text = path.read_text(encoding="utf-8-sig")
            except UnicodeError as exc:
                errors.append(f"{path.relative_to(ROOT)}: expected UTF-8 text: {exc}")
                continue
            if WINDOWS_ABSOLUTE_PATH.search(text):
                errors.append(f"{path.relative_to(ROOT)}: contains a machine-specific absolute path")


def main() -> int:
    errors: list[str] = []
    for relative in REQUIRED_PATHS:
        if not (ROOT / relative).is_file():
            errors.append(f"missing required file: {relative}")

    for path in sorted(ROOT.rglob("*.json")):
        if ".git" not in path.parts:
            load_json(path, errors)

    for path in ROOT.rglob("*"):
        if path.is_file() and ".git" not in path.parts and path.suffix.lower() in FORBIDDEN_SUFFIXES:
            errors.append(f"forbidden asset payload: {path.relative_to(ROOT)}")

    for path in sorted((ROOT / "evidence" / "claims").glob("*.json")):
        validate_claim(path, errors)

    validate_migration_manifest(errors)
    validate_curated_paths(errors)

    if errors:
        print("Repository validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Repository validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

