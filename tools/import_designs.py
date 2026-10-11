"""Copy Matan's sales-page designs (Design canvases) into the site, then apply unify_pages.py.
Usage: python3 tools/import_designs.py <folder with presets/ panel/ field-guides/ design files>
Expects <folder>/presets/Main.dc.html + HE-Main.dc.html, <folder>/panel/SalesPage.dc.html + SalesPage-HE.dc.html,
<folder>/field-guides/EN.dc.html + Main.dc.html (Hebrew). Images must already be in assets/pages/img/<id>.<ext>."""
import os, re, sys, glob, subprocess
SRC = sys.argv[1]
MAP = {
    "presets/index.html": "presets/Main.dc.html", "presets/he.html": "presets/HE-Main.dc.html",
    "panel/index.html": "panel/SalesPage.dc.html", "panel/he.html": "panel/SalesPage-HE.dc.html",
    "field-guides/index.html": "field-guides/EN.dc.html", "field-guides/he.html": "field-guides/Main.dc.html",
}
IMG = {os.path.splitext(f)[0]: f for f in os.listdir("assets/pages/img")}
missing = set()
def img(m):
    i = m.group(1)
    if i not in IMG:
        missing.add(i); return m.group(0)
    return "../assets/pages/img/" + IMG[i]
for out, src in MAP.items():
    s = open(os.path.join(SRC, src), encoding="utf-8").read()
    s = s.replace('<script src="./support.js"></script>', '<script src="../assets/pages/dc-lite.js"></script>')
    s = re.sub(r"/_blob/([0-9a-f]{32})", img, s)
    open(out, "w", encoding="utf-8").write(s)
    print("imported", out)
if missing:
    sys.exit("missing images: " + " ".join(sorted(missing)))
subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "unify_pages.py")], check=True)
