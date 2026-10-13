-- MWP Field Guides: show "229 pages" (60 + 53 + 47 + 69, per language) instead of "4 pages".
update public.products set item_count = 229 where slug = 'mwp-field-guides' and item_count = 4;
