"""A tiny script for the <head> of the home and beta pages (both send signed-in ambassadors to My downloads
when they arrive, see assets/js/lib/landing.js).

Without it the page paints first and then jumps, which looks like a flicker. When someone arrives from
outside the site with a saved sign-in, the page stays invisible until landing.js has decided (at most 2.5 s).
Everyone else (no sign-in, or clicking around the site) sees the page at once, as before.
"""

LANDING_GUARD = """<script>(function(){try{
if(sessionStorage.getItem("mwp_landed"))return;
if(document.referrer&&new URL(document.referrer).origin===location.origin)return;
for(var i=0;i<localStorage.length;i++){if(/^sb-.+-auth-token$/.test(localStorage.key(i))){
var d=document.documentElement;d.style.visibility="hidden";
setTimeout(function(){d.style.visibility=""},2500);return}}
}catch(e){}})();</script>"""
