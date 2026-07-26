# ADP Green Energies - Data Model Pack

This folder is ready to commit as a standalone database/diagram package.

## Contents

- `DB-SCHEMA.md` - human-readable schema spec and business rules
- `sql/001_init_schema.sql` - executable PostgreSQL schema migration
- `diagrams/*.mmd` - editable Mermaid source files
- `diagrams/*.png`, `diagrams/*.svg` - rendered diagram assets
- `diagrams/generate-diagrams.ps1` - regeneration script for all diagram assets

## Apply schema

```powershell
psql -h <host> -U <user> -d <database> -f .\adp-green-energies\sql\001_init_schema.sql
```

## Regenerate diagrams

```powershell
powershell -ExecutionPolicy Bypass -File .\adp-green-energies\diagrams\generate-diagrams.ps1
```

> The script uses a pinned Mermaid CLI version for reproducible output.
