"""The signed copy of the MWP Ambassador Program terms, one PDF per acceptance.

  terms_pdf(member, out_path)   member: {name, email, instagram, facebook, agreed_at, terms_version, id}

Made by the "Personal copies" worker after someone joins, stored privately, and attached to their row
on monday.com's Shop Ambassadors board. The terms text comes from tools/ambassador_terms.py, the same
text the page shows, so the PDF matches what the person accepted.
"""
import html, os, re, sys
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

try:
    from bidi.algorithm import get_display        # Hebrew names read right to left
except ImportError:                                # pragma: no cover
    def get_display(s): return s

HERE = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from ambassador_terms import TERMS, TERMS_DATE, TERMS_INTRO, TERMS_VERSION  # noqa: E402

LOGO = os.path.join(ROOT, "assets", "pages", "img", "2dd3356528167ddf9a64c0c7301c8aa3.png")
GOLD = colors.HexColor("#B9772E")       # the brand gold, darkened for print on white
INK = colors.HexColor("#1A1814")
MUTED = colors.HexColor("#6B6F73")
LINE = colors.HexColor("#E4DED3")

FONT, BOLD = "Helvetica", "Helvetica-Bold"
for regular, bold in [("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
                      ("/usr/share/fonts/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf")]:
    if os.path.exists(regular) and os.path.exists(bold):
        pdfmetrics.registerFont(TTFont("Body", regular)); pdfmetrics.registerFont(TTFont("Body-Bold", bold))
        pdfmetrics.registerFontFamily("Body", normal="Body", bold="Body-Bold", italic="Body", boldItalic="Body-Bold")
        FONT, BOLD = "Body", "Body-Bold"
        break

S = {
    "kick": ParagraphStyle("kick", fontName=BOLD, fontSize=8, leading=11, textColor=MUTED, spaceAfter=4),
    "title": ParagraphStyle("title", fontName=BOLD, fontSize=20, leading=25, textColor=INK, spaceAfter=4),
    "meta": ParagraphStyle("meta", fontName=FONT, fontSize=8.5, leading=12, textColor=MUTED),
    "intro": ParagraphStyle("intro", fontName=FONT, fontSize=10, leading=15, textColor=INK, spaceAfter=6),
    "agree": ParagraphStyle("agree", fontName=BOLD, fontSize=10, leading=15, textColor=GOLD, spaceAfter=10),
    "h": ParagraphStyle("h", fontName=BOLD, fontSize=11.5, leading=16, textColor=INK, spaceBefore=12, spaceAfter=4),
    "p": ParagraphStyle("p", fontName=FONT, fontSize=9.5, leading=14, textColor=INK, spaceAfter=5),
    "li": ParagraphStyle("li", fontName=FONT, fontSize=9.5, leading=14, textColor=INK),
    "cellk": ParagraphStyle("cellk", fontName=BOLD, fontSize=8, leading=11, textColor=MUTED),
    "cellv": ParagraphStyle("cellv", fontName=FONT, fontSize=9.5, leading=13, textColor=INK),
}


def clean(markup):
    """Terms markup → ReportLab markup: keep <strong> as bold, links as their text."""
    markup = re.sub(r"<a [^>]*>(.*?)</a>", r"\1", markup)
    markup = markup.replace("<strong>", "<b>").replace("</strong>", "</b>")
    return markup


def safe(text):
    """Visitor-provided text: escaped, and Hebrew put in reading order."""
    return html.escape(get_display(str(text or "")))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT, 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, f"MWP Ambassador Program · Signed terms · version {TERMS_VERSION}")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"Page {doc.page}")
    canvas.restoreState()


def terms_pdf(member, out_path):
    accepted = member.get("agreed_at") or ""
    try:
        when = datetime.fromisoformat(accepted.replace("Z", "+00:00")).astimezone(timezone.utc)
        accepted_text = when.strftime("%B %-d, %Y at %H:%M UTC")
    except ValueError:
        accepted_text = accepted
    record = "MWP-AMB-" + re.sub(r"[^A-Za-z0-9]", "", str(member.get("id", "")))[:8].upper()
    ig = (member.get("instagram") or "").lstrip("@")

    story = []
    if os.path.exists(LOGO):   # the logo is drawn for dark backgrounds: show it on a dark band
        band = Table([[Image(LOGO, width=13 * mm, height=13 * mm),
                       Paragraph('<font color="#FEFBF1"><b>MWP</b></font>', ParagraphStyle("b", fontName=BOLD, fontSize=13, leading=16))]],
                     colWidths=[18 * mm, None], hAlign="LEFT")
        band.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0A0908")),
                                  ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                                  ("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 6),
                                  ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
        story += [band, Spacer(1, 6 * mm)]
    story += [
        Paragraph("MWP AMBASSADOR PROGRAM", S["kick"]),
        Paragraph("Terms of Use: signed copy", S["title"]),
        Paragraph(f"{TERMS_DATE} · @Matan Wild · Terms version {TERMS_VERSION}", S["meta"]),
        Spacer(1, 6 * mm),
    ]
    rows = [
        ("Accepted by", safe(member.get("name"))),
        ("Email", safe(member.get("email"))),
        ("Instagram", safe("@" + ig) if ig else "–"),
        ("Facebook", safe(member.get("facebook")) or "–"),
        ("Accepted on", html.escape(accepted_text)),
        ("How", "Online at shop.mw.photography/beta, by clicking “I’ve read and accept the terms” after the full terms were shown."),
        ("Record", record),
    ]
    box = Table([[Paragraph(k.upper(), S["cellk"]), Paragraph(v, S["cellv"])] for k, v in rows],
                colWidths=[32 * mm, None], hAlign="LEFT")
    box.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, GOLD),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINE),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FBF7F0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story += [box, Spacer(1, 8 * mm)]

    story += [Paragraph(clean(TERMS_INTRO[0]), S["intro"]), Paragraph(clean(TERMS_INTRO[1]), S["agree"])]
    for n, (title, blocks) in enumerate(TERMS, 1):
        story.append(Paragraph(f"{n}. {html.escape(title)}", S["h"]))
        for kind, body in blocks:
            if kind == "ul":
                story.append(ListFlowable([ListItem(Paragraph(clean(i), S["li"]), leftIndent=12, value="•") for i in body],
                                          bulletType="bullet", start="•", leftIndent=12, bulletFontSize=8, bulletColor=GOLD,
                                          spaceAfter=5))
            else:
                story.append(Paragraph(clean(body), S["p"]))

    story += [Spacer(1, 8 * mm), Paragraph(
        f"Accepted electronically by {safe(member.get('name'))} ({safe(member.get('email'))}) on {html.escape(accepted_text)}. "
        "This copy was made automatically by the MWP shop from the record of that acceptance.", S["meta"])]

    doc = SimpleDocTemplate(out_path, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=18 * mm,
                            title="MWP Ambassador Program · Signed terms", author="MWP", subject=f"Signed by {member.get('email', '')}")
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return out_path


if __name__ == "__main__":   # a sample, for checking the layout
    terms_pdf({"id": "0f3c9a1b-sample", "name": "דנה כהן", "email": "dana@example.com", "instagram": "dana.wild",
               "facebook": "Dana Cohen Photography", "agreed_at": "2026-10-13T07:12:00Z", "terms_version": TERMS_VERSION},
              sys.argv[1] if len(sys.argv) > 1 else "sample-signed-terms.pdf")
    print("written")
