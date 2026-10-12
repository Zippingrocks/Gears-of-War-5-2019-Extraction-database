const fs = require("fs");

const file = "D:\\Game Extraction Database\\Gears of War Franchise 2027\\02_ACTIVE_TOOLS\\GOW5_PC\\Gow5B2OodleValidator\\AssetProbe.cs";
let text = fs.readFileSync(file, "utf8");

function replaceOnce(search, replacement, label) {
  if (!text.includes(search)) throw new Error(`missing patch target: ${label}`);
  text = text.replace(search, replacement);
}

replaceOnce(
`        var truncatedRows = truncatedViews
            .Select(x => BuildGapTruncatedU16View(bytes, source, gapStartRel, gapEndRel, vertexCount, anchor, x, targetCounts))
            .ToArray();

        return new`,
`        var truncatedRows = truncatedViews
            .Select(x => BuildGapTruncatedU16View(bytes, source, gapStartRel, gapEndRel, vertexCount, anchor, x, targetCounts))
            .ToArray();
        var anySelectedAnchorCountMatch = truncatedViews.Any(x =>
        {
            var count = Math.Max(0, (x.EndRel - x.StartRel) / 2);
            for (var skip = 0; skip <= 2 && skip < count; skip++)
            {
                var shiftedCount = count - skip;
                if (shiftedCount == anchor.IndexCount)
                    return true;
                if (shiftedCount % 3 == 0 && shiftedCount / 3 == anchor.TriangleCount)
                    return true;
            }
            return false;
        });

        return new`,
  "add deterministic interpretation bool"
);

replaceOnce(
`            truncated_u16_views = truncatedRows,
            interpretation = BuildGapMixedStructureWindowInterpretation(truncatedRows),`,
`            truncated_u16_views = truncatedRows,
            interpretation = BuildGapMixedStructureWindowInterpretation(anySelectedAnchorCountMatch),`,
  "use deterministic interpretation bool"
);

replaceOnce(
`    private static string BuildGapMixedStructureWindowInterpretation(object[] truncatedRows)
    {
        var serialized = string.Join("\\n", truncatedRows.Select(x => x.ToString()));
        return serialized.Contains("matches_anchor_index_count = True", StringComparison.OrdinalIgnoreCase)
            ? "truncated_view_matches_selected_anchor_candidate"
            : "diagnostic_windows_only_no_selected_anchor_match";
    }`,
`    private static string BuildGapMixedStructureWindowInterpretation(bool anySelectedAnchorCountMatch)
    {
        return anySelectedAnchorCountMatch
            ? "truncated_view_matches_selected_anchor_candidate"
            : "diagnostic_windows_only_no_selected_anchor_match";
    }`,
  "deterministic interpretation helper"
);

fs.writeFileSync(file, text, "utf8");
console.log("fixed mixed window interpretation helper");
