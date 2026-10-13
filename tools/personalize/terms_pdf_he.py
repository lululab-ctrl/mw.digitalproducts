"""The signed copy of the Ambassador Program terms in Hebrew, for people who accepted them on the Hebrew site.
Same content as terms_pdf.py, right to left (PyMuPDF lays out Hebrew properly; reportlab can't wrap it).
Note: in MuPDF, text-align:right inside dir=rtl means the opposite side; leave alignment to dir=rtl."""
import html, os, re, sys
from datetime import datetime, timezone

import pymupdf

HERE = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from ambassador_terms import TERMS_DATE_HE, TERMS_HE, TERMS_INTRO_HE, TERMS_VERSION  # noqa: E402

LOGO = os.path.join(ROOT, "assets", "pages", "img", "2dd3356528167ddf9a64c0c7301c8aa3.png")
MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"]

CSS = """
* { font-family: sans-serif; }
body { color: #1A1814; font-size: 10pt; line-height: 1.55; }
.kick { font-size: 8pt; font-weight: bold; color: #6B6F73; letter-spacing: 1px; margin: 0; }
h1 { font-size: 19pt; margin: 4pt 0 2pt 0; }
.meta { font-size: 8.5pt; color: #6B6F73; margin: 0 0 12pt 0; }
div.box { border: 1px solid #B9772E; background-color: #FBF7F0; padding: 6pt 10pt; margin-bottom: 14pt; }
p.row { margin: 0; padding: 3pt 0; border-bottom: 1px solid #E4DED3; }
span.k { font-size: 8.5pt; font-weight: bold; color: #6B6F73; }
p { margin: 0 0 6pt 0; }
p.agree { color: #B9772E; font-weight: bold; margin-bottom: 10pt; }
h2 { font-size: 11.5pt; margin: 12pt 0 4pt 0; }
p.li { margin: 0 14pt 3pt 0; }
.ltr { direction: ltr; unicode-bidi: embed; }
.foot { font-size: 8.5pt; color: #6B6F73; margin-top: 14pt; }
"""


def ltr(text):
    """Keep handles, hashtags, emails and Latin names in one piece inside the Hebrew lines."""
    return re.sub(r"([@#]?[A-Za-z0-9][\w.@/+-]*(?: [A-Za-z0-9][\w.@/+-]*)*)", "\u200e\\1\u200e", text)


def clean(markup):
    markup = re.sub(r"<a [^>]*>(.*?)</a>", r"\1", markup)
    parts = re.split(r"(<[^>]+>)", markup)
    return "".join(p if p.startswith("<") else ltr(p) for p in parts).replace("<strong>", "<b>").replace("</strong>", "</b>")


def safe(text):
    return ltr(html.escape(str(text or "")))


def terms_pdf_he(member, out_path):
    accepted = member.get("agreed_at") or ""
    try:
        w = datetime.fromisoformat(accepted.replace("Z", "+00:00")).astimezone(timezone.utc)
        accepted_text = f"{w.day} ב{MONTHS[w.month - 1]} {w.year}, {w:%H:%M} (UTC)"
    except ValueError:
        accepted_text = accepted
    record = "MWP-AMB-" + re.sub(r"[^A-Za-z0-9]", "", str(member.get("id", "")))[:8].upper()
    ig = (member.get("instagram") or "").lstrip("@")
    rows = [
        ("אושר על ידי", safe(member.get("name"))),
        ("מייל", safe(member.get("email"))),
        ("אינסטגרם", safe("@" + ig) if ig else "–"),
        ("פייסבוק", safe(member.get("facebook")) or "–"),
        ("תאריך האישור", html.escape(accepted_text)),
        ("איך", "באתר shop.mw.photography/beta, בלחיצה על \"קראתי ואני מאשר/ת את התנאים\" אחרי שהתנאים המלאים הוצגו.".replace("shop.mw.photography/beta", '<span class="ltr">shop.mw.photography/beta</span>')),
        ("רשומה", f'<span class="ltr">{record}</span>'),
    ]
    body = [
        '<p class="kick">תוכנית השגרירים של MWP</p>',
        "<h1>תנאי השימוש: עותק חתום</h1>",
        f'<p class="meta">{TERMS_DATE_HE} · מתן וויילד · גרסת התנאים <span class="ltr">{TERMS_VERSION}</span></p>',
        # one line per detail (MuPDF's table layout doesn't handle right-to-left columns)
        '<div class="box">' + "".join(f'<p class="row"><span class="k">{k}:</span> {v}</p>' for k, v in rows) + "</div>",
        f"<p>{clean(TERMS_INTRO_HE[0])}</p>",
        f'<p class="agree">{clean(TERMS_INTRO_HE[1])}</p>',
    ]
    for n, (title, blocks) in enumerate(TERMS_HE, 1):
        body.append(f"<h2>{n}. {html.escape(title)}</h2>")
        for kind, content in blocks:
            if kind == "ul":
                body += [f'<p class="li">• {clean(i)}</p>' for i in content]
            else:
                body.append(f"<p>{clean(content)}</p>")
    body.append(f'<p class="foot">התנאים אושרו באופן מקוון על ידי {safe(member.get("name"))} ({safe(member.get("email"))}) ב־{html.escape(accepted_text)}. '
                "העותק הזה נוצר אוטומטית בחנות של MWP מתוך הרשומה של האישור.</p>")

    story = pymupdf.Story(html='<body><div dir="rtl">' + "".join(body) + "</div></body>", user_css=CSS)
    page_rect = pymupdf.paper_rect("a4")
    where = page_rect + (51, 70, -51, -51)
    writer = pymupdf.DocumentWriter(out_path)
    more = True
    while more:
        dev = writer.begin_page(page_rect)
        more, _ = story.place(where)
        story.draw(dev)
        writer.end_page()
    writer.close()

    # the band with the logo on the first page, and page numbers
    doc = pymupdf.open(out_path)
    for i, page in enumerate(doc):
        if i == 0:
            page.draw_rect(pymupdf.Rect(51, 22, page_rect.width - 51, 58), color=None, fill=(0.04, 0.035, 0.03))
            if os.path.exists(LOGO):
                page.insert_image(pymupdf.Rect(page_rect.width - 51 - 32, 25, page_rect.width - 51 - 2, 55), filename=LOGO)
            page.insert_text((page_rect.width - 51 - 70, 45), "MWP", fontsize=13, color=(1, 0.98, 0.94), fontname="hebo")
        page.insert_text((51, page_rect.height - 28), f"MWP Ambassador Program · signed terms · {TERMS_VERSION} · {i + 1}", fontsize=7.5, color=(0.42, 0.43, 0.45))
    doc.metadata = {**doc.metadata, "title": "תנאי השימוש של תוכנית השגרירים · עותק חתום", "author": "MWP", "subject": f"Signed by {member.get('email', '')}"}
    doc.saveIncr()
    return out_path


if __name__ == "__main__":
    terms_pdf_he({"id": "0f3c9a1b-sample", "name": "דנה כהן", "email": "dana@example.com", "instagram": "dana.wild",
                  "facebook": "Dana Cohen Photography", "agreed_at": "2026-10-13T07:12:00Z"},
                 sys.argv[1] if len(sys.argv) > 1 else "sample-signed-terms-he.pdf")
    print("written")
