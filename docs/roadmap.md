# Roadmap

## Phase 1: Source inventory

- Lock build identity and complete B2 container inventory.
- Recover or regenerate the missing historical B2/Oodle validation reports.
- Establish synthetic and native-header fixtures without committing payloads.

## Phase 2: B2 grammar

- Decode index header and record tables with offset-level provenance.
- Prove container span ownership and compression block boundaries.
- Validate decompression sizes, checksums, and failure behavior.

## Phase 3: Package and render payloads

- Recover package boundaries and dependency identity.
- Decode StaticMesh positions, indices, sections, UVs, normals, tangents, colors, and material slots.
- Decode skeletal meshes, skin weights, skeletons, animations, and morph data.

## Phase 4: Scene reconstruction

- Enumerate world and streaming roots.
- Resolve actors, components, attachments, constructed components, HLODs, splines, terrain, foliage, decals, lights, and sky layers.
- Prove source-to-Blender basis, units, handedness, and parent composition numerically.

## Phase 5: Coverage and support

- Emit per-map denominators and unresolved-reference ledgers.
- Reconstruct multiple maps without map-specific transform exceptions.
- Promote a build to supported only after reproducible end-to-end fixtures pass.

