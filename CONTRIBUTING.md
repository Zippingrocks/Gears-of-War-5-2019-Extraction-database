# Contributing

Contributions should improve reproducibility, source provenance, or reconstruction coverage.

## Before opening a change

1. Identify the exact game build and source-relative path.
2. State whether the result is observed, decoded, validated, rejected, or still a hypothesis.
3. Include compact evidence that does not contain proprietary payloads.
4. Add or update regression tests for parsers and transforms.
5. Run the repository validator and test suite.

Experimental probes belong under `research/`. Move code into `src/` only when it has deterministic fixtures, explicit failure behavior, and documented format scope.

