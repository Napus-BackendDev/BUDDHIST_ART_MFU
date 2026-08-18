from __future__ import annotations

import os
import shutil
from pathlib import Path

from PIL import Image, ImageOps
from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.enum.style import WD_STYLE_TYPE
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "tor"
OUT_DIR.mkdir(parents=True, exist_ok=True)
IMG_DIR = OUT_DIR / "optimized"
IMG_DIR.mkdir(parents=True, exist_ok=True)
OUT = OUT_DIR / "TOR_Buddhist_Art_MFU_PostTermSale.docx"

BLUE = "2E74B5"
DARK_BLUE = "1F4D78"
MAROON = "6E2B24"
GOLD = "D6A62C"
LIGHT = "F2F4F7"
MID = "D9E2F3"
GREY = "5B6573"


def set_cell_shading(cell, fill: str):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def set_cell_border(cell, color="D9E2F3", sz="6"):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = qn(f"w:{edge}")
        element = borders.find(tag)
        if element is None:
            element = OxmlElement(f"w:{edge}")
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), sz)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def repeat_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_cell_text(cell, text, bold=False, color=None, size=9.5):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(str(text))
    r.bold = bold
    r.font.name = "Calibri"
    r._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    r.font.size = Pt(size)
    if color:
        r.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    set_cell_margins(cell)
    set_cell_border(cell)


def add_table(doc, headers, rows, widths=None, font_size=9.2):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    hdr = table.rows[0]
    repeat_header(hdr)
    for idx, h in enumerate(headers):
        set_cell_text(hdr.cells[idx], h, bold=True, color=DARK_BLUE, size=font_size)
        set_cell_shading(hdr.cells[idx], LIGHT)
        if widths:
            hdr.cells[idx].width = Inches(widths[idx])
    for row in rows:
        cells = table.add_row().cells
        for idx, val in enumerate(row):
            set_cell_text(cells[idx], val, size=font_size)
            if widths:
                cells[idx].width = Inches(widths[idx])
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_page_field(paragraph):
    run = paragraph.add_run()
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_begin, instr, fld_sep, text, fld_end])


def set_alt_text(inline, title, description):
    doc_pr = inline._inline.docPr
    doc_pr.set("title", title)
    doc_pr.set("descr", description)


def style_doc(doc: Document):
    sec = doc.sections[0]
    sec.page_width = Inches(8.5)
    sec.page_height = Inches(11)
    sec.top_margin = Inches(0.85)
    sec.bottom_margin = Inches(0.75)
    sec.left_margin = Inches(0.9)
    sec.right_margin = Inches(0.9)
    sec.header_distance = Inches(0.35)
    sec.footer_distance = Inches(0.35)
    sec.different_first_page_header_footer = True

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = RGBColor.from_string("263238")
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.1

    for name, size, color, before, after in [
        ("Heading 1", 16, BLUE, 16, 8),
        ("Heading 2", 13, BLUE, 12, 6),
        ("Heading 3", 11.5, DARK_BLUE, 8, 4),
    ]:
        st = doc.styles[name]
        st.font.name = "Calibri"
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = RGBColor.from_string(color)
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(after)
        st.paragraph_format.keep_with_next = True

    if "CaptionThai" not in [s.name for s in doc.styles]:
        st = doc.styles.add_style("CaptionThai", WD_STYLE_TYPE.PARAGRAPH)
        st.base_style = doc.styles["Normal"]
    else:
        st = doc.styles["CaptionThai"]
    st.font.name = "Calibri"
    st._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    st.font.size = Pt(9)
    st.font.italic = True
    st.font.color.rgb = RGBColor.from_string(GREY)
    st.paragraph_format.space_before = Pt(3)
    st.paragraph_format.space_after = Pt(10)
    st.paragraph_format.keep_with_next = True

    header = sec.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hr = hp.add_run("BUDDHIST ART MFU  |  TOR")
    hr.font.name = "Calibri"
    hr.font.size = Pt(8)
    hr.font.color.rgb = RGBColor.from_string(GREY)
    footer = sec.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fr = fp.add_run("Buddhist Art MFU  •  เอกสารข้อกำหนดขอบเขตของงาน  •  หน้า ")
    fr.font.name = "Calibri"
    fr.font.size = Pt(8)
    fr.font.color.rgb = RGBColor.from_string(GREY)
    add_page_field(fp)


def add_para(doc, text="", bold_prefix=None, style=None, align=None, color=None):
    p = doc.add_paragraph(style=style)
    if align:
        p.alignment = align
    if bold_prefix and text.startswith(bold_prefix):
        r = p.add_run(bold_prefix)
        r.bold = True
        r.font.color.rgb = RGBColor.from_string(color or "263238")
        p.add_run(text[len(bold_prefix):])
    else:
        r = p.add_run(text)
        if color:
            r.font.color.rgb = RGBColor.from_string(color)
    return p


def bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
    p.paragraph_format.space_after = Pt(3)
    p.add_run(text)
    return p


def numbered(doc, text):
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.space_after = Pt(3)
    p.add_run(text)
    return p


def callout(doc, title, body, fill="EAF2F8"):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.12)
    p.paragraph_format.right_indent = Inches(0.12)
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.08
    p_pr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    p_pr.append(shd)
    pbdr = OxmlElement("w:pBdr")
    for edge in ("top", "left", "bottom", "right"):
        e = OxmlElement(f"w:{edge}")
        e.set(qn("w:val"), "single")
        e.set(qn("w:sz"), "8")
        e.set(qn("w:space"), "4")
        e.set(qn("w:color"), "B7C9E2")
        pbdr.append(e)
    p_pr.append(pbdr)
    r = p.add_run(title)
    r.bold = True
    r.font.color.rgb = RGBColor.from_string(DARK_BLUE)
    p.add_run("\n" + body)


def optimized_image(source: Path) -> Path:
    target = IMG_DIR / (source.stem + ".jpg")
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return target
    with Image.open(source) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        max_w = 1500
        if im.width > max_w:
            im.thumbnail((max_w, max_w), Image.Resampling.LANCZOS)
        im.save(target, "JPEG", quality=84, optimize=True, progressive=True)
    return target


def figure(doc, source: Path, caption: str, number: int, width=6.25):
    if not source.exists():
        callout(doc, "ไม่พบไฟล์ภาพ", str(source), fill="FFF4E5")
        return
    img = optimized_image(source)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    inline = run.add_picture(str(img), width=Inches(width))
    set_alt_text(inline, f"ภาพที่ {number} {caption}", "ภาพหน้าจอจากระบบ Buddhist Art MFU ที่จับจากการรัน local application")
    cp = doc.add_paragraph(style="CaptionThai")
    cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cp.add_run(f"ภาพที่ {number}  {caption}\n")
    sr = cp.add_run("แหล่งภาพ: capture จากระบบจริงในสภาพแวดล้อมทดสอบ (viewport 1,440 × 900 px)")
    sr.font.size = Pt(8)
    sr.font.color.rgb = RGBColor.from_string(GREY)


def source_path(rel):
    return ROOT / rel


def build():
    doc = Document()
    style_doc(doc)

    # Cover
    cover = doc.sections[0]
    cover.different_first_page_header_footer = True
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(20)
    logo_inline = p.add_run().add_picture(str(ROOT / "frontend" / "src" / "assets" / "logo.png"), width=Inches(1.0))
    set_alt_text(logo_inline, "ตราสัญลักษณ์มหาวิทยาลัยแม่ฟ้าหลวง", "ตราสัญลักษณ์หน่วยงานบนหน้าปก")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    r = p.add_run("ข้อกำหนดขอบเขตของงาน\n")
    r.bold = True; r.font.size = Pt(24); r.font.color.rgb = RGBColor.from_string(MAROON)
    r = p.add_run("Terms of Reference (TOR)")
    r.bold = True; r.font.size = Pt(18); r.font.color.rgb = RGBColor.from_string(GOLD)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(18)
    r = p.add_run("ระบบบริหารจัดการและจัดแสดงผลงานพุทธศิลป์\nมหาวิทยาลัยแม่ฟ้าหลวง")
    r.bold = True; r.font.size = Pt(20); r.font.color.rgb = RGBColor.from_string(DARK_BLUE)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    r = p.add_run("ฉบับระบบปัจจุบันและฟีเจอร์การขายหลังครบ 1 ปี")
    r.font.size = Pt(14); r.font.color.rgb = RGBColor.from_string(GREY)
    hero = source_path("screenshots/manual/pub_01_home_a.png")
    if hero.exists():
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(); inline = run.add_picture(str(optimized_image(hero)), width=Inches(6.15))
        set_alt_text(inline, "หน้าแรกของระบบ Buddhist Art MFU", "ภาพหน้าแรกเว็บไซต์จริง")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    r = p.add_run("จัดทำจากการตรวจ source code, API, database model, workflow, test suite และหน้าจอจริง\n")
    r.font.size = Pt(10); r.font.color.rgb = RGBColor.from_string(GREY)
    r = p.add_run("วันที่จัดทำ: 18 สิงหาคม 2569")
    r.font.size = Pt(10); r.font.color.rgb = RGBColor.from_string(GREY)
    doc.add_page_break()

    # Preface
    doc.add_heading("คำนำ", level=1)
    add_para(doc, "เอกสารข้อกำหนดขอบเขตของงาน (Terms of Reference: TOR) ฉบับนี้จัดทำขึ้นเพื่ออธิบายขอบเขต ความสามารถ และข้อกำหนดของระบบบริหารจัดการและจัดแสดงผลงานพุทธศิลป์ มหาวิทยาลัยแม่ฟ้าหลวง ให้ผู้บริหาร ผู้ดูแลระบบ ศิลปิน ผู้ซื้อ และผู้พัฒนาระบบใช้เป็นเอกสารอ้างอิงร่วมกัน")
    add_para(doc, "เนื้อหาครอบคลุมการทำงานของเว็บไซต์สาธารณะ พอร์ทัลศิลปิน งานของผู้ซื้อและคำสั่งซื้อ แผงควบคุมผู้ดูแลระบบ การจัดการผู้ใช้ ผลงาน ข่าวสาร การส่งผลงาน การอนุมัติ การรับชำระเงิน/หลักฐาน และกติกาใหม่เรื่อง “การขายหลังครบ 1 ปี” รวมถึงข้อกำหนดด้านข้อมูล API ความปลอดภัย การตรวจสอบย้อนหลัง และการทดสอบ")
    add_para(doc, "ภาพหน้าจอในเอกสารมาจากการ capture ระบบจริงใน local environment ของโครงการ โดยใช้เป็นหลักฐานประกอบการอธิบาย UI และ workflow ไม่ใช่ภาพ mockup หากข้อมูลทดสอบไม่มีรายการในบางสถานะ จะระบุข้อจำกัดไว้ในคำบรรยายภาพและภาคผนวก")
    callout(doc, "สถานะเอกสาร", "ใช้เป็น TOR เชิงระบบและเอกสารส่งมอบเชิงเทคนิค โดยแยก “ฟังก์ชันที่ตรวจพบในระบบปัจจุบัน” ออกจาก “ข้อกำหนดที่ต้องยืนยันเชิงธุรกิจ/นโยบาย” เพื่อไม่ตีความเกินหลักฐาน")
    doc.add_page_break()

    # Table of contents (deterministic outline; page numbers are resolved by Word's layout)
    doc.add_heading("สารบัญ", level=1)
    toc_entries = [
        ("คำนำ", 0), ("บทสรุปผู้บริหาร", 0), ("1. หลักการและเหตุผล", 0), ("2. วัตถุประสงค์", 0),
        ("3. ขอบเขตงานและภาพรวมสถาปัตยกรรม", 0), ("4. กลุ่มผู้ใช้งานและสิทธิ์", 0),
        ("5. ข้อกำหนดด้านฟังก์ชัน", 0), ("5.1 เว็บไซต์สาธารณะและแคตตาล็อก", 1),
        ("5.2 บัญชีผู้ใช้และการยืนยันตัวตน", 1), ("5.3 Artist portal และ Submission", 1),
        ("5.4 Admin dashboard และการจัดการข้อมูล", 1), ("5.5 Cart, Order, Payment และ Certificate", 1),
        ("5.6 ข่าวสาร หมวดหมู่ และข้อมูลอ้างอิง", 1), ("5.7 การขายหลังครบ 1 ปี", 1),
        ("5.8 การแจ้งเตือนและงานอัตโนมัติ", 1), ("6. ข้อกำหนดด้าน UI/UX และภาพหน้าจอจริง", 0),
        ("7. ข้อกำหนดด้านข้อมูลและ API", 0), ("8. Workflow และกติกาธุรกิจ", 0),
        ("9. ข้อกำหนดที่ไม่ใช่ฟังก์ชัน", 0), ("10. ความปลอดภัยและการตรวจสอบย้อนหลัง", 0),
        ("11. แผนการทดสอบและเกณฑ์ยอมรับ", 0), ("12. การติดตั้ง ปฏิบัติการ และบำรุงรักษา", 0),
        ("13. ผลส่งมอบและเกณฑ์การรับมอบ", 0), ("14. สมมติฐาน ข้อจำกัด และรายการที่ต้องยืนยัน", 0),
        ("ภาคผนวก ก–จ", 0),
    ]
    for label, level in toc_entries:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.25 * level)
        p.paragraph_format.space_after = Pt(2)
        p.add_run(label)
    add_para(doc, "หมายเหตุ: รายการสารบัญจัดทำตามหัวข้อ Heading ของเอกสาร เลขหน้าจะเปลี่ยนตามการจัดหน้า/การเปิดไฟล์ใน Word และสามารถสร้างสารบัญ field เพิ่มได้หากหน่วยงานต้องการเลขหน้าอัตโนมัติ")
    doc.add_page_break()

    doc.add_heading("บทสรุปผู้บริหาร", level=1)
    add_para(doc, "ระบบ Buddhist Art MFU เป็นแพลตฟอร์มดิจิทัลสำหรับรวบรวม อนุรักษ์ จัดแสดง และจำหน่ายผลงานพุทธศิลป์/ศิลปะร่วมสมัยของมหาวิทยาลัยแม่ฟ้าหลวง ทำงานแบบเว็บแอปพลิเคชัน แบ่งส่วนหลักเป็น public catalog, artist portal, customer dashboard และ admin dashboard")
    add_para(doc, "ประเด็นสำคัญของ TOR ฉบับนี้คือการทำให้สิทธิ์ขายของผลงานที่มาจาก Submission มีวงจรเริ่มต้น 1 ปีนับจากวันและเวลาปิด Submission ตามเวลา Asia/Bangkok เมื่อครบกำหนด ศิลปินเลือก “วางขายต่อแบบปกติ” หรือ “แสดงเฉย ๆ” ได้ แอดมินบันทึกแทนได้เมื่อมีช่องทางติดต่อและหมายเหตุ ระบบต้องปิดคำสั่งซื้อใหม่เมื่อยังไม่มีคำตอบหรือเลือกแสดงเฉย ๆ แต่ให้รายการจองเดิมดำเนินต่อจนจบ")
    add_table(doc, ["มิติ", "ข้อกำหนด/ผลลัพธ์"], [
        ("ผู้ใช้งาน", "Admin, Artist, Public/Customer พร้อมสิทธิ์ตามบทบาทและ owner check"),
        ("แหล่งข้อมูล", "MongoDB/Mongoose; Artwork เชื่อม Submission ผ่าน submissionArtworkId และ postTermSale"),
        ("ช่องทาง", "เว็บไซต์สาธารณะ, Artist portal, Admin dashboard, REST API และงาน cron"),
        ("การซื้อ", "ตรวจสิทธิ์ซื้อซ้ำที่ backend ตอนสร้าง order; frontend ซ่อนปุ่มเป็นเพียงการช่วยนำทาง"),
        ("การตรวจสอบ", "Jest backend 9 suites/42 tests ผ่าน และ frontend production build ผ่าน ณ วันที่จัดทำ"),
    ], widths=[1.35, 5.1])
    doc.add_page_break()

    # 1-4
    doc.add_heading("1. หลักการและเหตุผล", level=1)
    add_para(doc, "หน่วยงานมีผลงานศิลปะจากการส่งผลงาน (Submission) จำนวนมาก ซึ่งมีเงื่อนไขการเปิดขายในช่วงเริ่มต้น 1 ปี หลังจากนั้นศิลปินอาจประสงค์ให้จำหน่ายต่อหรือให้คงไว้เพื่อการจัดแสดงเท่านั้น หากไม่มี workflow ที่ชัดเจน อาจเกิดการขายเกินสิทธิ์ ข้อมูลหน้าเว็บไม่ตรงกับสิทธิ์จริง การแจ้งเตือนไม่ครบ หรือการยกเลิกรายการจองแล้วทำให้สถานะกลับมาเปิดขายโดยไม่ตั้งใจ")
    add_para(doc, "จึงกำหนดโมเดล postTermSale เป็นแหล่งข้อมูลสิทธิ์ซื้อหลักที่แยกจาก Sale Status เดิม เพื่อให้ระบบบริหาร lifecycle, decision, effective time, audit history, notification และการตรวจสิทธิ์ในจุดสร้างคำสั่งซื้อได้อย่างเป็นระบบ")

    doc.add_heading("2. วัตถุประสงค์", level=1)
    for t in [
        "จัดทำคลังผลงานและเว็บไซต์สาธารณะสำหรับค้นหา ดูรายละเอียด และแสดงสถานะการขาย/จัดแสดง",
        "สนับสนุนศิลปินส่งผลงาน แก้ไขข้อมูลผลงานของตนเอง และติดตามสถานะการพิจารณา",
        "ให้แอดมินตรวจ อนุมัติ มอบหมายงาน จัดการผลงาน ผู้ใช้ ข่าวสาร คำสั่งซื้อ และข้อมูลอ้างอิง",
        "ควบคุมสิทธิ์การซื้อผลงานหลังครบ 1 ปีตามความประสงค์ โดยมีหลักฐานการตัดสินใจและ audit trail",
        "ให้ข้อมูลพร้อมใช้งานบน desktop/mobile รองรับ keyboard และไม่ใช้สีเป็นตัวบอกสถานะเพียงอย่างเดียว",
    ]: bullet(doc, t)

    doc.add_heading("3. ขอบเขตงานและภาพรวมสถาปัตยกรรม", level=1)
    add_para(doc, "ขอบเขตประกอบด้วย frontend Vue 2.6/Options API, Vue Router, Vuex, CoreUI Pro Vue, i18n ภาษาไทย/อังกฤษ, backend Node.js/Express, MongoDB/Mongoose, Socket.io และบริการประมวลผลภาพ/PDF/QR ตามโมดูลที่มีใน repository")
    add_table(doc, ["ชั้นระบบ", "เทคโนโลยี/หน้าที่", "หลักฐานในโครงการ"], [
        ("Presentation", "Vue.js, CoreUI, responsive layout, i18n", "frontend/src/views, containers, assets"),
        ("State/API", "Vuex modules, Axios service, socket client", "frontend/src/store, frontend/src/service"),
        ("Business/API", "Express routes, auth middleware, service layer", "backend/server/Project/*, middleware"),
        ("Data", "MongoDB + Mongoose schemas", "backend/server/Project/*/models"),
        ("Jobs", "node-cron; deadline/timeout/idempotent processing", "backend/server/crons"),
        ("Media/Document", "Sharp, Puppeteer, PDF/QR/certificate", "backend dependencies and services"),
    ], widths=[1.25, 2.5, 2.7])

    doc.add_heading("4. กลุ่มผู้ใช้งานและสิทธิ์", level=1)
    add_table(doc, ["บทบาท", "สิทธิ์หลัก", "ข้อจำกัด/การตรวจสอบ"], [
        ("Admin", "ดู dashboard; CRUD ผู้ใช้/ผลงาน/ข่าว/Submission/Order; อนุมัติ; บันทึกความประสงค์แทนศิลปิน; import/export", "ต้องผ่าน auth + role admin; การบันทึกแทนต้องระบุ contactMethod/note และเก็บ audit"),
        ("Artist", "จัดการ profile; สร้าง/แก้ไข submission; ดูผลงานของตน; เลือกขายต่อ/แสดงเฉย ๆ", "owner check; ปีแรกแก้ข้อมูลได้แต่เปลี่ยนสถานะขายเองไม่ได้; ต้องยืนยันความประสงค์"),
        ("Customer/Public", "ค้นหา/กรอง/ดู artwork, artist, news; cart/checkout/payment; ดู order/profile", "สร้าง order ได้เฉพาะผลงานที่ backend ตรวจว่า purchasable; เข้าหน้าส่วนตัวต้อง login"),
        ("Evaluator/ผู้มอบหมาย", "เส้นทางตาม role ที่กำหนดสำหรับงานประเมิน/assignment", "เข้าถึงเฉพาะ route และข้อมูลตาม middleware/owner policy"),
    ], widths=[1.0, 3.0, 2.45])
    doc.add_page_break()

    # 5 Functions
    doc.add_heading("5. ข้อกำหนดด้านฟังก์ชัน", level=1)
    add_para(doc, "ข้อกำหนดในหมวดนี้ใช้คำว่า “ระบบต้อง” สำหรับ acceptance requirement และคำว่า “ตรวจพบ” สำหรับความสามารถที่มีอยู่ใน source code/หน้าจอที่สำรวจ")

    doc.add_heading("5.1 เว็บไซต์สาธารณะและแคตตาล็อก", level=2)
    for t in [
        "หน้าแรกแสดง hero/branding, ผลงานเด่น, หมวดหมู่, กิจกรรม/ข่าวสาร และข้อมูลติดต่อหน่วยงาน",
        "หน้า Artworks แสดงรายการแบบ card พร้อมค้นหาชื่อผลงาน/ศิลปิน กรองหมวดหมู่ และกรองช่วงราคา",
        "หน้า Artwork Detail แสดงภาพ รายละเอียด ศิลปิน สถานะผลงาน ราคา ปุ่มเพิ่มตะกร้า และลิงก์โปรไฟล์ศิลปินเมื่อข้อมูลพร้อม",
        "หน้า Artist Public Profile แสดงข้อมูลศิลปินและผลงานที่เผยแพร่",
        "หน้า News/News Detail, Contact, Privacy/Terms และ System Message รองรับการเข้าถึงจากเมนูสาธารณะ",
        "รองรับภาษาไทย/อังกฤษผ่าน Vue I18n และต้องมี accessible name/alt text สำหรับภาพและปุ่มสำคัญ",
    ]: bullet(doc, t)

    doc.add_heading("5.2 บัญชีผู้ใช้และการยืนยันตัวตน", level=2)
    for t in [
        "เข้าสู่ระบบด้วย credential ที่ระบบกำหนด และรองรับ Google OAuth2/Active Directory ตาม configuration ที่มี",
        "เก็บ session/token ใน local storage ตาม convention เดิม พร้อม router guard สำหรับ route ที่ต้อง login และ role",
        "ผู้ใช้แก้ไข profile และรูปโปรไฟล์ได้ตามสิทธิ์; ระบบต้องตรวจ owner ก่อนบันทึกข้อมูล",
        "รองรับการส่ง/ตรวจ OTP หรือ verification data ตาม Settings และบริการที่เปิดใช้",
    ]: bullet(doc, t)

    doc.add_heading("5.3 Artist portal และ Submission", level=2)
    for t in [
        "ศิลปินสร้าง Submission ระบุชื่อรุ่น/หลักสูตร วันเวลาเปิด-ปิด ผู้เข้าร่วม และอัปโหลดภาพผลงาน",
        "ศิลปินดูรายการ Submission, รายละเอียด, progress, สถานะเปิด/ปิด และรายการผลงานที่อยู่ใน submission",
        "แก้ไขรายละเอียดผลงานของตนเองได้ โดยไม่ข้าม owner check; ปีแรกแก้ข้อมูล metadata ได้แต่ห้ามเปลี่ยนสิทธิ์ขายเอง",
        "ระบบสร้าง Artwork จาก Submission ตอนอนุมัติ พร้อมคำนวณ initialSaleEndsAt = create.endAt + 1 calendar year ในเวลา Asia/Bangkok",
        "ถ้าหา Submission หรือ create.endAt ไม่ได้ ให้ตั้ง needsReview, หยุดขาย และเข้าคิว “ต้องตรวจสอบวันครบกำหนด”",
        "แสดง notice ให้ศิลปินเลือก “วางขายต่อแบบปกติ” หรือ “แสดงเฉย ๆ” พร้อม checkbox ยืนยันและส่งอีเมลยืนยัน",
    ]: bullet(doc, t)

    doc.add_heading("5.4 Admin dashboard และการจัดการข้อมูล", level=2)
    add_table(doc, ["หน้าจอ/โมดูล", "ฟังก์ชันที่ต้องรองรับ"], [
        ("Overview/Analytics", "สรุปจำนวนผู้ใช้ ผลงาน Submission Order และกราฟ/กิจกรรมที่ระบบเก็บได้"),
        ("Artworks", "ค้นหา ดูรายละเอียด เพิ่ม/แก้ไข/ลบ อัปโหลดภาพ จัดหมวดหมู่ import/export และเปลี่ยนสถานะ"),
        ("Submissions", "ดูรายการ/ตัวกรอง/ช่วงเวลา progress รายละเอียด มอบหมายงาน อนุมัติ/ปิด/ลบ และแท็บจัดการการขายหลังครบ 1 ปี"),
        ("Orders", "ค้นหา ดูสถานะคำสั่งซื้อ หลักฐานการชำระเงิน ใบแจ้งหนี้/ใบรับรอง และอัปเดตสถานะตาม workflow"),
        ("Users Management", "สร้าง แก้ไข ลบ เปิด/ปิดผู้ใช้ import/export template และ map Artist ID"),
        ("News", "สร้าง แก้ไข ลบ อัปโหลดภาพ ดูจำนวนการเข้าชม และเผยแพร่ข่าวสาร"),
    ], widths=[1.6, 4.85])

    doc.add_heading("5.5 Cart, Order, Payment และ Certificate", level=2)
    for t in [
        "เพิ่มผลงานลง cart ตรวจจำนวน/ความพร้อม และหมดเวลาตะกร้าตาม job ที่กำหนด",
        "สร้าง order พร้อมข้อมูลผู้ซื้อ ที่อยู่ รายการผลงาน ราคา และหลักฐานการชำระเงิน",
        "แสดงขั้นตอน payment/bill และดาวน์โหลด invoice/certificate ตามสิทธิ์",
        "เมื่อ order สำเร็จให้ป้องกันการขายซ้ำ/อัปเดต Sale Status และส่งข้อมูล real-time เมื่อมี socket event",
        "หากรายการจองเดิมถูกยกเลิกหลังครบสิทธิ์ ต้องคืนเป็น Exhibition เมื่อสิทธิ์หมด ไม่ใช่ Available",
    ]: bullet(doc, t)

    doc.add_heading("5.6 ข่าวสาร หมวดหมู่ และข้อมูลอ้างอิง", level=2)
    for t in [
        "จัดการ category ของ Artwork และใช้ category ใน filter/search",
        "จัดการ News พร้อมภาพหลายภาพตาม upload limit และมีหน้า list/detail สาธารณะ",
        "จัดการ Settings: message, group, status, verification, role และ storage ตาม endpoint ที่มี",
        "รองรับการเพิ่มข้อมูลผ่าน Excel template เมื่อเปิดใช้ในหน้าผู้ดูแลระบบ และต้องรายงานแถวที่ผิดพลาดให้ตรวจสอบได้",
    ]: bullet(doc, t)

    doc.add_heading("5.7 การขายหลังครบ 1 ปี (Post-term sale management)", level=2)
    callout(doc, "หลักการคำศัพท์", "ใช้คำว่า “การขายหลังครบ 1 ปี” ไม่ใช้คำว่า “ต่อสัญญา” บน UI/notification เพื่อสื่อว่าเป็นความประสงค์ในการจำหน่ายหลังครบกำหนด ไม่ใช่การบังคับทำสัญญาใหม่")
    add_table(doc, ["หัวข้อ", "ข้อกำหนดที่ต้องส่งมอบ"], [
        ("วันครบกำหนด", "นับจาก Submission.create.endAt เป็นปีปฏิทินเดียวกันใน Asia/Bangkok; ก่อนหมดอายุยังขายได้"),
        ("ทางเลือก", "continue_sale → standard_sale ขายต่อไม่มีกำหนด; display_only → คงในพอร์ตแต่ซ่อนราคา/ตะกร้า/ปุ่มซื้อ"),
        ("ไม่ตอบ", "เมื่อครบกำหนดปิดคำสั่งซื้อใหม่อัตโนมัติและแสดง Display only; reservation เดิมจบต่อได้"),
        ("การแจ้งเตือน", "ส่งล่วงหน้า 30 วัน, 7 วัน และวันครบกำหนด แบบ idempotent ครั้งเดียวต่อช่วง"),
        ("Admin queue", "แท็บพร้อม counters: ใกล้ครบ 30 วัน, รอคำตอบ, ขายต่อ, แสดงเฉย ๆ; filter ตามสถานะและวัน"),
        ("การบันทึกแทน", "Admin เลือกหลายผลงานของศิลปินเดียวได้; ระบุ contactMethod (โทรศัพท์/อีเมล/พบด้วยตนเอง) และ note"),
        ("หลังหมดอายุ", "Artist/Admin เปลี่ยนระหว่าง standard_sale และ display_only ได้เหมือน Artwork ทั่วไป และ push history ทุกครั้ง"),
        ("ความปลอดภัย", "ใช้ owner/admin authorization และ compare-and-set ป้องกันการกดซ้ำ; backend guard ตอนสร้าง order"),
    ], widths=[1.55, 4.9])
    add_para(doc, "สถานะหลัก: initial_term = ยังอยู่ในปีแรก, standard_sale = วางขายต่อแบบปกติ, display_only = แสดงเฉย ๆ; decision: pending, continue_sale, display_only. Sale Status เดิม Available/Exhibition/Sold Out ยังคงใช้ แต่ postTermSale เป็นแหล่งข้อมูลสิทธิ์ซื้อหลัก")

    doc.add_heading("5.8 การแจ้งเตือนและงานอัตโนมัติ", level=2)
    for t in [
        "cron postTermSaleDeadline ประมวลผล reminder และ transition เมื่อถึงเวลา โดยใช้ sentAt/compare-and-set ให้รันซ้ำได้โดยไม่ส่งซ้ำ",
        "cron cartTimeout ตรวจ reservation/cart และคืนสถานะตาม effective mode ของ postTermSale",
        "ส่งอีเมลยืนยันกลับศิลปินหลังการบันทึกความประสงค์ และใช้ข้อความเดียวกันกับ UI เท่าที่ทำได้",
        "บันทึก history พร้อม recordedBy/recordedAs/effectiveAt และรายละเอียดช่องทางติดต่อ",
    ]: bullet(doc, t)
    doc.add_page_break()

    # 6 UI and screenshots
    doc.add_heading("6. ข้อกำหนดด้าน UI/UX และภาพหน้าจอจริง", level=1)
    add_para(doc, "UI ต้องใช้งานได้ทั้ง desktop/mobile มี focus state, keyboard navigation, label และ feedback ของ loading/success/error ทุก action ตารางต้องมี empty state และไม่ใช้สีเป็นความหมายเดียว โดยใช้ข้อความ/ไอคอน/aria-label ร่วมด้วย")
    add_para(doc, "ภาพต่อไปนี้เป็นหลักฐานหน้าจอจริงจาก local application และชุด capture เดิมใน repository; ภาพหน้าจอใช้เพื่ออธิบายองค์ประกอบ/flow ไม่ได้แทน acceptance test ของข้อมูลจริง")
    figs = [
        ("screenshots/08_admin_submissions.png", "Admin — รายการ Submission และการค้นหา/กรองงาน"),
        ("screenshots/manual/admin_02_artworks.png", "Admin — รายการจัดการผลงานศิลปะ"),
        ("screenshots/manual/admin_01_overview_a.png", "Admin — Dashboard ภาพรวม"),
        ("screenshots/manual/admin_04_submission_detail.png", "Admin — รายละเอียด Submission/การมอบหมายงาน"),
        ("screenshots/manual/admin_05_orders.png", "Admin — รายการคำสั่งซื้อ"),
        ("screenshots/manual/admin_06_users.png", "Admin — จัดการผู้ใช้งาน"),
        ("screenshots/manual/admin_07_news.png", "Admin — จัดการข่าวสาร"),
        ("screenshots/manual/admin_08_artwork_create_modal.png", "Admin — Modal สร้าง/นำเข้าผลงาน"),
        ("screenshots/manual/artist_01_profile_a.png", "Artist — โปรไฟล์และผลงานของศิลปิน"),
        ("screenshots/manual/artist_02_submissions.png", "Artist — รายการ Submission"),
        ("screenshots/manual/artist_03_submission_detail.png", "Artist — รายละเอียด Submission"),
        ("screenshots/manual/cust_02_orders.png", "Customer — ประวัติคำสั่งซื้อ"),
        ("screenshots/manual/pub_01_home_a.png", "Public — หน้าแรกและผลงานเด่น"),
        ("screenshots/manual/pub_02_artworks_a.png", "Public — แคตตาล็อก/ตัวกรองผลงาน"),
        ("screenshots/manual/pub_03_artwork_detail_a.png", "Public — รายละเอียดผลงาน"),
        ("screenshots/manual/pub_04_news.png", "Public — ข่าวสาร"),
        ("screenshots/manual/pub_08_payment.png", "Public/Customer — ขั้นตอนชำระเงิน"),
        ("screenshots/manual/pub_09_login_dialog.png", "Public — Dialog เข้าสู่ระบบ"),
    ]
    fig_no = 1
    for rel, cap in figs:
        figure(doc, source_path(rel), cap, fig_no)
        fig_no += 1
        if fig_no in (4, 9, 14):
            doc.add_page_break()

    # 7 data/API
    doc.add_heading("7. ข้อกำหนดด้านข้อมูลและ API", level=1)
    doc.add_heading("7.1 โครงสร้างข้อมูลหลัก", level=2)
    add_table(doc, ["Entity", "ข้อมูลสำคัญ", "ความสัมพันธ์/กติกา"], [
        ("User", "profile, role, status, verification, image", "role guard; owner check; รองรับ import/identity provider"),
        ("Submission", "title, artist[], create.startAt/endAt, status, artworks", "endAt เป็นฐานคำนวณ initialSaleEndsAt"),
        ("Artwork", "artworkCode, title, artist, image, price, status, category", "submissionArtworkId เชื่อมต้นทาง; direct-create ไม่เข้ากติกา 1 ปี"),
        ("Artwork.postTermSale", "applicable, initialSaleEndsAt, mode, decision, decisionAt, effectiveAt, recordedBy/As, contactMethod, note, history[], notifications", "แหล่งสิทธิ์ซื้อหลักและ audit lifecycle"),
        ("Order/Cart", "buyer, items, status, payment, reservation", "backend ตรวจ purchasable; reservation เดิมจบได้"),
        ("News/Category/Settings", "content, image, category, status/role/config", "ใช้ public/admin CRUD ตาม auth"),
    ], widths=[1.25, 3.1, 2.1])

    doc.add_heading("7.2 API ที่เกี่ยวข้อง", level=2)
    add_table(doc, ["Method/Path", "สิทธิ์", "หน้าที่"], [
        ("GET /api/v1/artwork", "Public", "รายการผลงาน/แคตตาล็อก"),
        ("POST /api/v1/artwork/explore", "Public/Auth", "ค้นหา/กรองผลงาน"),
        ("GET /api/v1/artwork/view/:id", "Public", "เพิ่ม view count/ดูรายละเอียด"),
        ("POST /api/v1/artwork", "Auth", "สร้างผลงาน"),
        ("PUT /api/v1/artwork", "Auth", "แก้ไขผลงานตาม owner/admin policy"),
        ("GET /api/v1/artwork/post-term", "Auth", "รายการ post-term สำหรับ Artist/Admin พร้อม filter วัน/decision/mode"),
        ("POST /api/v1/artwork/post-term/decision", "Auth", "บันทึกความประสงค์รายชิ้น/หลายชิ้น พร้อม contactMethod/note"),
        ("GET/POST/PUT/DELETE /api/v1/submission", "ตาม route", "CRUD และค้นหา Submission"),
        ("POST /api/v1/order", "Auth", "สร้าง order; guard สิทธิ์ซื้อที่ backend"),
        ("GET /api/v1/order/invoice/:id", "Owner/Admin", "ดาวน์โหลด invoice"),
        ("GET /api/v1/order/certificate/:id", "Owner/Admin", "ดาวน์โหลด certificate/QR"),
        ("GET/POST/PUT/DELETE /api/v1/new", "ตาม route", "CRUD ข่าวสารและอัปโหลดภาพ"),
        ("GET /api/v1/dashboard/stats", "Configured", "สถิติ dashboard"),
        ("GET/POST/PUT/DELETE /api/v1/settings/*", "ตาม route", "message/group/status/verification/role/storage"),
    ], widths=[2.3, 1.15, 3.0], font_size=8.7)
    callout(doc, "เงื่อนไข API สำคัญ", "ทุก endpoint ที่เปลี่ยนสิทธิ์หรือสถานะต้องตรวจ authentication/role/owner, validate input, คืน error ที่อ่านได้, และใช้ compare-and-set เมื่อการกดซ้ำอาจทำให้ decision/history ซ้ำ")

    # 8 workflow
    doc.add_heading("8. Workflow และกติกาธุรกิจ", level=1)
    doc.add_heading("8.1 Submission → Artwork → สิทธิ์ขาย", level=2)
    add_table(doc, ["ลำดับ", "เหตุการณ์", "ผลลัพธ์ที่คาดหวัง"], [
        ("1", "ศิลปินส่ง Submission พร้อม create.endAt", "Submission อยู่ในสถานะรอตรวจ/เปิดตาม workflow"),
        ("2", "Admin ตรวจและอนุมัติ", "สร้าง/อัปเดต Artwork; กำหนด postTermSale.applicable และ endAt + 1 ปี"),
        ("3", "ระหว่างปีแรก", "mode initial_term; ขายได้; artist แก้ metadata ได้แต่ห้ามเปลี่ยน decision เอง"),
        ("4", "30/7/0 วันก่อนครบกำหนด", "ส่ง reminder ครั้งเดียวต่อช่วง; แสดง notice/queue"),
        ("5", "ศิลปินหรือ Admin บันทึก decision", "เก็บ decisionAt, recordedBy/As, contactMethod, note, history; มีผลเมื่อถึงวันครบกำหนด"),
        ("6", "ถึงวันครบกำหนด", "continue_sale → standard_sale; pending/display_only → display_only; ปิด order ใหม่ตาม guard"),
        ("7", "หลังหมดอายุ", "เปลี่ยน standard/display ได้เหมือน Artwork ทั่วไป และบันทึก history ทุกครั้ง"),
    ], widths=[0.55, 2.8, 3.1])
    doc.add_heading("8.2 State machine แบบข้อความ", level=2)
    add_para(doc, "initial_term  ──(ครบกำหนด + continue_sale)──>  standard_sale  ──(เปลี่ยนใจ)──>  display_only")
    add_para(doc, "initial_term  ──(ครบกำหนด + pending/display_only)──>  display_only  ──(เลือกขายต่อ)──>  standard_sale")
    add_para(doc, "needsReview (ไม่มี Submission/endAt) ──> หยุดขาย + คิวตรวจสอบวันครบกำหนด ──> Admin แก้ข้อมูล/บันทึกผล")

    doc.add_heading("8.3 กรณีรายการจองและการยกเลิก", level=2)
    for t in [
        "คำสั่งซื้อ/การจองที่เกิดก่อนหมดสิทธิ์ให้ดำเนินการจนจบตาม order workflow แม้ภายหลังเป็น display_only",
        "คำสั่งซื้อใหม่หลังหมดสิทธิ์ต้องถูกปฏิเสธที่ backend หาก mode ไม่ใช่ standard_sale หรือยังไม่พ้น initial_term",
        "หาก reservation เดิมถูกยกเลิกหลังหมดสิทธิ์ ให้คืน sale status เป็น Exhibition เมื่อ effective mode เป็น display_only",
        "การซ่อนปุ่มซื้อในหน้าเว็บไม่ถือเป็นมาตรการความปลอดภัยเพียงพอ",
    ]: bullet(doc, t)

    # 9 NFR
    doc.add_heading("9. ข้อกำหนดที่ไม่ใช่ฟังก์ชัน (Non-functional requirements)", level=1)
    add_table(doc, ["ด้าน", "ข้อกำหนด"], [
        ("ความปลอดภัย", "JWT/session guard, role/owner authorization, input validation, rate limit/helmet ตาม config, ไม่เชื่อข้อมูลจาก frontend"),
        ("ความถูกต้องของเวลา", "เก็บ timestamp เป็น Date/UTC และคำนวณวันครบกำหนดตาม Asia/Bangkok; รองรับปีอธิกสุรทิน"),
        ("ความน่าเชื่อถือ", "cron idempotent; compare-and-set; ไม่ส่ง notification ซ้ำ; transaction/state update ไม่ทำให้ขายซ้ำ"),
        ("ประสิทธิภาพ", "pagination/filter query; index ที่เหมาะกับ postTermSale.initialSaleEndsAt/decision/mode; lazy-load ภาพ"),
        ("การเข้าถึง", "keyboard, focus, aria-label, alt text, text+icon ไม่ใช้สีอย่างเดียว, responsive"),
        ("การบำรุงรักษา", "แยก service/model/route, testable pure functions, log error/context, migration dry-run"),
        ("การสำรองข้อมูล", "กำหนดรอบ backup MongoDB และ retention โดยผู้ดูแลระบบ; ทดสอบ restore ก่อนใช้งานจริง"),
        ("การขยายระบบ", "API versioning และ schema additive; งาน direct-create ไม่ถูกบังคับเข้า lifecycle 1 ปี"),
    ], widths=[1.4, 5.05])

    doc.add_heading("10. ความปลอดภัยและการตรวจสอบย้อนหลัง", level=1)
    for t in [
        "ตรวจสิทธิ์ที่ backend ทุกจุดสร้าง/แก้ไข/ลบและตอนสร้าง order; owner แก้ได้เฉพาะผลงานของตนเอง",
        "บันทึก audit history เมื่อ decision เปลี่ยน รวมผู้บันทึก เวลา บทบาท ช่องทางติดต่อ และหมายเหตุ",
        "จำกัดการอัปโหลดด้วยชนิดไฟล์ ขนาด จำนวนไฟล์ และทำ image processing ก่อนเผยแพร่",
        "ไม่ log token/password/ข้อมูลส่วนบุคคลเกินจำเป็น และกำหนด retention ตามนโยบายหน่วยงาน",
        "migration post-term ต้องมี dry-run สรุปจำนวน continue/stop/missing ก่อนเขียนจริง และ rollback/backup plan",
    ]: bullet(doc, t)

    # 11 test
    doc.add_heading("11. แผนการทดสอบและเกณฑ์ยอมรับ", level=1)
    add_para(doc, "การทดสอบขั้นต่ำใช้ Given–When–Then ด้านล่าง ร่วมกับ unit/integration test ของ backend, build/lint ของ frontend, API smoke test และการตรวจภาพหน้าจอทุก role")
    add_table(doc, ["Given", "When", "Then"], [
        ("ก่อนครบ 1 ปี", "Artist พยายามเปลี่ยน decision", "ระบบปฏิเสธ; แก้ข้อมูล metadata ได้ และแสดงข้อความให้ติดต่อ Admin"),
        ("มี decision continue_sale ล่วงหน้า", "ถึง initialSaleEndsAt", "mode เปลี่ยน standard_sale โดยไม่หยุดขาย"),
        ("ครบกำหนดแต่ pending", "ลูกค้าสร้าง order ใหม่", "backend ปฏิเสธ; public แสดง Display only; reservation เดิมทำต่อได้"),
        ("ครบกำหนดและเลือก continue", "ลูกค้าสร้าง order ใหม่", "ผ่านได้หาก status/stock เงื่อนไขอื่นผ่าน"),
        ("รายการจองเดิมถูกยกเลิกหลังหมดสิทธิ์", "ระบบคืนสถานะ", "กลับ Exhibition หาก mode display_only ไม่ใช่ Available"),
        ("cron ทำงานซ้ำ", "รัน reminder/deadline job หลายครั้ง", "ไม่ส่งซ้ำและไม่ push history ซ้ำโดยไม่จำเป็น"),
        ("endAt เป็น leap day/เวลาไทย", "คำนวณครบ 1 ปี", "ได้วัน/เวลาครบกำหนดตามปฏิทินและ timezone ที่กำหนด"),
        ("Admin บันทึกแทนหลาย artwork", "ส่ง artworkIds พร้อม contact/note", "ทุกชิ้นที่อนุญาตอัปเดต; audit ระบุผู้บันทึกและช่องทาง"),
        ("Artwork direct-create", "ไม่มี submissionArtworkId", "ไม่ถูกบังคับเข้า post-term lifecycle"),
    ], widths=[1.9, 2.1, 2.45], font_size=8.8)
    add_para(doc, "หลักฐานการตรวจ ณ วันที่จัดทำ: backend Jest 9 test suites / 42 tests ผ่าน; targeted lifecycle/submission tests ผ่าน 14 tests; frontend npm run build ผ่าน โดยเหลือเพียง Sass deprecation และ asset-size warnings ที่ไม่ทำให้ build ล้มเหลว")

    # 12 operations
    doc.add_heading("12. การติดตั้ง ปฏิบัติการ และบำรุงรักษา", level=1)
    add_table(doc, ["หัวข้อ", "ข้อกำหนด/ขั้นตอน"], [
        ("Environment", "กำหนด .env แยก dev/test/prod; เก็บ secret ใน secret manager; ตั้ง API URL/frontend config ให้ตรง"),
        ("Deploy", "ติดตั้ง dependencies frontend/backend, build frontend, start Node/Express, ตรวจ health endpoint และ log"),
        ("Database", "สร้าง index, backup ก่อน migration, dry-run migratePostTermSale แล้วจึง apply"),
        ("Cron", "เปิดใช้งาน postTermSaleDeadline และ cartTimeout; monitor job duration/error และ notification counters"),
        ("Monitoring", "เก็บ error log, request ID, order/decision audit; แจ้งเตือนเมื่อ cron fail หรือ missing deadline ค้าง"),
        ("Support", "มีคู่มือ admin สำหรับ queue/filter/บันทึกแทน และคู่มือ artist สำหรับเลือกความประสงค์"),
    ], widths=[1.35, 5.1])

    doc.add_heading("13. ผลส่งมอบและเกณฑ์การรับมอบ", level=1)
    for t in [
        "source code frontend/backend พร้อม configuration ตัวอย่างและคำสั่งติดตั้ง",
        "database schema/migration/dry-run report และเอกสาร rollback/backup",
        "API contract หรือ Swagger/collection สำหรับ endpoint สำคัญ",
        "test report, test data ที่ไม่ใช่ข้อมูลจริง และหลักฐาน build/deploy",
        "คู่มือผู้ดูแลระบบ/ศิลปิน/ผู้ซื้อ และ TOR ฉบับนี้พร้อมภาพหน้าจอจริง",
        "เกณฑ์รับมอบ: ทุก acceptance scenario ผ่าน, no unauthorized purchase, audit/history ครบ, responsive/accessibility smoke pass, และเอกสารตรงกับ release ที่ส่งมอบ",
    ]: bullet(doc, t)

    doc.add_heading("14. สมมติฐาน ข้อจำกัด และรายการที่ต้องยืนยัน", level=1)
    for t in [
        "“1 ปี” หมายถึงหนึ่งปีปฏิทินจากวันและเวลาปิด Submission ใน Asia/Bangkok ตามแผนที่ล็อกไว้",
        "ภาพ/ข้อมูลทดสอบในเอกสารไม่ใช่ข้อมูลธุรกรรมจริง และไม่ควรเผยแพร่ต่อสาธารณะโดยไม่ตรวจ privacy",
        "รายละเอียดเชิงกฎหมายของสัญญา ค่าธรรมเนียม ภาษี SLA และ retention ข้อมูลต้องยืนยันกับหน่วยงาน/นิติการก่อนประกาศใช้",
        "การส่งอีเมลจริงต้องตั้ง SMTP/provider, sender identity, template และ retry policy ใน production",
        "หากข้อมูลเดิมไม่มี submissionArtworkId หรือ create.endAt ระบบจะหยุดขายและเข้าคิวตรวจสอบ ไม่เดาวันครบกำหนด",
    ]: bullet(doc, t)
    doc.add_page_break()

    # Appendices
    doc.add_heading("ภาคผนวก ก. Route inventory ของ Frontend", level=1)
    add_table(doc, ["พื้นที่", "Route", "บทบาท/หน้าที่"], [
        ("Public", "/", "Home"), ("Public", "/artworks", "Catalog"), ("Public", "/artwork/:id", "Artwork detail"),
        ("Public", "/news และ /news/:id", "News list/detail"), ("Public", "/contact", "Contact"),
        ("Public", "/artist-profile/:id", "Public artist profile"), ("Public", "/payment", "Payment"),
        ("Public", "/login, /privacy, /terms", "Auth/legal"),
        ("Admin", "/admin", "Overview"), ("Admin", "/admin/analytics", "Analytics"),
        ("Admin", "/admin/artworks", "Artwork management"), ("Admin", "/admin/submissions", "Submission + post-term queue"),
        ("Admin", "/admin/submissions/:id", "Submission detail"), ("Admin", "/admin/submissions/:submissionId/assignment/:id", "Assignment"),
        ("Admin", "/admin/orders", "Orders"), ("Admin", "/admin/users-management", "Users"), ("Admin", "/admin/news", "News"),
        ("Artist", "/artist/profile", "Artist profile"), ("Artist", "/artist/submissions", "My submissions"),
        ("Artist", "/artist/submissions/:id", "Submission detail"),
        ("Customer", "/user/profile", "Customer profile"), ("Customer", "/user/order", "My orders"),
    ], widths=[1.0, 3.2, 2.25], font_size=8.8)

    doc.add_heading("ภาคผนวก ข. Source map สำหรับการตรวจสอบ", level=1)
    add_table(doc, ["ส่วนงาน", "ไฟล์/โฟลเดอร์หลัก"], [
        ("Post-term model", "backend/server/Project/Artwork/models/artwork.model.js"),
        ("Post-term service/API", "backend/server/Project/Artwork/service/postTermSale.js; artwork.routes.js"),
        ("Order guard", "backend/server/Project/Order/service/order.js; backend/server/crons/cartTimeout.js"),
        ("Deadline cron", "backend/server/crons/postTermSaleDeadline.js"),
        ("Migration", "backend/scripts/migratePostTermSale.js"),
        ("Admin UI", "frontend/src/views/Admin/Submissions.vue; components/post_term/PostTermSaleQueue.vue"),
        ("Artist UI", "frontend/src/views/Artist/Profile.vue; components/PostTermSaleNotice.vue; Submissions.vue"),
        ("Public UI", "frontend/src/views/page/ArtworkDetail.vue; components/card/CardArtworks.vue"),
        ("Auth/route", "frontend/src/router/index.js; backend/server/middleware"),
        ("Tests", "backend/tests and jest configuration; frontend build/test configuration"),
    ], widths=[1.55, 4.9], font_size=8.8)

    doc.add_heading("ภาคผนวก ค. สถานะและคำศัพท์", level=1)
    add_table(doc, ["คำ/สถานะ", "ความหมาย"], [
        ("Available", "มีสิทธิ์ขาย/พร้อมซื้อเมื่อเงื่อนไขอื่นผ่าน"),
        ("Exhibition", "แสดง/จัดแสดง ไม่เปิดซื้อ"),
        ("Sold Out", "จำหน่ายครบ/หมด"),
        ("initial_term", "ช่วงปีแรกจาก Submission endAt"),
        ("standard_sale", "ขายต่อแบบปกติ ไม่มีกำหนดใหม่"),
        ("display_only", "แสดงเฉย ๆ ไม่มีราคา/ตะกร้า/ปุ่มซื้อ"),
        ("pending", "ยังไม่ตอบความประสงค์"),
        ("needsReview", "ข้อมูลต้นทางไม่พอ ต้องตรวจสอบวันครบกำหนด"),
    ], widths=[1.7, 4.75])

    doc.add_heading("ภาคผนวก ง. ดัชนีภาพหน้าจอ", level=1)
    add_para(doc, "ภาพที่ 1–18 ในหมวด 6 ครอบคลุมหน้าจอ public, artist, customer และ admin โดยภาพที่ 1 เป็น capture ล่าสุดของ Admin Submissions ที่มีแท็บ “จัดการการขายหลังครบ 1 ปี” ส่วนภาพอื่นเป็น capture จริงของ workflow ที่มีอยู่ในชุดภาพระบบ")

    doc.add_heading("ภาคผนวก จ. Traceability matrix", level=1)
    add_table(doc, ["Requirement", "UI/Code evidence", "Test/acceptance"], [
        ("T1 วันครบกำหนด +1 ปี", "postTermSale service/model; Submission approval", "leap year/timezone case"),
        ("T2 Artist/Admin decision", "PostTermSaleNotice; PostTermSaleQueue; decision API", "owner/admin authorization; compare-set"),
        ("T3 display only", "CardArtworks; ArtworkDetail; order guard", "no new order; old reservation continues"),
        ("T4 reminder idempotent", "postTermSaleDeadline cron; notifications fields", "repeat cron sends once"),
        ("T5 audit/migration", "history[]; migratePostTermSale dry-run", "missing source → needsReview"),
        ("T6 responsive/accessibility", "CoreUI/Vue components; aria/labels/loading feedback", "desktop/mobile/keyboard smoke"),
    ], widths=[1.55, 3.2, 2.1], font_size=8.8)

    # Save
    doc.core_properties.title = "TOR ระบบ Buddhist Art MFU และการขายหลังครบ 1 ปี"
    doc.core_properties.subject = "ข้อกำหนดขอบเขตของงานระบบบริหารจัดการผลงานพุทธศิลป์"
    doc.core_properties.author = "Buddhist Art MFU"
    doc.core_properties.keywords = "TOR, Buddhist Art MFU, Submission, Post-term sale"
    doc.save(str(OUT))
    print(OUT)


if __name__ == "__main__":
    build()
