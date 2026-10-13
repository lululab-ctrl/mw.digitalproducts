"""Gives every page fresh script files after each deploy (run by the Deploy workflow on the published copy).

Browsers keep site files for a while. When one shared script changes (api.js, say) and a browser still has
the old copy, a page that asks it for something new stops working. So, in every HTML page under ROOT:
  - each <script src="…/assets/js/…"> gets ?v=<fingerprint of that file>;
  - an import map is added that does the same for every script the pages import (api.js, cart.js, i18n.js …).
A file's fingerprint changes only when the file changes, so unchanged files stay cached.

  python3 tools/stamp_scripts.py _site
"""
import hashlib, json, os, re, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
JS = os.path.join(ROOT, "assets", "js")


def fingerprint(path):
    return hashlib.sha1(open(path, "rb").read()).hexdigest()[:8]


versions = {}
for folder, _, files in os.walk(JS):
    for name in files:
        if name.endswith(".js"):
            full = os.path.join(folder, name)
            url = "/" + os.path.relpath(full, ROOT).replace(os.sep, "/")
            versions[url] = fingerprint(full)

IMPORT_MAP = ('<script type="importmap" id="mwp-scripts">'
              + json.dumps({"imports": {u: f"{u}?v={v}" for u, v in sorted(versions.items())}}, separators=(",", ":"))
              + "</script>")
SRC = re.compile(r'(<script\b[^>]*\bsrc=")([^"?#]*assets/js/[^"?#]+\.js)(?:\?v=[0-9a-f]+)?(")')

changed = 0
for folder, _, files in os.walk(ROOT):
    if os.path.relpath(folder, ROOT).split(os.sep)[0] in ("assets", ".git", "node_modules"):
        continue
    for name in files:
        if not name.endswith(".html"):
            continue
        path = os.path.join(folder, name)
        html = open(path, encoding="utf-8").read()
        if "assets/js/" not in html and 'type="module"' not in html:
            continue

        def stamp(m):
            src = m.group(2)
            url = "/" + src[src.index("assets/js/"):]
            v = versions.get(url)
            return f"{m.group(1)}{src}?v={v}{m.group(3)}" if v else m.group(0)

        out = SRC.sub(stamp, html)
        out = re.sub(r'<script type="importmap" id="mwp-scripts">.*?</script>\s*', "", out, flags=re.S)
        if 'type="module"' in out:
            # the import map has to come before any module script: put it first in <head>
            out = re.sub(r"(<head[^>]*>)", lambda m: m.group(1) + "\n" + IMPORT_MAP, out, count=1)
        if out != html:
            open(path, "w", encoding="utf-8").write(out)
            changed += 1

print(f"stamped scripts in {changed} pages ({len(versions)} script files)")
