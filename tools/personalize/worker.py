"""Makes the missing personal copies and signed-terms PDFs (run by the "Personal copies" GitHub workflow).

For every active entitlement to a Presets or Field Guides product whose personal copy is missing or
older than the product's current file, it downloads the base zip once, stamps a copy for that person
(personalize.py), uploads it to presets/personal/<entitlement>/<file> and records it in personal_files.
My downloads then serves that copy instead of the base file.

Needs SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment. Prints counts only, never emails.
"""
import os, sys, tempfile, time
from datetime import datetime, timezone
import requests

sys.path.insert(0, os.path.dirname(__file__))
from personalize import personalize  # noqa: E402

PERSONAL = ("preset", "guide")
URL = os.environ["SUPABASE_URL"].rstrip("/")
KEY = os.environ["SUPABASE_SERVICE_KEY"]
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
S = requests.Session()
S.headers.update(H)


def rest(path, **params):
    r = S.get(f"{URL}/rest/v1/{path}", params=params, timeout=60)
    r.raise_for_status()
    return r.json()


def licence_id(entitlement_id):
    return "MWP-" + entitlement_id.replace("-", "")[:8].upper()


def download(path, dest):
    with S.get(f"{URL}/storage/v1/object/presets/{path}", stream=True, timeout=600) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_content(1 << 20):
                f.write(chunk)


def upload(path, src):
    for attempt in range(3):
        with open(src, "rb") as f:
            r = S.post(f"{URL}/storage/v1/object/presets/{path}", data=f, timeout=900,
                       headers={"content-type": "application/zip", "x-upsert": "true", "cache-control": "no-store"})
        if r.ok:
            return
        print(f"  upload failed ({r.status_code}), retrying", flush=True)
        time.sleep(5 * (attempt + 1))
    r.raise_for_status()


def main():
    failed = personal_copies()
    failed += signed_terms()
    if failed:
        sys.exit(1)


def personal_copies():
    products = rest("products", select="id,slug,category,product_files(path,version)",
                    category=f"in.({','.join(PERSONAL)})")
    products = {p["id"]: p for p in products if p.get("product_files")}
    if not products:
        print("No Presets or Field Guides files yet."); return 0

    ents = rest("entitlements", select="id,product_id,customers(name,email),personal_files(path,version)",
                revoked_at="is.null", product_id=f"in.({','.join(products)})")
    todo = []
    for e in ents:
        pf = products[e["product_id"]]["product_files"]
        pf = pf[0] if isinstance(pf, list) else pf
        mine = e.get("personal_files")
        mine = (mine[0] if isinstance(mine, list) and mine else mine) or {}
        if mine.get("version") != pf["version"] and e.get("customers", {}).get("email"):
            todo.append((e, pf, mine.get("path")))
    print(f"{len(ents)} entitlements, {len(todo)} personal copies to make", flush=True)

    made = failed = 0
    with tempfile.TemporaryDirectory() as tmp:
        bases = {}
        for e, pf, old in todo:
            try:
                if pf["path"] not in bases:
                    bases[pf["path"]] = os.path.join(tmp, f"base-{len(bases)}.zip")
                    download(pf["path"], bases[pf["path"]])
                out = os.path.join(tmp, "out.zip")
                c = e["customers"]
                personalize(bases[pf["path"]], out, (c.get("name") or "").strip(), c["email"].strip(), licence_id(e["id"]))
                dest = f"personal/{e['id']}/{os.path.basename(pf['path'])}"
                upload(dest, out)
                r = S.post(f"{URL}/rest/v1/personal_files", params={"on_conflict": "entitlement_id"},
                           headers={"content-type": "application/json", "prefer": "resolution=merge-duplicates"},
                           json={"entitlement_id": e["id"], "path": dest, "version": pf["version"],
                                 "size_bytes": os.path.getsize(out), "created_at": datetime.now(timezone.utc).isoformat()}, timeout=60)
                r.raise_for_status()
                if old and old != dest:   # the copy of an older version, no longer served
                    S.delete(f"{URL}/storage/v1/object/presets/{old}", timeout=60)
                os.remove(out)
                made += 1
                print(f"  made {made}/{len(todo)} ({products[e['product_id']]['slug']})", flush=True)
            except Exception as err:  # one bad copy shouldn't stop the rest
                failed += 1
                print(f"  failed one copy: {type(err).__name__}: {str(err)[:200]}", flush=True)
    print(f"Personal copies: {made} made, {failed} failed")
    return failed


# ---------------------------------------------------------------- signed Ambassador Program terms
def signed_terms():
    """A PDF of the terms for each acceptance that doesn't have one yet (or accepted again since), stored
    privately in documents/agreements/, then sent to Make to attach on the Shop Ambassadors row."""
    from terms_pdf import terms_pdf
    hook = os.environ.get("MAKE_WEBHOOK_URL", "")
    members = rest("beta_members", select="id,instagram,facebook,agreed_at,terms_version,terms_pdf_at,customers(name,email)")
    todo = [m for m in members if (m.get("customers") or {}).get("email")
            and (not m.get("terms_pdf_at") or m["terms_pdf_at"] < (m.get("agreed_at") or ""))]
    print(f"{len(members)} ambassadors, {len(todo)} signed-terms PDFs to make", flush=True)
    made = failed = 0
    with tempfile.TemporaryDirectory() as tmp:
        for m in todo:
            try:
                c = m["customers"]
                out = os.path.join(tmp, "terms.pdf")
                terms_pdf({**m, "name": (c.get("name") or "").strip() or c["email"], "email": c["email"]}, out)
                path = f"agreements/{m['id']}.pdf"
                with open(out, "rb") as f:
                    r = S.post(f"{URL}/storage/v1/object/documents/{path}", data=f, timeout=120,
                               headers={"content-type": "application/pdf", "x-upsert": "true"})
                r.raise_for_status()
                sent = False
                if hook:
                    r = S.post(f"{URL}/storage/v1/object/sign/documents/{path}", json={"expiresIn": 3600}, timeout=60)
                    r.raise_for_status()
                    link = URL + "/storage/v1" + r.json()["signedURL"]
                    day = (m.get("agreed_at") or "")[:10]
                    r = requests.post(hook, timeout=30, json={
                        "type": "ambassador_terms_pdf", "email": c["email"], "file_url": link,
                        "file_name": f"MWP Ambassador terms - signed {day}.pdf"},
                        headers={"x-mwp-secret": os.environ.get("MAKE_SHARED_SECRET", "")})
                    sent = r.ok
                patch = {"terms_pdf_path": path}
                if sent:   # only marked done once monday has it on its way; otherwise the next run tries again
                    patch["terms_pdf_at"] = datetime.now(timezone.utc).isoformat()
                S.patch(f"{URL}/rest/v1/beta_members", params={"id": f"eq.{m['id']}"},
                        headers={"content-type": "application/json"}, json=patch, timeout=60).raise_for_status()
                made += 1
                print(f"  signed terms {made}/{len(todo)}{'' if sent else ' (stored; not sent to monday yet)'}", flush=True)
            except Exception as err:
                failed += 1
                print(f"  failed one signed-terms PDF: {type(err).__name__}: {str(err)[:200]}", flush=True)
    return failed


if __name__ == "__main__":
    main()
