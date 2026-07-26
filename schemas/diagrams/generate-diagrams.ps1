param(
  [string]$Theme = "neutral",
  [int]$Scale = 2
)

$ErrorActionPreference = "Stop"

Set-Location -Path $PSScriptRoot

function Render-Diagram {
  param(
    [string]$InputFile,
    [string]$OutputFile
  )

  Write-Host "Rendering $InputFile -> $OutputFile"
  npx --yes @mermaid-js/mermaid-cli@11.9.0 -i $InputFile -o $OutputFile -t $Theme -b transparent -s $Scale
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to render $InputFile"
  }
}

Render-Diagram "overview.mmd" "overview.png"
Render-Diagram "journey.mmd" "journey.png"
Render-Diagram "module-1-lead.mmd" "module-1-lead.png"
Render-Diagram "module-2-docs.mmd" "module-2-docs.png"
Render-Diagram "module-3-installation.mmd" "module-3-installation.png"
Render-Diagram "module-4-money.mmd" "module-4-money.png"
Render-Diagram "er-diagram-full.mmd" "er-diagram-full.png"
Render-Diagram "er-diagram-full.mmd" "er-diagram-full.svg"
Render-Diagram "er-diagram-roles.mmd" "er-diagram-roles.png"

Write-Host "All diagrams generated."
