# Diagram Assets

## Canonical source files

- `overview.mmd`
- `journey.mmd`
- `module-1-lead.mmd`
- `module-2-docs.mmd`
- `module-3-installation.mmd`
- `module-4-money.mmd`
- `er-diagram-full.mmd`
- `er-diagram-roles.mmd`

These are the source-of-truth files. Generated images are committed to the repo.

## Regenerate all images

```powershell
powershell -ExecutionPolicy Bypass -File .\generate-diagrams.ps1
```

Generated outputs:

- `overview.png`
- `journey.png`
- `module-1-lead.png`
- `module-2-docs.png`
- `module-3-installation.png`
- `module-4-money.png`
- `er-diagram-full.png`
- `er-diagram-full.svg`
- `er-diagram-roles.png`

## Legacy files

- `diagram-1.mmd`
- `diagram-2.mmd`

These were earlier drafts and are kept only for historical traceability.
