# Architecture

The extraction pipeline is deliberately layered so each conclusion can be tested at the boundary that produced it.

1. **Build identity** records store, app, depot, build, executable, and source-root evidence.
2. **B2 inventory** identifies the index and ordered container set without reading asset payloads.
3. **B2 decoding** parses index records, container spans, compression metadata, and integrity fields with offset-level provenance.
4. **Package recovery** reconstructs package bytes and preserves archive and record ownership.
5. **Object decoding** resolves exports, imports, properties, native serialization, bulk data, and dependencies.
6. **Scene IR** records levels, actors, components, attachments, world transforms, asset references, material slots, and exclusions.
7. **Blender conversion** performs one documented basis/unit conversion and emits auditable object metadata.
8. **Coverage accounting** compares discovered, decoded, resolved, instantiated, and deliberately excluded records.

Each layer must fail with source-relative path, byte offset or object identity, expected condition, and actual value. A downstream visual result cannot repair an upstream provenance gap.

## Promotion rule

Research code moves into `src/` only after it has deterministic fixtures, explicit build scope, negative tests, and a written list of unknowns. Offset-based field names remain in place until repeated native evidence proves semantics.

