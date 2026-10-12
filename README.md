# Gears 5 (2019) Extraction Database

An evidence-driven extraction foundation for reconstructing Gears 5 maps and assets from native PC data in Blender.

Native container, package, object, and transform metadata are the source of truth. A plausible viewport result is useful validation, but it is not proof of container membership, package closure, component transforms, render payloads, materials, or completeness.

## Verified source scope

| Platform | Build evidence | Native content root | Proven anchors |
| --- | --- | --- | --- |
| Windows PC Steam | App `1097840`, build `10731442`, executable `1.1.122.0` | `GearGame/Content/B2` | `GearGame.b2index`, 141 `.b2container` files |

This repository is scoped to the evidence recorded for that build. Additional builds must declare their own platform identity and validation fixtures.

## Repository map

| Path | Purpose |
| --- | --- |
| `src/` | Maintained readers, scene contracts, and Blender adapters after promotion |
| `tools/` | Reproducible inventory and repository validation tools |
| `platforms/` | Build-specific source and serialization contracts |
| `knowledge/` | Curated conclusions, unknowns, and reconstruction requirements |
| `evidence/` | Machine-readable claims and compact proof reports |
| `research/` | Historical fragments and experimental probes |
| `inventory/` | Migration and provenance manifests |
| `schemas/` | Contracts for game metadata and evidence claims |
| `tests/` | Repository, evidence, and parser regression tests |
| `docs/` | Architecture, policy, workflow, and roadmap |

Game containers, packages, extracted meshes, textures, `.blend`, FBX, GLTF, OBJ, audio, and video remain external. Git contains source, hashes, native identifiers, compact reports, and measured conclusions.

## Current state

- The verified Steam installation contains one 62,688,696-byte `GearGame.b2index` and 141 `.b2container` files totaling 120,453,062,656 bytes.
- The index begins with ASCII `TCB2`; the little-endian 32-bit value at offset `0x04` is `6`.
- `tools/inventory_b2.py` reproduces the sanitized container inventory without copying payload data into the repository.
- Three surviving patch scripts document prior B2/Oodle and StaticMesh native-tail investigation. Their target source tree and generated reports are currently unavailable, so they remain historical fragments rather than maintained implementation.
- Container record semantics, compression block ownership, package extraction, StaticMesh render buffers, object placement, materials, textures, skeletal data, animation, lighting, terrain, and complete map closure are not yet validated end to end.

See [Project Status](knowledge/project-status.md), [B2 Format Notes](knowledge/formats/b2.md), [Architecture](docs/architecture.md), and [Evidence Standard](docs/evidence-standard.md).

## Working rules

1. Preserve native archive, package, export, actor, component, attachment, and material identity.
2. Separate container discovery, byte decoding, package parsing, scene extraction, and Blender conversion.
3. Record build identity, source-relative paths, byte offsets, hashes, and tool revision.
4. Give unknown fields offset-based names until native evidence proves their meaning.
5. Track every visual layer independently; a static-mesh list is not map completeness.
6. Report unresolved references, missing payloads, blank components, and deliberate exclusions.
7. Keep generated exports reproducible and disposable.

## Legal boundary

This repository does not distribute proprietary game data. Users must provide legally obtained files locally. See [Asset Policy](docs/asset-policy.md) and [Notice](NOTICE.md).

