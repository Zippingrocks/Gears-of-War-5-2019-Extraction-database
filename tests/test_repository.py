import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_inventory_tool():
    path = ROOT / "tools" / "inventory_b2.py"
    spec = importlib.util.spec_from_file_location("inventory_b2", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("could not load inventory_b2.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class RepositoryContractTests(unittest.TestCase):
    def test_game_metadata_is_gow5_steam(self) -> None:
        metadata = json.loads((ROOT / "game.json").read_text(encoding="utf-8"))
        self.assertEqual(metadata["id"], "gears-5")
        self.assertEqual(metadata["engineFamily"], "Unreal Engine 4")
        self.assertEqual(
            [item["id"] for item in metadata["platforms"]],
            ["pc-steam-build-10731442"],
        )

    def test_claim_ids_match_file_names(self) -> None:
        claims = list((ROOT / "evidence" / "claims").glob("*.json"))
        self.assertEqual(len(claims), 4)
        for path in claims:
            claim = json.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(path.stem, claim["id"])

    def test_native_inventory_counts_and_header(self) -> None:
        inventory = json.loads(
            (
                ROOT
                / "evidence"
                / "native-inventory"
                / "pc-steam-build-10731442"
                / "b2-inventory.json"
            ).read_text(encoding="utf-8")
        )
        self.assertEqual(inventory["b2Index"]["name"], "GearGame.b2index")
        self.assertEqual(inventory["b2Index"]["sizeBytes"], 62688696)
        self.assertEqual(inventory["b2Index"]["header"]["magic"], "TCB2")
        self.assertEqual(inventory["b2Index"]["header"]["u32_0x04_le"], 6)
        self.assertEqual(inventory["containers"]["count"], 141)
        self.assertEqual(inventory["containers"]["totalBytes"], 120453062656)
        names = [entry["name"] for entry in inventory["containers"]["entries"]]
        self.assertEqual(len(names), len(set(names)))
        self.assertEqual(names, sorted(names, key=str.lower))

    def test_header_parser_uses_offset_based_field_name(self) -> None:
        tool = load_inventory_tool()
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixture.b2index"
            path.write_bytes(b"TCB2\x06\x00\x00\x00" + bytes(range(24)))
            header = tool.parse_b2_index_header(path)
        self.assertEqual(header["magic"], "TCB2")
        self.assertEqual(header["u32_0x04_le"], 6)
        self.assertNotIn("version", header)

    def test_legacy_fragments_are_hash_locked(self) -> None:
        manifest = json.loads(
            (ROOT / "inventory" / "legacy-migration.json").read_text(encoding="utf-8")
        )
        self.assertEqual(len(manifest["items"]), 3)
        self.assertTrue(all(item["kind"] == "legacy-patch-fragment" for item in manifest["items"]))


if __name__ == "__main__":
    unittest.main()

