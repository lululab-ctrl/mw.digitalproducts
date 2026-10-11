// Premium header behaviour: frosted glass once the page scrolls, and the menu link of the
// section in view gets the gold underline. Works on the home page and the sales pages.
(function () {
  "use strict";
  const root = document.documentElement;
  const onScroll = () => root.classList.toggle("nav-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function watch() {
    const links = Array.from(document.querySelectorAll(".nav .links a[href^='#']"));
    const pairs = links.map((a) => [a, document.getElementById(a.getAttribute("href").slice(1))]).filter((p) => p[1]);
    if (!pairs.length || !("IntersectionObserver" in window)) return false;
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, max = 0;
      pairs.forEach(([a, sec]) => { const r = seen.get(sec) || 0; if (r > max) { max = r; best = a; } });
      // The sales pages re-render their menu; look the links up again each time.
      document.querySelectorAll(".nav .links a").forEach((a) => a.classList.toggle("is-active", !!best && a.getAttribute("href") === best.getAttribute("href")));
    }, { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.01, 0.25, 0.5] });
    pairs.forEach(([, sec]) => io.observe(sec));
    return true;
  }
  let tries = 0;
  (function poll() { if (!watch() && tries++ < 40) setTimeout(poll, 150); })();
})();
