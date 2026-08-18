from __future__ import annotations

import sys
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def text_of(node):
    return "".join(node.xpath(".//w:t/text()"))


def is_paragraph(node):
    return node.tag == qn("w:p")


def has_page_break(node):
    return "w:br" in node.xml and 'w:type="page"' in node.xml


def page_break_paragraph():
    p = OxmlElement("w:p")
    r = OxmlElement("w:r")
    br = OxmlElement("w:br")
    br.set(qn("w:type"), "page")
    r.append(br)
    p.append(r)
    return p


def main(path: str):
    doc = Document(path)
    body = doc._element.body
    children = list(body)
    toc_start = next(i for i, n in enumerate(children) if is_paragraph(n) and text_of(n).strip() == "สารบัญ")
    toc_end = next(i for i in range(toc_start + 1, len(children)) if is_paragraph(children[i]) and not text_of(children[i]).strip())
    toc_nodes = children[toc_start:toc_end + 1]
    for n in toc_nodes:
        body.remove(n)

    children = list(body)
    target = next(i for i, n in enumerate(children) if is_paragraph(n) and text_of(n).startswith("สารบัญ Back to TOC"))
    # Remove the authored placeholder heading/note but retain the authored page-break paragraph.
    body.remove(children[target])
    children = list(body)
    target = next(i for i, n in enumerate(children) if is_paragraph(n) and text_of(n).startswith("บทสรุปผู้บริหาร Back to TOC"))
    insert_at = target
    for n in reversed(toc_nodes):
        body.insert(insert_at, n)
        insert_at += 1
    body.insert(insert_at, page_break_paragraph())
    doc.save(path)
    print(f"moved static TOC after preface: {path}")


if __name__ == "__main__":
    main(sys.argv[1])
