"""Image loading order for the home and sales pages: the hero photo loads first (fetchpriority="high"),
every image after the hero section waits until it's near the screen (loading="lazy"). Safe to run again."""
import re

def prioritize(html, hero_open, hero_img_class):
    start = html.find(hero_open)
    if start < 0:
        return html
    end = html.find("</section>", start)
    head, rest = html[:end], html[end:]
    head = re.sub(r'<img class="%s"(?![^>]*fetchpriority)' % re.escape(hero_img_class),
                  f'<img class="{hero_img_class}" fetchpriority="high"', head, count=1)
    rest = re.sub(r'<img\b(?![^>]*\bloading=)', '<img loading="lazy"', rest)
    return head + rest
