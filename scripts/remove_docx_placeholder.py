from pathlib import Path
import sys
from docx import Document

path = Path(sys.argv[1])
doc = Document(str(path))
for p in list(doc.paragraphs):
    if (p.text or '').strip() == '[[TOC]]':
        p._element.getparent().remove(p._element)
doc.save(str(path))
print(f'cleaned {path}')
