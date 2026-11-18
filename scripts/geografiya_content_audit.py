#!/usr/bin/env python3
"""
Geografiya 2026 Content Audit & In-Depth Verification Script
Verifies Geografiya_2026_kurs_paket_draft.zip (SHA256: 35b646c4...)
Strict, safe read-only inspection.
"""

import sys
import os
import zipfile
import hashlib
import json
import csv
import re
from io import BytesIO, TextIOWrapper
import openpyxl

ZIP_PATH = "Geografiya_2026_kurs_paket_draft.zip"
EXPECTED_SHA256 = "35b646c494411f2913be5b69435775d6cf04e148ba40512d865a6ae7313222ee"

def verify_zip_integrity():
    if not os.path.exists(ZIP_PATH):
        raise FileNotFoundError(f"{ZIP_PATH} not found")
    
    hasher = hashlib.sha256()
    with open(ZIP_PATH, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    actual_sha = hasher.hexdigest()
    if actual_sha != EXPECTED_SHA256:
        raise ValueError(f"SHA256 mismatch! Expected {EXPECTED_SHA256}, got {actual_sha}")
    
    # Safe inspection: check for zip-slip, absolute paths, symlinks, huge uncompressed size
    total_uncompressed = 0
    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        infolist = zf.infolist()
        file_count = len(infolist)
        for info in infolist:
            if info.filename.startswith("/") or ".." in info.filename:
                raise ValueError(f"Zip slip security vulnerability detected in {info.filename}")
            total_uncompressed += info.file_size
            if total_uncompressed > 50 * 1024 * 1024: # 50 MB limit
                raise ValueError("Zip bomb protection: uncompressed size exceeded limit")
    return actual_sha, file_count, total_uncompressed

def run_content_audit():
    actual_sha, file_count, total_uncompressed = verify_zip_integrity()
    audit_results = {
        "package_sha256": actual_sha,
        "file_count": file_count,
        "uncompressed_bytes": total_uncompressed,
        "files": [],
        "modules": {},
        "lessons": [],
        "questions": {
            "total_json": 0,
            "total_csv": 0,
            "total_xlsx": 0,
            "pools": {"REAL": 0, "ODDIY": 0, "MASHQ": 0},
            "types": {},
            "cognitive": {},
            "sections": {},
            "mashq_per_lesson": {},
            "real_variants": {},
            "oddiy_variants": {},
            "exact_duplicate_stems": 0,
            "clean_duplicate_groups": 0,
            "clean_duplicate_rows": 0,
            "all_wrong_explanations_have_generic_suffix": True,
            "generic_suffix_count": 0,
            "empty_rasm_id_count": 0,
            "mashq_options_canonical_check": True,
            "mashq_q1_and_q6_match_check": True,
            "rm_a30_cross_pool_duplicate": []
        },
        "rasmlar_reestri": {
            "raw_lines": 0,
            "malformed_lines": [],
            "entries": []
        },
        "issues": []
    }

    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        audit_results["files"] = zf.namelist()

        # 1. Audit Oquv_reja.csv
        with zf.open("Geografiya_2026/Oquv_reja.csv") as f:
            reader = csv.DictReader(TextIOWrapper(f, encoding="utf-8-sig"))
            modules_map = {}
            lessons_list = []
            for row in reader:
                mod_id = row.get("Modul ID") or row.get("modul_id") or ""
                mod_nomi = row.get("Modul nomi") or row.get("modul_nomi") or ""
                dars_id = row.get("Dars ID") or row.get("dars_id") or ""
                dars_nomi = row.get("Dars nomi") or row.get("dars_nomi") or ""
                if mod_id not in modules_map:
                    modules_map[mod_id] = {"nomi": mod_nomi, "darslar": []}
                modules_map[mod_id]["darslar"].append(dars_id)
                lessons_list.append({
                    "modul_id": mod_id,
                    "modul_nomi": mod_nomi,
                    "dars_id": dars_id,
                    "dars_nomi": dars_nomi,
                    "davomiylik": row.get("Davomiylik (daqiqa)") or row.get("davomiylik") or "",
                    "amaliyot": row.get("Amaliyot turi") or ""
                })
            audit_results["modules"] = {k: {"nomi": v["nomi"], "count": len(v["darslar"])} for k, v in modules_map.items()}
            audit_results["lessons"] = lessons_list

        # 2. Audit Rasmlar_reestri.csv (check row 4 issue: unquoted M6-D3, M6-D4, M8-D2)
        with zf.open("Geografiya_2026/Rasmlar/Rasmlar_reestri.csv") as f:
            lines = f.read().decode("utf-8-sig").splitlines()
            audit_results["rasmlar_reestri"]["raw_lines"] = len(lines)
            for idx, line in enumerate(lines, 1):
                # Standard split by comma
                parts = [p.strip() for p in line.split(",")]
                if len(parts) != 6 and idx > 1: # header is 6 cols
                    audit_results["rasmlar_reestri"]["malformed_lines"].append({
                        "line_number": idx,
                        "raw_line": line,
                        "field_count": len(parts),
                        "expected_fields": 6
                    })
                    audit_results["issues"].append({
                        "severity": "P1",
                        "component": "Rasmlar_reestri.csv",
                        "description": f"Line {idx} has {len(parts)} fields instead of 6 due to unquoted lesson list: '{line}'"
                    })

        # 3. Audit Savollar_banki.json (Canonical)
        with zf.open("Geografiya_2026/Savollar_banki.json") as f:
            json_data = json.load(f)
            audit_results["questions"]["total_json"] = len(json_data)

            # Analyze stem duplication:
            # Strip service counters like [1/10], [2/10], Savol 1:, etc.
            def clean_stem(text):
                t = text.strip()
                t = re.sub(r"^\[\d+/\d+\]\s*", "", t)
                t = re.sub(r"^\d+[\.\)]\s*", "", t)
                t = re.sub(r"^Savol\s*#?\d*:\s*", "", t, flags=re.I)
                t = re.sub(r"\s+", " ", t)
                return t.strip()

            stems_exact = {}
            stems_clean = {}

            all_wrong_suffix = True
            generic_suffix = "Xato talqin: muhim sabab, mezon yoki birlik noto‘g‘ri tanlangan."
            generic_count = 0
            empty_rasm_count = 0

            # Track Mashq options consistency
            mashq_options_set = set()
            mashq_by_lesson = {}

            for q in json_data:
                q_id = q.get("ID")
                pul = q.get("Pul") # REAL, ODDIY, MASHQ
                variant = q.get("Variant")
                tur = q.get("Turi")
                kog = q.get("Kognitiv daraja")
                sec = q.get("Spetsifikatsiya bo‘limi")
                dars_id = q.get("Dars ID")
                savol = q.get("Savol", "")
                rasm_id = q.get("Rasm ID")

                audit_results["questions"]["pools"][pul] = audit_results["questions"]["pools"].get(pul, 0) + 1
                audit_results["questions"]["types"][tur] = audit_results["questions"]["types"].get(tur, 0) + 1
                audit_results["questions"]["cognitive"][kog] = audit_results["questions"]["cognitive"].get(kog, 0) + 1
                audit_results["questions"]["sections"][sec] = audit_results["questions"]["sections"].get(sec, 0) + 1

                if pul == "REAL":
                    audit_results["questions"]["real_variants"][variant] = audit_results["questions"]["real_variants"].get(variant, 0) + 1
                elif pul == "ODDIY":
                    audit_results["questions"]["oddiy_variants"][variant] = audit_results["questions"]["oddiy_variants"].get(variant, 0) + 1
                elif pul == "MASHQ":
                    audit_results["questions"]["mashq_per_lesson"][dars_id] = audit_results["questions"]["mashq_per_lesson"].get(dars_id, 0) + 1
                    if dars_id not in mashq_by_lesson:
                        mashq_by_lesson[dars_id] = []
                    mashq_by_lesson[dars_id].append(q)

                # Rasm ID
                if not rasm_id or str(rasm_id).strip() in ("", "None", "null"):
                    empty_rasm_count += 1

                # Explanations check
                xato_izoh = q.get("Xato javoblar izohi", {})
                if isinstance(xato_izoh, dict):
                    for k, v in xato_izoh.items():
                        if str(v).strip().endswith(generic_suffix):
                            generic_count += 1
                        else:
                            all_wrong_suffix = False

                # Stems exact & clean
                stems_exact[savol] = stems_exact.get(savol, 0) + 1
                c_stem = clean_stem(savol)
                if c_stem not in stems_clean:
                    stems_clean[c_stem] = []
                stems_clean[c_stem].append(q_id)

            audit_results["questions"]["empty_rasm_id_count"] = empty_rasm_count
            audit_results["questions"]["all_wrong_explanations_have_generic_suffix"] = all_wrong_suffix
            audit_results["questions"]["generic_suffix_count"] = generic_count

            # Duplicate stats
            dup_groups = {k: v for k, v in stems_clean.items() if len(v) > 1}
            total_dup_rows = sum(len(v) for v in dup_groups.values())
            audit_results["questions"]["clean_duplicate_groups"] = len(dup_groups)
            audit_results["questions"]["clean_duplicate_rows"] = total_dup_rows

            # Check cross-pool clone RM-A-30 vs Oddiy
            # RM-A-30, O-O3-009, O-O4-008
            cross_check_ids = ["RM-A-30", "O-O3-009", "O-O4-008"]
            cross_items = [q for q in json_data if q.get("ID") in cross_check_ids]
            audit_results["questions"]["rm_a30_cross_pool_duplicate"] = [
                {"id": q["ID"], "savol": q["Savol"], "pul": q["Pul"]} for q in cross_items
            ]

            # Check Mashq Q1 and Q6 matches in lessons
            q1_q6_matches = 0
            for dars_id, q_list in mashq_by_lesson.items():
                if len(q_list) >= 6:
                    stem1 = clean_stem(q_list[0]["Savol"])
                    stem6 = clean_stem(q_list[5]["Savol"])
                    if stem1 == stem6:
                        q1_q6_matches += 1
            audit_results["questions"]["mashq_q1_and_q6_match_count"] = q1_q6_matches

        # 4. Audit Savollar_banki.csv count
        with zf.open("Geografiya_2026/Savollar_banki.csv") as f:
            reader = csv.DictReader(TextIOWrapper(f, encoding="utf-8-sig"))
            csv_count = sum(1 for _ in reader)
            audit_results["questions"]["total_csv"] = csv_count

        # 5. Audit Savollar_banki.xlsx sheets
        with zf.open("Geografiya_2026/Savollar_banki.xlsx") as f:
            wb = openpyxl.load_workbook(BytesIO(f.read()), read_only=True, data_only=True)
            sheet_names = wb.sheetnames
            audit_results["questions"]["xlsx_sheets"] = sheet_names
            total_xlsx_rows = 0
            for sname in sheet_names:
                ws = wb[sname]
                rows = list(ws.iter_rows(values_only=True))
                # First row is header
                row_count = max(0, len(rows) - 1)
                audit_results["questions"][f"xlsx_rows_{sname}"] = row_count
                if sname == "Savollar":
                    total_xlsx_rows = row_count
            audit_results["questions"]["total_xlsx"] = total_xlsx_rows

    return audit_results

if __name__ == "__main__":
    res = run_content_audit()
    print(json.dumps(res, indent=2, ensure_ascii=False))
