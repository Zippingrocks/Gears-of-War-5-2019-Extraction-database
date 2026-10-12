const fs = require("fs");

const file = "D:\\Game Extraction Database\\Gears of War Franchise 2027\\02_ACTIVE_TOOLS\\GOW5_PC\\Gow5B2OodleValidator\\AssetProbe.cs";
let text = fs.readFileSync(file, "utf8");

function replaceOnce(search, replacement, label) {
  if (!text.includes(search)) throw new Error(`missing patch target: ${label}`);
  text = text.replace(search, replacement);
}

replaceOnce(
`        var u16Runs = FindGapU16Runs(bytes, source, gapStartRel, gapEndRel, vertexCount);
        var u16Classifications = ClassifyGapU16Runs(bytes, source, gapStartRel, gapEndRel, vertexCount, anchor);
        var partitions = topTables.Select(x => AnalyzeSectionTablePartition(x, anchor)).ToArray();`,
`        var u16Runs = FindGapU16Runs(bytes, source, gapStartRel, gapEndRel, vertexCount);
        var u16Classifications = ClassifyGapU16Runs(bytes, source, gapStartRel, gapEndRel, vertexCount, anchor);
        var mixedStructureWindowProbe = BuildGapMixedStructureWindowProbe(bytes, source, gapStartRel, gapEndRel, vertexCount, anchor);
        var partitions = topTables.Select(x => AnalyzeSectionTablePartition(x, anchor)).ToArray();`,
  "mixed window call"
);

replaceOnce(
`            gap_u16_runs = u16Runs,
            gap_u16_run_classifications = u16Classifications,
            section_table_partition_candidates = partitions,`,
`            gap_u16_runs = u16Runs,
            gap_u16_run_classifications = u16Classifications,
            gap_mixed_structure_window_probe = mixedStructureWindowProbe,
            section_table_partition_candidates = partitions,`,
  "mixed window report field"
);

const mixedFunctions = String.raw`
    private static object BuildGapMixedStructureWindowProbe(byte[] bytes, NativeTailSource source, int gapStartRel, int gapEndRel, int vertexCount, TopologyAnchorSummary anchor)
    {
        var targetCounts = new[] { 1635, 1642, 1662, 545, 554, 1692, 564 };
        var windows = new (string Label, int StartRel, int EndRel)[]
        {
            ("girder_table_context_57440_57540", 57440, 57540),
            ("boundary_before_run_a_50908_50920", 50908, 50920),
            ("boundary_between_runs_54188_54196", 54188, 54196),
            ("boundary_before_section_table_57472_57480", 57472, 57480),
        };
        var truncatedViews = new (string Label, int StartRel, int EndRel)[]
        {
            ("run_a_full_50916_54190", 50916, 54190),
            ("run_b_pre_table_truncated_54192_57476", 54192, 57476),
            ("run_b_full_contaminated_54192_57520", 54192, 57520),
        };

        var windowRows = windows
            .Select(x => BuildGapMixedStructureWindowRow(bytes, source, gapStartRel, gapEndRel, x, targetCounts))
            .ToArray();
        var truncatedRows = truncatedViews
            .Select(x => BuildGapTruncatedU16View(bytes, source, gapStartRel, gapEndRel, vertexCount, anchor, x, targetCounts))
            .ToArray();

        return new
        {
            schema = "gow5_static_mesh_gap_mixed_structure_window_probe_v1",
            purpose = "No-export fixed-window parser for girder_wall_01a gap diagnostics. Windows are viewed as u16/i32/u32/f32, searched for known counts, and truncated u16 views are tested before table bytes are promoted.",
            target_counts = targetCounts,
            gap_start_tail_relative = gapStartRel,
            gap_end_tail_relative = gapEndRel,
            topology_anchor_index_count = anchor.IndexCount,
            topology_anchor_triangle_count = anchor.TriangleCount,
            windows = windowRows,
            truncated_u16_views = truncatedRows,
            interpretation = BuildGapMixedStructureWindowInterpretation(truncatedRows),
        };
    }

    private static object BuildGapMixedStructureWindowRow(byte[] bytes, NativeTailSource source, int gapStartRel, int gapEndRel, (string Label, int StartRel, int EndRel) spec, int[] targetCounts)
    {
        var insideTail = spec.StartRel >= 0 && spec.EndRel >= spec.StartRel && spec.EndRel <= source.Size && source.Offset + spec.EndRel <= bytes.Length;
        var insideGap = spec.StartRel >= gapStartRel && spec.EndRel <= gapEndRel;
        if (!insideTail)
        {
            return new
            {
                label = spec.Label,
                start_tail_relative = spec.StartRel,
                end_tail_relative = spec.EndRel,
                inside_tail = false,
                inside_gap = insideGap,
                reason = "window_not_inside_tail",
            };
        }

        var startAbs = source.Offset + spec.StartRel;
        var byteCount = spec.EndRel - spec.StartRel;
        return new
        {
            label = spec.Label,
            start_tail_relative = spec.StartRel,
            end_tail_relative = spec.EndRel,
            byte_count = byteCount,
            inside_tail = true,
            inside_gap = insideGap,
            hex = Hex(bytes.AsSpan(startAbs, Math.Min(byteCount, 160))),
            u16_words = ReadWindowU16Words(bytes, source, spec.StartRel, spec.EndRel),
            u32_i32_f32_words = ReadWindowU32I32F32Words(bytes, source, spec.StartRel, spec.EndRel),
            target_count_hits = FindWindowTargetCountHits(bytes, source, spec.StartRel, spec.EndRel, targetCounts),
        };
    }

    private static object BuildGapTruncatedU16View(byte[] bytes, NativeTailSource source, int gapStartRel, int gapEndRel, int vertexCount, TopologyAnchorSummary anchor, (string Label, int StartRel, int EndRel) spec, int[] targetCounts)
    {
        var insideTail = spec.StartRel >= 0 && spec.EndRel >= spec.StartRel && spec.EndRel <= source.Size && source.Offset + spec.EndRel <= bytes.Length;
        var insideGap = spec.StartRel >= gapStartRel && spec.EndRel <= gapEndRel;
        if (!insideTail)
        {
            return new
            {
                label = spec.Label,
                start_tail_relative = spec.StartRel,
                end_tail_relative = spec.EndRel,
                inside_tail = false,
                inside_gap = insideGap,
                reason = "view_not_inside_tail",
            };
        }

        var startAbs = source.Offset + spec.StartRel;
        var byteCount = spec.EndRel - spec.StartRel;
        var u16Count = byteCount / 2;
        var values = new List<int>();
        for (var offset = startAbs; offset + 2 <= startAbs + byteCount && offset + 2 <= bytes.Length; offset += 2)
            values.Add(BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(offset, 2)));

        var shiftedViews = new List<object>();
        for (var skip = 0; skip <= 2 && skip < values.Count; skip++)
        {
            var shiftedCount = values.Count - skip;
            object? statsReport = null;
            if (shiftedCount >= 3 && shiftedCount % 3 == 0 && startAbs + skip * 2 + shiftedCount * 2 <= bytes.Length)
                statsReport = AnalyzeU16TriangleListStats(bytes, startAbs + skip * 2, shiftedCount, vertexCount).ToReport();
            shiftedViews.Add(new
            {
                skip_u16_values = skip,
                start_tail_relative = spec.StartRel + skip * 2,
                index_count = shiftedCount,
                triangle_count_if_mod3 = shiftedCount % 3 == 0 ? shiftedCount / 3 : -1,
                count_mod3 = shiftedCount % 3,
                target_count_match = targetCounts.Contains(shiftedCount),
                target_triangle_count_match = shiftedCount % 3 == 0 && targetCounts.Contains(shiftedCount / 3),
                matches_anchor_index_count = shiftedCount == anchor.IndexCount,
                matches_anchor_triangle_count = shiftedCount % 3 == 0 && shiftedCount / 3 == anchor.TriangleCount,
                delta_to_anchor_index_count = shiftedCount - anchor.IndexCount,
                delta_to_anchor_triangle_count = shiftedCount % 3 == 0 ? shiftedCount / 3 - anchor.TriangleCount : 0,
                triangle_list_stats = statsReport,
            });
        }

        return new
        {
            label = spec.Label,
            start_tail_relative = spec.StartRel,
            end_tail_relative = spec.EndRel,
            byte_count = byteCount,
            inside_tail = true,
            inside_gap = insideGap,
            u16_count = u16Count,
            u16_count_mod3 = u16Count % 3,
            target_count_match = targetCounts.Contains(u16Count),
            first24_values = values.Take(24).ToArray(),
            last24_values = values.Skip(Math.Max(0, values.Count - 24)).ToArray(),
            target_count_hits = FindWindowTargetCountHits(bytes, source, spec.StartRel, spec.EndRel, targetCounts),
            shifted_triangle_views = shiftedViews.ToArray(),
        };
    }

    private static object[] ReadWindowU16Words(byte[] bytes, NativeTailSource source, int startRel, int endRel)
    {
        var rows = new List<object>();
        var startAbs = source.Offset + startRel;
        var endAbs = Math.Min(source.Offset + endRel, bytes.Length);
        for (var offset = startAbs; offset + 2 <= endAbs; offset += 2)
        {
            rows.Add(new
            {
                tail_relative_offset = offset - source.Offset,
                byte_offset_in_window = offset - startAbs,
                hex = Hex(bytes.AsSpan(offset, 2)),
                u16 = BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(offset, 2)),
                i16 = BinaryPrimitives.ReadInt16LittleEndian(bytes.AsSpan(offset, 2)),
            });
        }
        return rows.ToArray();
    }

    private static object[] ReadWindowU32I32F32Words(byte[] bytes, NativeTailSource source, int startRel, int endRel)
    {
        var rows = new List<object>();
        var startAbs = source.Offset + startRel;
        var endAbs = Math.Min(source.Offset + endRel, bytes.Length);
        for (var offset = startAbs; offset + 4 <= endAbs; offset += 4)
        {
            var f32 = BitConverter.ToSingle(bytes, offset);
            rows.Add(new
            {
                tail_relative_offset = offset - source.Offset,
                byte_offset_in_window = offset - startAbs,
                hex = Hex(bytes.AsSpan(offset, 4)),
                u32 = BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(offset, 4)),
                i32 = BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(offset, 4)),
                f32 = float.IsFinite(f32) ? f32 : (float?)null,
                f32_nonfinite = !float.IsFinite(f32),
            });
        }
        return rows.ToArray();
    }

    private static object[] FindWindowTargetCountHits(byte[] bytes, NativeTailSource source, int startRel, int endRel, int[] targetCounts)
    {
        var rows = new List<object>();
        var targets = new HashSet<int>(targetCounts);
        var startAbs = source.Offset + startRel;
        var endAbs = Math.Min(source.Offset + endRel, bytes.Length);
        for (var offset = startAbs; offset + 2 <= endAbs; offset += 2)
        {
            var u16 = BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(offset, 2));
            if (targets.Contains(u16))
                rows.Add(new { interpretation = "u16_le", tail_relative_offset = offset - source.Offset, byte_offset_in_window = offset - startAbs, value = u16 });
        }
        for (var offset = startAbs; offset + 4 <= endAbs; offset += 4)
        {
            var i32 = BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(offset, 4));
            var u32 = BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(offset, 4));
            if (targets.Contains(i32))
                rows.Add(new { interpretation = "i32_le", tail_relative_offset = offset - source.Offset, byte_offset_in_window = offset - startAbs, value = i32 });
            if (u32 <= int.MaxValue && targets.Contains((int)u32) && (long)i32 != (long)u32)
                rows.Add(new { interpretation = "u32_le", tail_relative_offset = offset - source.Offset, byte_offset_in_window = offset - startAbs, value = (int)u32 });
        }
        return rows.ToArray();
    }

    private static string BuildGapMixedStructureWindowInterpretation(object[] truncatedRows)
    {
        var serialized = string.Join("\n", truncatedRows.Select(x => x.ToString()));
        return serialized.Contains("matches_anchor_index_count = True", StringComparison.OrdinalIgnoreCase)
            ? "truncated_view_matches_selected_anchor_candidate"
            : "diagnostic_windows_only_no_selected_anchor_match";
    }

`;

replaceOnce(
`    private static object AnalyzeSectionTablePartition(SectionTableSequenceCandidate table, TopologyAnchorSummary anchor)`,
  mixedFunctions + `    private static object AnalyzeSectionTablePartition(SectionTableSequenceCandidate table, TopologyAnchorSummary anchor)`,
  "insert mixed window functions"
);

fs.writeFileSync(file, text, "utf8");
console.log("added gap mixed-structure window probe");
