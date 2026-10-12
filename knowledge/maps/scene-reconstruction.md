# Scene Reconstruction Contract

A map is not complete because its largest static meshes appear in Blender.

Each reconstruction must account for:

- world and streaming roots;
- archive and package closure;
- actors, components, ownership, attachments, and construction-created components;
- static, instanced, hierarchical, skeletal, dynamic, spline, foliage, terrain, and HLOD geometry;
- source asset resolution and LOD/section identity;
- materials, textures, decals, particles, lights, lightmaps, reflection data, and sky layers;
- native local/world transforms and one documented Blender conversion;
- unresolved references, deliberate exclusions, and duplicate/superseded records.

Coverage reports must expose discovered, decoded, resolved, instantiated, excluded, and failed counts for every layer. A visual screenshot is corroboration, not a denominator.

