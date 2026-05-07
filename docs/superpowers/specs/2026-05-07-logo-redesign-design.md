# Engineer Interview Hub Logo Redesign Design Spec

**Date:** 2026-05-07  
**Status:** Approved

## Summary

Replace the legacy logo in [assets/img/LOGO.png](/abs/path/c:/Users/User/Documents/GitHub/Engineer-Interview-Hub/assets/img/LOGO.png) with a new raster logo that matches the site's current positioning as a broad software engineering interview platform rather than a frontend-only product.

The new direction keeps the site's blue-cyan technology palette, shifts the concept toward an AI interview assistant, and ensures the central mark can be cropped and reused later as a standalone icon.

## Problem

The current logo still encodes the old brand:

- The text reads `FEH` and `FRONT-END INTERVIEW HUB`
- The symbol is visually dense and strongly tied to frontend-era branding
- The mark does not clearly represent a multi-discipline software engineering platform

This conflicts with the current homepage and product scope, which now includes frontend, backend, data engineering, and DevOps.

## Design Goals

- Reposition the logo from frontend-specific to software-engineering-wide
- Keep enough continuity with the current site that the homepage hero still feels coherent
- Make the central mark usable both inside a full logo lockup and as a future standalone icon
- Preserve strong readability at smaller display sizes
- Reduce decorative noise compared with the current logo

## Chosen Direction

Recommended approach: `AI assistant badge`

The logo should communicate "AI-powered engineering interview assistant" rather than any one engineering discipline. The visual center is an abstract assistant / conversation core, surrounded by restrained engineering cues that suggest multiple domains without overloading the mark.

This direction was chosen over:

- `Initials-led mark`: easier for favicon use, but too weak on product meaning
- `Abstract engineering network`: more brand-like, but less immediately connected to interview assistance

## Visual Language

### Core symbol

- A clean assistant / conversation-centered mark
- Avoid realistic microphone rendering or a literal robot face
- Keep the silhouette simple enough to survive cropping and downscaling

### Engineering cues

- Use a small number of nodes, links, brackets, or code-like accents around the core
- The outer cues should imply multiple engineering domains, not just frontend
- Detail should remain secondary to the core symbol

### Color

- Primary palette: blue-cyan technology gradient
- Compatible with the current dark hero section in [pages/index.vue](/abs/path/c:/Users/User/Documents/GitHub/Engineer-Interview-Hub/pages/index.vue)
- Use highlights sparingly; avoid excessive glows or spark effects

### Typography

- Full lockup text: `Engineer Interview Hub`
- Do not use `FEH` or `Front-End Interview Hub`
- Use a clean geometric sans-serif look so the wordmark and icon can stand independently

### Background handling

- Prioritize legibility on the existing dark homepage hero
- Keep the generated background clean and minimal
- Avoid decorative borders, extra frames, or noisy ambient effects

## Deliverables

### Primary asset

- One new raster logo to replace `assets/img/LOGO.png`

### Composition requirements

- The image must contain a full logo lockup suitable for the homepage
- The central icon must be composed so it can later be cropped into a standalone mark

### Text requirements

- The only brand text in the final logo should be `Engineer Interview Hub`

## Usage Context

Primary use case:

- Homepage hero in [pages/index.vue](/abs/path/c:/Users/User/Documents/GitHub/Engineer-Interview-Hub/pages/index.vue)

Secondary expected behavior:

- Still readable on lighter backgrounds if reused elsewhere

## Success Criteria

The redesign is successful if it:

- No longer reads as frontend-only branding
- Looks like an engineering platform with AI interview assistance
- Uses less ornamental detail than the current logo
- Remains recognizable when scaled down
- Feels visually compatible with the current homepage dark hero

## Out of Scope

- Building a full brand identity system
- Producing SVG or vector source in this step
- Generating multiple finalized production variants for every placement
- Updating all downstream brand assets in the same pass
