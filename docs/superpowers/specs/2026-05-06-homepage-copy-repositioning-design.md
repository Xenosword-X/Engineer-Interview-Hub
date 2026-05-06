# Homepage Copy Repositioning Design

## Goal

Update the homepage copy so the product is clearly positioned as an interview preparation platform for multiple engineering roles instead of a frontend-only product.

## Scope

This change covers homepage-facing copy only:

- Hero badge, headline, subheadline, and CTA labels
- Homepage feature card copy
- Homepage SEO title and description
- Supporting tagline string used for platform positioning

This change does not alter:

- Routing
- Feature behavior
- Question taxonomy
- Interview flow logic

## Approved Direction

Use the "A" positioning direction approved by the user:

- Primary message: `工程師面試準備平台`
- Supporting message: cover frontend, backend, data engineering, DevOps, and full-stack roles
- Tone: clear, practical, product-level positioning

## Content Rules

- Remove frontend-only wording from homepage positioning
- Keep references to AI scoring and AI mock interviews
- Keep copy concise and product-oriented
- Maintain equivalent meaning across `zh` and `en`

## Files

- `i18n/i18n/zh.json`
- `i18n/i18n/en.json`

## Verification

- Confirm homepage keys still exist under `home.*`
- Confirm JSON remains valid
- Confirm no homepage SEO strings still say `frontend`
