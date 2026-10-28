# SiteMinder shared design rules

## CTR story-card heading emphasis
- All four `.sb-story-hero h2` headings must highlight only their final word, including trailing punctuation, using the shared existing blue `<em>` style in every language.
- Run `node scripts/highlight-story-headings.mjs` after changing or generating these headings. It preserves copy and line breaks and uses `Intl.Segmenter` for language-aware word boundaries, including Thai without spaces. Never split Thai by whitespace or by character.

## CTR hero report badge
- The English badge defines spacing for every language. All locales use the shared component in `dist/assets/report-navigation-update.css`; never add language-specific badge padding, gap, typography, or year-chip sizing.
- Use two children: `.hero-report-name` for the report label and `.hero-report-year` for the edition year. The year chip stays last.
- Preserve the English desktop and mobile spacing tokens. Long labels may wrap; never reduce padding or font size for a particular language.
- Use `localization/hero-badge.py` to normalize badge markup without regenerating pages or changing hero animation assets. The French/Portuguese generator reuses the same helper.
- Before publishing a badge change, compare computed padding, gap and chip height for all seven languages at desktop, tablet and narrow mobile widths.

Apply these rules to every SiteMinder project worked on from this workspace.

## Approved arrows
- Use the user-supplied `assets/brand/arrow-right.svg` for link and CTA arrows. Copy this exact file into each site's tracked public assets.
- Do not use Unicode/text arrows, diagonal/external-link arrows, emoji arrows, CSS-drawn substitutes or a different icon-library arrow.
- Keep arrows horizontal and pointing right for links and forward actions. Rotate the same SVG 180 degrees for Back actions.
- Chevrons are for disclosure/dropdown controls only; they are not substitutes for link arrows.
- Reuse a shared Arrow component and inherit colour from the surrounding control. CSS masking of the approved SVG is permitted; preserve the source SVG geometry.
- Current React reference: `homepage-refresh/app/Arrow.tsx`; published asset: `/assets/brand/arrow-right.svg`.
- Include this rule and the approved asset when creating, copying or handing off any new SiteMinder project.

## Composite controls
- Search input and submit icon/button form one control. Apply a rounded focus-within border/ring to the whole wrapper, including the icon/button, with no separate truncated outline on the input.
- Check both keyboard and pointer focus before publishing.

## Responsive forms and non-negotiable padding
- Preserve consistent padding on every side of every control, at every viewport width and in every state. Never sacrifice padding, shrink typography, or overlap text/icons to force a row to fit. Wrap the fields instead.
- Use intrinsic field wrapping: repeat(auto-fit, minmax(min(100%, 184px), 1fr)) with a 16px column gap. Keep two fields side by side only when both fit; stack on narrow desktop panels and narrow mobile panels.
- Form foundation: Source Sans 3, 16px/24px input text, 14px labels, minimum 48px control height, 8px radius, 10px vertical and 14px horizontal padding. Maintain these values across breakpoints.
- Every select must reserve a 16px disclosure chevron, 14px inset from the right edge, plus a 10px gap from text (40px total right padding). Use appearance:none and the shared chevron SVG so browser-native arrows cannot sit against the border. This applies equally to goals, roles, countries and future dropdowns.
- Labels and optional indicators may wrap; never remove their spacing. Short descriptive placeholders avoid repeating long field labels inside selects.
- Use box-sizing:border-box and min-width:0 on containers. Do not hide overflow to conceal broken form layout.
- Reference implementation: homepage-refresh/app/siteminder-forms.css (app/siteminder-forms.css inside the site); reusable copy: assets/brand/siteminder-forms.css. Carry these tokens, patterns, disclosure SVG and rules into new SiteMinder projects.
- Before publishing, check both form steps, single/multiple property modes, narrow desktop before the mobile breakpoint, narrow/wide mobile, long selected values, and keyboard focus. Padding is a requirement, never optional.
