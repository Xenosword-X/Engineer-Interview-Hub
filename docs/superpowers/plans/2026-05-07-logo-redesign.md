# Logo Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a new Engineer Interview Hub logo, replace `assets/img/LOGO.png`, and verify it fits the current homepage positioning.

**Architecture:** The work stays asset-only. Generate one raster logo from the approved spec, move the chosen output into `assets/img/LOGO.png`, and verify the existing homepage reference in `pages/index.vue` continues to render the new logo without code changes.

**Tech Stack:** Codex built-in image generation, PowerShell file operations, existing Nuxt asset pipeline

---

## File Structure

- `docs/superpowers/specs/2026-05-07-logo-redesign-design.md`: approved design reference for prompt construction
- `assets/img/LOGO.png`: final raster logo asset to replace
- `pages/index.vue`: existing homepage consumer of the logo asset; verify only, no change expected

### Task 1: Generate the Replacement Logo

**Files:**
- Read: `docs/superpowers/specs/2026-05-07-logo-redesign-design.md`
- Inspect: `assets/img/LOGO.png`
- Create temporarily: Codex built-in generated image output outside the repo

- [ ] **Step 1: Re-read the approved design spec and current asset**

Use these references before prompting:

```text
Spec: docs/superpowers/specs/2026-05-07-logo-redesign-design.md
Current asset: assets/img/LOGO.png
Homepage consumer: pages/index.vue
```

- [ ] **Step 2: Generate one primary logo candidate with the approved prompt**

Use this exact prompt with the built-in image generation tool:

```text
Use case: logo-brand
Asset type: website brand logo for a software engineering interview platform
Primary request: Create a polished raster logo for "Engineer Interview Hub" that replaces an old frontend-only brand mark. The logo must communicate an AI-powered engineering interview assistant for multiple software engineering domains, not just frontend.
Scene/backdrop: clean minimal presentation background, no decorative frame, no ambient scene
Subject: a central assistant or conversation core symbol that can be cropped later into a standalone icon, surrounded by restrained engineering cues such as a few nodes, links, brackets, or abstract code accents that imply frontend, backend, data engineering, and DevOps without clutter
Style/medium: modern technology brand logo, crisp vector-like raster rendering, geometric, clean, professional
Composition/framing: full logo lockup with the icon centered above or integrated with the wordmark; the icon must remain readable when isolated; balanced spacing; square composition suitable for the existing homepage asset slot
Lighting/mood: confident, clean, intelligent, minimal
Color palette: blue-cyan technology gradient compatible with a dark homepage hero, subtle highlights only
Text (verbatim): "Engineer Interview Hub"
Constraints: do not use the initials FEH; do not use the text Front-End Interview Hub; avoid realistic microphones, robot faces, noisy glow effects, excessive sparkles, ornamental borders, and dense decorative detail; keep the mark recognizable at small sizes
Avoid: watermark, mockup scene, device frame, extra slogans, extra text, frontend-only symbolism
```

- [ ] **Step 3: Inspect the generated result and accept only if it meets the spec**

Review against this checklist:

```text
- Reads as Engineer Interview Hub, not frontend-only
- Uses blue-cyan palette
- Central icon is simple enough to crop later
- Full wordmark says exactly "Engineer Interview Hub"
- No FEH, no decorative frame, no noisy glow overload
```

- [ ] **Step 4: If the first output fails, iterate with one targeted correction**

Use one correction prompt only if needed:

```text
Keep the overall concept, but simplify the symbol and reduce decorative detail. Make the central assistant/conversation mark clearer, keep the engineering cues minimal, and ensure the wordmark reads exactly "Engineer Interview Hub" with clean professional typography.
```

- [ ] **Step 5: Commit the plan-progress checkpoint**

```bash
git add docs/superpowers/plans/2026-05-07-logo-redesign.md
git commit -m "Add logo redesign implementation plan"
```

### Task 2: Replace the Project Asset

**Files:**
- Modify: `assets/img/LOGO.png`

- [ ] **Step 1: Copy the selected generated image into the project asset path**

Use PowerShell to locate the newest generated image, inspect the reported path, then copy the selected file into place:

```powershell
$latest = Get-ChildItem "$HOME\.codex\generated_images" -Recurse -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
$latest.FullName
Copy-Item -LiteralPath $latest.FullName -Destination "c:\Users\User\Documents\GitHub\Engineer-Interview-Hub\assets\img\LOGO.png" -Force
```

- [ ] **Step 2: Confirm the replacement file exists and has image dimensions**

Run:

```powershell
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\User\Documents\GitHub\Engineer-Interview-Hub\assets\img\LOGO.png")
"{0}x{1}" -f $img.Width, $img.Height
$img.Dispose()
```

Expected:

```text
A valid width x height value such as 1024x1024
```

- [ ] **Step 3: Inspect the replaced asset locally**

Open:

```text
assets/img/LOGO.png
```

Confirm:

```text
- The logo text is correct
- The mark is visually cleaner than the legacy asset
- The icon remains distinct from the wordmark
```

- [ ] **Step 4: Commit the asset replacement**

```bash
git add assets/img/LOGO.png
git commit -m "Replace legacy logo with engineer hub brand mark"
```

### Task 3: Verify Homepage Compatibility

**Files:**
- Verify: `pages/index.vue`

- [ ] **Step 1: Confirm the homepage still references the same asset path**

Run:

```powershell
Select-String -Path "c:\Users\User\Documents\GitHub\Engineer-Interview-Hub\pages\index.vue" -Pattern "assets/img/LOGO.png|~/assets/img/LOGO.png"
```

Expected:

```text
An existing match showing the homepage still uses ~/assets/img/LOGO.png
```

- [ ] **Step 2: Verify no code changes are required for the homepage consumer**

Run:

```bash
git diff -- pages/index.vue
```

Expected:

```text
No new changes introduced for pages/index.vue as part of the logo replacement task
```

- [ ] **Step 3: Record final verification**

Confirm these final conditions:

```text
- assets/img/LOGO.png is updated
- pages/index.vue still points to the same asset path
- The new logo matches the approved logo redesign spec
```

- [ ] **Step 4: Commit the verification checkpoint**

```bash
git add assets/img/LOGO.png docs/superpowers/plans/2026-05-07-logo-redesign.md
git commit -m "Verify homepage compatibility for new logo"
```
