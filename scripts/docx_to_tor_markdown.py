from __future__ import annotations

import re
from pathlib import Path

from docx import Document
from docx.document import Document as DocumentType
from docx.table import Table, _Cell
from docx.text.paragraph import Paragraph
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P


ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "docs" / "tor" / "TOR_Buddhist_Art_MFU_PostTermSale.docx"
OUT = ROOT / "docs" / "tor" / "TOR_Buddhist_Art_MFU_PostTermSale.md"

FIGURES = [
    ("../../screenshots/08_admin_submissions.png", "Admin — รายการ Submission และการค้นหา/กรองงาน"),
    ("../../screenshots/manual/admin_02_artworks.png", "Admin — รายการจัดการผลงานศิลปะ"),
    ("../../screenshots/manual/admin_01_overview_a.png", "Admin — Dashboard ภาพรวม"),
    ("../../screenshots/manual/admin_04_submission_detail.png", "Admin — รายละเอียด Submission/การมอบหมายงาน"),
    ("../../screenshots/manual/admin_05_orders.png", "Admin — รายการคำสั่งซื้อ"),
    ("../../screenshots/manual/admin_06_users.png", "Admin — จัดการผู้ใช้งาน"),
    ("../../screenshots/manual/admin_07_news.png", "Admin — จัดการข่าวสาร"),
    ("../../screenshots/manual/admin_08_artwork_create_modal.png", "Admin — Modal สร้าง/นำเข้าผลงาน"),
    ("../../screenshots/manual/artist_01_profile_a.png", "Artist — โปรไฟล์และผลงานของศิลปิน"),
    ("../../screenshots/manual/artist_02_submissions.png", "Artist — รายการ Submission"),
    ("../../screenshots/manual/artist_03_submission_detail.png", "Artist — รายละเอียด Submission"),
    ("../../screenshots/manual/cust_02_orders.png", "Customer — ประวัติคำสั่งซื้อ"),
    ("../../screenshots/manual/pub_01_home_a.png", "Public — หน้าแรกและผลงานเด่น"),
    ("../../screenshots/manual/pub_02_artworks_a.png", "Public — แคตตาล็อก/ตัวกรองผลงาน"),
    ("../../screenshots/manual/pub_03_artwork_detail_a.png", "Public — รายละเอียดผลงาน"),
    ("../../screenshots/manual/pub_04_news.png", "Public — ข่าวสาร"),
    ("../../screenshots/manual/pub_08_payment.png", "Public/Customer — ขั้นตอนชำระเงิน"),
    ("../../screenshots/manual/pub_09_login_dialog.png", "Public — Dialog เข้าสู่ระบบ"),
]


def iter_blocks(parent):
    if isinstance(parent, DocumentType):
        parent_elm = parent.element.body
    elif isinstance(parent, _Cell):
        parent_elm = parent._tc
    else:
        raise ValueError(parent)
    for child in parent_elm.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl):
            yield Table(child, parent)


def clean_text(text: str) -> str:
    text = re.sub(r"\s+Back to TOC\s*", "", text or "")
    text = text.replace("\u00a0", " ").strip()
    return text


def md_cell(value: str) -> str:
    return clean_text(value).replace("|", "\\|").replace("\n", "<br>")


def table_to_md(table: Table) -> list[str]:
    rows = []
    for row in table.rows:
        rows.append([md_cell(cell.text) for cell in row.cells])
    if not rows:
        return []
    width = max(len(row) for row in rows)
    rows = [row + [""] * (width - len(row)) for row in rows]
    out = ["| " + " | ".join(rows[0]) + " |", "| " + " | ".join(["---"] * width) + " |"]
    out.extend("| " + " | ".join(row) + " |" for row in rows[1:])
    return out


def make_markdown():
    doc = Document(str(DOCX))
    out: list[str] = []
    out.extend([
        "---",
        "title: \"ข้อกำหนดขอบเขตของงาน (TOR) ระบบ Buddhist Art MFU\"",
        "author: \"Buddhist Art MFU\"",
        "date: \"18 สิงหาคม 2569\"",
        "lang: th",
        "---",
        "",
        "# ข้อกำหนดขอบเขตของงาน (Terms of Reference: TOR)",
        "## ระบบบริหารจัดการและจัดแสดงผลงานพุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง",
        "### ฉบับระบบปัจจุบันและฟีเจอร์การขายหลังครบ 1 ปี",
        "",
        "![หน้าแรกของระบบ Buddhist Art MFU](../../screenshots/manual/pub_01_home_a.png)",
        "",
        "> จัดทำจากการตรวจ source code, API, database model, workflow, test suite และหน้าจอจริง",
        "> วันที่จัดทำ: 18 สิงหาคม 2569",
        "",
    ])

    started = False
    figure_no = 0
    for block in iter_blocks(doc):
        if isinstance(block, Table):
            if started:
                out.extend(table_to_md(block))
                out.append("")
            continue

        text = clean_text(block.text)
        style = block.style.name if block.style else ""

        # Skip the DOCX cover, because Markdown cover is authored above.
        if not started:
            if text == "คำนำ":
                started = True
            else:
                continue

        if not text:
            continue

        if style == "CaptionThai" and text.startswith("ภาพที่"):
            figure_no += 1
            if figure_no <= len(FIGURES):
                image, alt = FIGURES[figure_no - 1]
                out.append(f"![ภาพที่ {figure_no} {alt}]({image})")
                out.append("")
            out.append(f"*{text}*")
            out.append("")
            continue

        if style == "Heading 1":
            out.extend([f"# {text}", ""])
        elif style == "Heading 2":
            out.extend([f"## {text}", ""])
        elif style == "Heading 3":
            out.extend([f"### {text}", ""])
        elif style.startswith("List Bullet"):
            indent = "  " if style.endswith("2") else ""
            out.append(f"{indent}- {text}")
        elif style.startswith("List Number"):
            out.append(f"1. {text}")
        else:
            out.extend([text, ""])

    # Make sure the Markdown has a clear final note even if the DOCX changes later.
    out.extend([
        "",
        "> หมายเหตุ: ภาพประกอบเป็นภาพหน้าจอจากระบบจริงในสภาพแวดล้อมทดสอบ ข้อมูลในภาพอาจเป็นข้อมูลตัวอย่าง",
        "",
    ])
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"created {OUT} ({len(out)} lines, {figure_no} figures)")


if __name__ == "__main__":
    make_markdown()
