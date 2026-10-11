"""Shared brand values. mw.photography's gold (--gold #F4AF56, --goldsoft #E4AA7C) replaces the designs' orange everywhere."""
GOLD = [
    ("linear-gradient(90deg,#C4471C 0%,#E8832F 45%,#FFD08A 100%)", "linear-gradient(90deg,#E4AA7C 0%,#F4AF56 55%,#F8D29C 100%)"),
    ("linear-gradient(90deg,#D9581F,#F2A541)", "linear-gradient(90deg,#E4AA7C,#F4AF56)"),
    ("linear-gradient(90deg,#DA5A22,#F2A541)", "linear-gradient(90deg,#E4AA7C,#F4AF56)"),
    ("#F2A541", "#F4AF56"), ("#FFD08A", "#F8D29C"), ("#E8832F", "#F4AF56"), ("#D9581F", "#E4AA7C"), ("#C4471C", "#E4AA7C"), ("#DA5A22", "#E4AA7C"),
    ("rgba(242,165,65,", "rgba(244,175,86,"), ("rgba(232,131,47,", "rgba(244,175,86,"),
]

def gold(html):
    for a, b in GOLD:
        html = html.replace(a, b)
    return html
