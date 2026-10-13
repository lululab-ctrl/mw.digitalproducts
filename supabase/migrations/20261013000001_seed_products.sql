-- The seven MWP products, so their files and prices have somewhere to live.
-- All start hidden (is_active = false) at $0.00: prices, copy and going live are set in the admin
-- after Matan approves. Facts are taken from the sales pages. Existing products are left as they are.
insert into public.products (slug, name, name_emphasis, category, tagline, includes, price_cents, version, item_count, is_active, sort_order)
values
  ('mwp-presets', 'MWP', 'Presets', 'preset', 'The look behind every MWP frame.',
    array['50 Lightroom presets, 12 adaptive', '50 mobile files and 33 LUTs', 'Install guide for every program'], 0, '1.1', 50, false, 10),
  ('mwp-panel', 'MWP', 'Panel', 'plugin', 'You were there. Now make the photo show it.',
    array['8 one-click effects', '11 looks and 4 painted lights', 'User manual and install guide'], 0, '2.2.0', null, false, 20),
  ('mwp-field-guides', 'MWP', 'Field Guides', 'guide', 'See the photo before you press the shutter.',
    array['4 PDF guides, 137 lessons', 'Composition, colour, light and planning', 'English and Hebrew'], 0, '1.0', 4, false, 30),
  ('presets-field-guides', 'Presets +', 'Field Guides', 'bundle', 'Shoot it, then edit it',
    array['MWP Presets: 50 presets and 33 LUTs', 'MWP Field Guides: 4 PDF guides, 137 lessons', 'Composition, colour, light and planning'], 0, '1.0', null, false, 40),
  ('presets-panel', 'Presets +', 'Panel', 'bundle', 'Lightroom and Photoshop',
    array['MWP Presets: 50 presets and 33 LUTs', 'MWP Panel: the Photoshop plugin', 'User manual and install guide'], 0, '1.0', null, false, 50),
  ('field-guides-panel', 'Field Guides +', 'Panel', 'bundle', 'Learn to shoot, then edit in Photoshop',
    array['4 field guides, English and Hebrew', 'MWP Panel: Photoshop plugin', 'User manual and installation guide'], 0, '1.0', null, false, 60),
  ('full-set', 'The full', 'set', 'bundle', 'From the shot to the share',
    array['MWP Presets: 50 presets and 33 LUTs', 'MWP Panel: the Photoshop plugin', 'MWP Field Guides: 4 PDF guides, 137 lessons'], 0, '1.0', null, false, 70)
on conflict (slug) do nothing;
