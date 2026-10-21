# Skill sources

Downloaded 2026-10-21 (KST) from public GitHub repos. Contents are copied as published, not edited.

| Folder | Skill (frontmatter `name`) | Source | Commit / version | License |
|---|---|---|---|---|
| `taste/` | `design-taste-frontend` (tasteskill v2) | https://github.com/Leonxlnx/taste-skill/tree/main/skills/taste-skill | `6010f91a9935f1c167dfc500fb1a475681892e6b` (2026-10-20) | MIT (`taste/LICENSE`) |
| `mengto/` | Curated subset of the MengTo/Skills collection (13 skills) | https://github.com/MengTo/Skills/tree/main/agent-skills | `398cd41c86ba42fbb30e944ae507f463648f08b7` (2026-10-18) | MIT, (c) 2026 Meng To (`mengto/LICENSE`) |
| `sprite-gen/` | `sprite-gen` | https://github.com/aldegad/sprite-gen | `fa897a608430e05e08eab61958e3a554fddf9694` (2026-10-21), SKILL version 2.45.2 | Apache-2.0 (`sprite-gen/LICENSE`, `NOTICE`) |
| `dual-brain/` | `sleeplesshan/dual-brain` | the user's own skill (downloaded separately) | - | - |

## Notes
- **taste**: the whole `skills/taste-skill` folder, with the repo LICENSE added and the repo README saved as `REPO_README.md`. The scripts need Node 22+ and Chrome or Chromium. Install upstream with `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"`.
- **mengto**: Meng To publishes no skill called "mengto". MengTo/Skills is a collection of more than 120 skills. These folders were picked for the bento dashboard UI in this project:
  - `ui/`: design-first-ui-prompting, no-ai-design-slop, audit-ai-design-slop
  - `web-design/`: framed-grid-layout, nested-container-frames, dark-glass-clean-layout, glass-dark-ui, funky-purple-container-tech, beautiful-shadows, css-border-gradient, animation-systems, tailwindcss, html-demo
  - `WEB-DESIGN-SKILLS.md` is the upstream index of the web-design skills.
  - To get the full collection, run `npx skills add MengTo/Skills`.
- **sprite-gen**: the full repo, which is the skill: SKILL.md, scripts/, the sprite_gen/ Python package, docs/*.md and pyproject.toml. Three things were left out: `.git`, `tests/`, and `docs/assets/`, which holds about 47 MB of README showcase GIFs and PNGs. To run, it needs Python 3, `codex` or another image provider (grok or openai, with your own credentials), `ffmpeg`, `img2webp`, and optionally `rife-ncnn-vulkan`.
