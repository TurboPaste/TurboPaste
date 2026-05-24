---
title: Localization
description: How TurboPaste's web UI is translated, and how to add a new language.
---

The web app at `apps/web` is fully translated through [`react-i18next`](https://react.i18next.com/). Strings live in JSON files under `apps/web/src/i18n/locales/`, one file per language. A language switcher in the header lets users pick at runtime; their choice is saved in `localStorage`.

## What's translated

- All user-facing UI in `apps/web`: routes, forms, dialogs, toasts, page `<title>` and `<meta>` description, and `aria-label`s.
- Zod validation messages in the sign-in / sign-up forms.

## What's _not_ translated

- **Server error messages.** Toasts that surface `e.message` from a tRPC error show the raw server string. Translating those properly requires server-side i18n, which is a separate concern.
- **Database-derived strings.** Paste titles, language identifiers, and visibility values stored on the row are rendered as-is. Visibility _labels_ in the home form and owner edit view _are_ translated, because those are picked from a fixed enum.
- **The docs site** (this site). Starlight has its own i18n system; we will set up [Starlight's built-in i18n](https://starlight.astro.build/guides/i18n/) in the future. Create a PR if you'd like to help with that!

## How language is chosen

The detection chain is configured in [`apps/web/src/i18n/index.ts`](https://github.com/TurboPaste/TurboPaste/blob/main/apps/web/src/i18n/index.ts):

```ts
detection: {
  caches: ["localStorage"],
  lookupLocalStorage: "turbopaste-language",
  order: ["localStorage", "navigator"],
},
fallbackLng: "en",
load: "languageOnly",
supportedLngs: Object.keys(resources),
```

Resolution order on each load:

1. **`localStorage["turbopaste-language"]`** if present. Set every time the user picks a language in the header switcher.
2. **`navigator.language`** otherwise. Region tags are stripped (`tr-TR` → `tr`, `en-US` → `en`) before lookup.
3. **`fallbackLng: "en"`** if neither resolves to a supported locale.

`supportedLngs` is derived from the `resources` object, so unknown browser locales fall through cleanly instead of trying to fetch a non-existent bundle.

## Key conventions

- **Namespaces by feature:** top-level keys mirror surface area: `home`, `dashboard`, `paste`, `admin`, `report`, `auth.signIn`, `auth.signUp`, `header`, `userMenu`, `modeToggle`, `languageToggle`, `common`, `meta`, `docs`.
- **Interpolation uses `{{var}}`:** for example `home.bytesCount: "{{current}} / {{max}} bytes"` and `paste.expires: "expires {{date}}"`. Pass the values as the second argument to `t()`: `t("paste.expires", { date: fmtDate(meta.expiresAt) })`.
- **Enumerations use the value as the key.** Expirations, visibilities, and report reasons all live under namespaces keyed by their stored value:

  ```json
  "home.expirations.1d": "1 day",
  "home.visibilities.public.label": "Public",
  "report.reasons.spam": "Spam"
  ```

  The iteration code stays a simple `t("namespace.${value}")`, so adding a new enum option only needs one new entry in each locale.
- **Type-safe keys** — [`i18next.d.ts`](https://github.com/TurboPaste/TurboPaste/blob/main/apps/web/src/i18n/i18next.d.ts) augments `i18next`'s `CustomTypeOptions` to use `en.json` as the canonical key shape. TypeScript flags typos in `t()` calls and missing keys in non-English locale files.

## Adding a new language

The example below adds Japanese (`ja`). The same three steps work for any locale.

### 1. Create the locale file

Copy `apps/web/src/i18n/locales/en.json` to `apps/web/src/i18n/locales/ja.json` and translate the values. **Don't rename keys**, the TypeScript augmentation expects every locale to have the same shape as `en.json`, and `tsc` will complain if anything is missing.

### 2. Register it in `i18n/index.ts`

```ts
import ja from "./locales/ja.json";

export const resources = {
  en: { translation: en },
  tr: { translation: tr },
  ja: { translation: ja },
} as const;
```

`supportedLngs` reads from `Object.keys(resources)`, so the detector picks up the new locale automatically.

### 3. Add the endonym to the language switcher

In [`apps/web/src/components/language-toggle.tsx`](https://github.com/TurboPaste/TurboPaste/blob/main/apps/web/src/components/language-toggle.tsx):

```ts
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  tr: "Türkçe",
  ja: "日本語",
};
```

The convention is to display each language in its own name (an endonym) so users who can't read the current UI can still find their language. Missing entries fall back to the uppercased code.

That's it, the switcher will list `ja` automatically, and a browser running in Japanese will get it as the default on first visit.

## Troubleshooting

- **Switcher doesn't show a language I just added.** Make sure you added it to both `resources` in `i18n/index.ts` and to `LANGUAGE_NAMES` in `language-toggle.tsx`. The switcher reads from `Object.keys(resources)`; the names map is just for the visible label.
- **`tsc` errors about missing keys.** The type augmentation enforces every locale to match `en.json`. If you added a new key, add it to every locale file, or temporarily fill it with the English value as a placeholder.
- **My selected language doesn't survive a refresh.** Open Local Storage and check for `turbopaste-language`. If the value isn't there, something is clearing storage (incognito mode, browser settings, an extension). The switcher writes through `i18n.changeLanguage()` automatically because `caches: ["localStorage"]` is set.
