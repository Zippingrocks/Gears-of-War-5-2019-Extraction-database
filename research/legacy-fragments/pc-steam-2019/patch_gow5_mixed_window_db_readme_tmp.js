const fs = require("fs");

const dbPath = "D:\\Game Extraction Database\\Gears of War Franchise 2027\\01_KNOWLEDGE_DATABASES\\GOW5_PC\\GOW5_PC_FOLDED_DATABASE.md";
const readmePath = "D:\\Game Extraction Database\\Gears of War Franchise 2027\\02_ACTIVE_TOOLS\\GOW5_PC\\README.md";
const marker = "GOW5_PC_GIRDER_GAP_MIXED_STRUCTURE_WINDOW_PROBE_2026_08_11";

function atomicWrite(file, text) {
  const tmp = `${file}.tmp_${process.pid}`;
  fs.writeFileSync(tmp, text, "utf8");
  fs.renameSync(tmp, file);
}

let db = fs.readFileSync(dbPath, "utf8");
if (!db.includes(marker)) {
  db += `

## 2026-08-11 UTC Gears 5 Girder Gap Mixed-Structure Window Probe - No Exports

Marker: ${marker}

Scope: Gears 5 PC only. Static source-file/report-only parsing through regenerated focused validation reports and the compact native-tail comparator. No live process work, no decoded package payload writes, and no mesh/texture/FBX/OBJ/Blender/UE5/UE exports.

Supersedes / advances:
- Advances \`GOW5_PC_GIRDER_GAP_U16_SUBSTREAM_CLASSIFIER_2026_08_11\` by executing its next target: fixed mixed-structure parsing of \`girder_wall_01a\` windows \`57440..57540\`, \`50908..50920\`, \`54188..54196\`, and \`57472..57480\`.
- Adds \`gap_mixed_structure_window_probe\` under the existing gap stream-boundary report. The probe reads each configured window as u16, i32, u32, and f32; searches for counts \`1635\`, \`1642\`, \`1662\`, \`545\`, \`554\`, \`1692\`, and \`564\`; and tests truncated u16 views before section-table bytes are promoted.
- This is still diagnostic. It does not solve the Gears 5 StaticMesh serializer or prove export-ready geometry.

Tooling/evidence:
- \`02_ACTIVE_TOOLS/GOW5_PC/Gow5B2OodleValidator/AssetProbe.cs\` SHA-256 \`3AE56AA738E616A7E9C9E0EDD75CCFBCEBC6B1D404C7ED966DA68AB1CCB9AA36\`.
- \`02_ACTIVE_TOOLS/GOW5_PC/gow5_staticmesh_native_tail_comparator_noexport.js\` SHA-256 \`373414893FDF7652B363A47E24189DBA27507F5A03A2866EAC35C74DFE193491\`.
- Comparator JSON: \`03_REPORTS_AND_PROOFS/GOW5_PC/NativeTailComparator_NoExport/gow5_staticmesh_native_tail_comparator_foundation_regency_highplacement_2026_08_10.json\` SHA-256 \`783C211AD3BA984C974AE92854D6BC18DBB618A7E53D7E4CC18F14E6ABFE7C64\`.
- Comparator Markdown SHA-256 \`2ECD46A936BF6BA1197A52A3751092BAECE07DF1497BBF7DF7298CDBB52048DB\`.
- Comparator CSV SHA-256 \`5648B08AB571735E07649B191F2162CB56B34E09FA30471591C0D3A021527AF5\`.
- \`highplacement_asset_752137_girder_wall_01a_752137_girder_wall_01a_package_validate.json\` SHA-256 \`389CB08FB8EEA865B6A85A0A7E71E4CED9549492C1E07BF74D5E0E5502090246\`.
- Validation: \`dotnet build Gow5B2OodleValidator.csproj --no-restore\` passed with \`0\` warnings and \`0\` errors. Focused no-export validation report regeneration completed \`16/16\` reports with \`0\` failures. Comparator regeneration still covers \`21\` reports / \`44\` StaticMesh native-tail rows with schema \`gow5_staticmesh_native_tail_comparator_noexport_v4\`.

LOCKED / source-file no-export evidence:
- New report schema under \`gap_stream_boundary_probe.gap_mixed_structure_window_probe\`: \`gow5_static_mesh_gap_mixed_structure_window_probe_v1\`.
- All configured fixed windows are inside the \`girder_wall_01a\` \`43088..66502\` gap.
- The fixed windows contain no direct target-count hits for \`1635\`, \`1642\`, \`1662\`, \`545\`, \`554\`, \`1692\`, or \`564\` when read as aligned u16/i32/u32 words. Count-like values found inside the long u16 runs are data values, not headers in the fixed boundary windows.
- \`57440..57540\` confirms the section-table neighborhood as mixed data:
  - u32/i32 at \`57444\` = \`419\`; \`57448\` = \`65536\`; \`57456\` = \`16842752\`; \`57460\` = \`2\`; \`57472\` = \`163\`; \`57476\` = \`0\`.
  - The known section-like records appear as i32/u32 words from \`57476\`: first record \`[0, 234, 1, 1, 1]\`; second record at \`57496\` \`[489, 108, 235, 402, 1]\`; followed by another \`1\` at \`57516\`.
  - Immediately after \`57520\`, the same window reads plausible f32 bounds-like values: \`52.340454\`, \`387.33228\`, \`72.477905\`, \`458.41672\`, and \`-3.3322754\`. This proves the table/u16 region abuts float metadata and must not be treated as a single pure u16 index stream.
- Boundary \`50908..50920\`: u32 words \`65536\`, \`213123072\`, \`0\`; u16 at \`50914\` = \`3252\`, then run A starts at \`50916\` with \`0, 0\`.
- Boundary \`54188..54196\`: u16 \`0, 3252, 0, 465\`; u32 \`213123072\` then \`30474240\`. This marks a real hard break between run A ending at \`54190\` and run B beginning at \`54192\`.
- Boundary \`57472..57480\`: u32/i32 \`163\` then \`0\`, directly before the section-like record body.
- Truncated run A \`50916..54190\`: \`1637\` u16 values, mod 3 = \`2\`. Skip-two view at \`50920\` is \`1635\` indices / \`545\` triangles, strict-valid and restart-valid, \`185\` degenerate triangles, \`642\` used vertices, min \`0\`, max \`641\`. It is \`57\` indices / \`19\` triangles below the selected \`1692/564\` anchor.
- Truncated run B before the section table \`54192..57476\`: exactly \`1642\` u16 values, target-count match. Skip-one view at \`54194\` is \`1641\` indices / \`547\` triangles, strict-valid and restart-valid, only \`4\` degenerate triangles, \`343\` used vertices, min \`0\`, max \`636\`. It is \`51\` indices / \`17\` triangles below the selected anchor.
- Full contaminated run B \`54192..57520\`: \`1664\` u16 values. Skip-two view at \`54196\` is \`1662\` indices / \`554\` triangles, strict-valid and restart-valid, \`118\` degenerate triangles, \`344\` used vertices. It is \`30\` indices / \`10\` triangles below the selected anchor and includes section-table bytes, so it remains contaminated.

CANDIDATE / not promoted:
- \`54192..57476\` is currently the cleaner run B candidate because it excludes the known section-like i32 table body. Its skip-one triangle-list view has far fewer degenerate triangles than the contaminated \`54192..57520\` view, but it still does not match the selected topology anchor.
- The \`3252\` u16 sentinels at \`50914\` and \`54190\`, plus repeated u32 \`213123072\` near both boundaries, are candidate stream-boundary markers. Their semantics are not decoded.
- The table neighborhood suggests a compact metadata/section region followed by float bounds/resource values, but field names and ownership are unresolved.

UNSOLVED / blocking Blender export:
- No truncated view matches the selected \`girder_wall_01a\` \`1692\` index / \`564\` triangle anchor.
- The exact relationship between run A \`1635/545\`, clean run B \`1641/547\`, contaminated run B \`1662/554\`, and the selected \`1692/564\` anchor is UNSOLVED.
- Source-space positions, UVs, normals/tangents, vertex colors, material binding, and full LOD/resource boundaries remain UNSOLVED. Blender readiness remains \`0/44\` source-space position-ready rows.

Next exact Gears 5 target:
- Add a no-export boundary-marker correlation probe across all gap-probed rows: search for u16 \`3252\`, u32 \`213123072\`, u32 \`65536\`, and nearby i32 record-count/material-count candidates around u16-run starts/ends. The goal is to prove whether \`3252/213123072\` are real stream delimiters or incidental values, then use those delimiters to split \`girder_wall_01a\` into typed substreams before any topology or section promotion.

<!-- END_GOW5_PC_GIRDER_GAP_MIXED_STRUCTURE_WINDOW_PROBE_2026_08_11 -->
`;
  atomicWrite(dbPath, db);
}

let readme = fs.readFileSync(readmePath, "utf8");
readme = readme.replace(
  "gap stream-boundary report probes; writes reports only.",
  "gap stream-boundary, and mixed-structure window report probes; writes reports only."
);
if (!readme.includes(marker)) {
  readme += `
- \`${marker}\` - parsed fixed girder gap windows as u16/i32/u32/f32. Clean run B before the section table is \`54192..57476\` with \`1642\` u16 values; skip-one gives \`1641/547\` strict/restart-valid but still does not match the selected \`1692/564\` anchor.
`;
}
atomicWrite(readmePath, readme);

console.log(`updated ${marker}`);
