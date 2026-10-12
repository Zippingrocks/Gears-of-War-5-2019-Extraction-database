# Repository Operating Contract

This repository is the canonical extraction foundation for Gears 5. Treat native game data as the authority; viewport alignment is validation, not source proof.

## Start here

1. Read `knowledge/project-status.md`.
2. Read the build contract under `platforms/pc-steam-build-10731442/`.
3. Search `knowledge/` and `evidence/` before creating new research.
4. Keep incomplete or provenance-limited code in `research/` until promotion requirements are met.
5. Run `python tools/validate_repository.py` and `python -m unittest discover -s tests -v` before committing.

## Hard boundaries

- Never commit game containers, packages, extracted meshes, textures, audio, video, `.blend`, FBX, or decompiled payloads.
- Never promote unverified format assumptions; require build-scoped native evidence.
- Never assign semantic names to unknown binary fields from plausibility alone.
- Never infer a world transform from visual fit alone.
- Never label a map complete without denominators for container discovery, package closure, actors/components, attachments, static placement, constructed components, splines, HLODs, terrain, skeletal/dynamic actors, asset resolution, materials, lighting, and deliberate exclusions.
- Never edit a legacy fragment to make it look current. Curate corrected conclusions into `knowledge/` and cite the fragment.
- Never delete or relocate external workspace data during migration without explicit authorization.

## Claim language

Use one of: `hypothesis`, `observed`, `decoded`, `validated`, `rejected`, `unknown`.

Use confidence independently: `low`, `medium`, `high`. A high-confidence observation is not automatically a validated implementation.

