// ============================================================================
// Product categories and the line icons used across the shop.
// Add a category here (and to the check constraint in migration 004) to give
// it a shelf tile, a filter chip and its own placeholder art.
// ============================================================================

const svg = (paths) =>
  `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const ICONS = {
  // three sliders: tonal adjustments
  preset: svg('<path d="M10 14h28M10 24h28M10 34h28"/><circle cx="18" cy="14" r="4" fill="var(--icon-fill, #fff)"/><circle cx="31" cy="24" r="4" fill="var(--icon-fill, #fff)"/><circle cx="22" cy="34" r="4" fill="var(--icon-fill, #fff)"/>'),
  // puzzle piece: something that plugs in
  plugin: svg('<path d="M12 18h7a4 4 0 1 1 8 0h7v7a4 4 0 1 1 0 8v7H12V33a4 4 0 1 0 0-8z"/>'),
  // open book: guides and PDFs
  guide: svg('<path d="M24 14c-4-3-9-4-14-3v24c5-1 10 0 14 3 4-3 9-4 14-3V11c-5-1-10 0-14 3z"/><path d="M24 14v24"/>'),
  // stacked layers: bundles
  bundle: svg('<path d="M24 9l15 8-15 8-15-8z"/><path d="M9 25l15 8 15-8"/><path d="M9 32l15 8 15-8"/>'),
  // parcel: anything else
  other: svg('<path d="M9 16l15-7 15 7v17l-15 7-15-7z"/><path d="M9 16l15 7 15-7M24 23v17"/>'),

  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 18l-1 3 4-2h8a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v6a4 4 0 0 0 1 3z"/></svg>',
};

export const CATEGORIES = {
  preset: { label: "Presets", one: "Preset pack", unit: "presets", desc: "Lightroom and Camera Raw looks for real field light" },
  plugin: { label: "Plugin", one: "Plugin", unit: null, desc: "Our photo editing plugin" },
  guide: { label: "Guides & PDFs", one: "Guide", unit: "pages", desc: "Field guides and editing workflows to read and keep" },
  bundle: { label: "Bundles", one: "Bundle", unit: "products", desc: "Several products together for less" },
  other: { label: "More", one: "Product", unit: null, desc: "Everything else" },
};

export const SHELF_ORDER = ["preset", "plugin", "guide", "bundle"];

export function categoryOf(p) {
  return CATEGORIES[p.category] ? p.category : "other";
}

/** "12 presets", "48 pages", or "" when the category has no unit or no count. */
export function countLabel(p) {
  const unit = CATEGORIES[categoryOf(p)].unit;
  return unit && p.item_count ? `${p.item_count} ${unit}` : "";
}
