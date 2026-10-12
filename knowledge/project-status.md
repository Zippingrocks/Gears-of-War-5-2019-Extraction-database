# Project Status

Status: **research**. No complete map exporter is currently validated.

## Proven

- Steam app/build and executable identity for the recorded local source build.
- B2 content root, index filename, container count, and aggregate byte counts.
- `TCB2` index magic and the little-endian value `6` at offset `0x04`.
- Reproducible metadata-only inventory generation without copying game payloads.

## Preserved but not promoted

- Three historical patch scripts for a missing `Gow5B2OodleValidator` research tree.
- Embedded notes about `girder_wall_01a`, mixed native-tail windows, and candidate topology runs.
- Referenced hashes and report names whose target files are not currently available.

These fragments prove prior investigation existed. They do not independently validate the missing implementation or reports.

## Hard blockers

1. Recover or regenerate the historical validator and focused reports.
2. Decode the B2 index record grammar and container block ownership.
3. Prove decompression and package reconstruction across varied containers.
4. Decode complete StaticMesh render payloads with material sections.
5. Enumerate world roots, streaming closure, actors, and component attachments.
6. Prove world-transform composition and Blender basis conversion numerically.
7. Account for constructed components, HLODs, terrain, foliage, splines, skeletal actors, decals, particles, lighting, and sky layers.
8. Produce per-map coverage denominators and unresolved-reference ledgers.

## Next exact target

Decode the `TCB2` index header and top-level record tables using repeated structural evidence across the recorded index. Do not assign semantic field names until offsets, counts, and referenced ranges agree.

