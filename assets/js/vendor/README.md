# Vendored libraries

`supabase-js-2.118.0.js` is @supabase/supabase-js 2.118.0, bundled into one file, so the shop no longer loads code from an outside server (cdn.jsdelivr.net). That outside copy updated itself to any 2.x version and ran on every page, including the admin page.

To update it (deliberately, then test sign-in, My downloads and the admin page):

```bash
npm i @supabase/supabase-js@<version> esbuild
echo 'export { createClient } from "@supabase/supabase-js";' > entry.mjs
npx esbuild entry.mjs --bundle --format=esm --platform=browser --minify --target=es2020 --outfile=supabase-js-<version>.js
```

Then change the import at the top of `assets/js/lib/api.js` to the new file name.
