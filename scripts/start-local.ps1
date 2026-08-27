[CmdletBinding()]
param(
  [switch]$SinActualizar,
  [switch]$SoloComprobar
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectDir = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectDir

function Invoke-Checked {
  param(
    [Parameter(Mandatory)][string]$FilePath,
    [Parameter(Mandatory)][string[]]$Arguments
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "El comando terminó con código $LASTEXITCODE."
  }
}

Write-Host ""
Write-Host "AscencionRO · inicio local" -ForegroundColor Yellow
Write-Host ""

$gitCommand = Get-Command git.exe -ErrorAction SilentlyContinue
$hasGitRepository = $gitCommand -and (Test-Path -LiteralPath ".git")
$repositoryClean = $false
if ($hasGitRepository) {
  $pending = & $gitCommand.Source status --porcelain
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo revisar el estado del repositorio."
  }

  if (-not $SinActualizar -and $pending) {
    Write-Host "Hay cambios locales; se conservarán y no se descargará una actualización automática." -ForegroundColor DarkYellow
  } elseif (-not $SinActualizar) {
    Write-Host "Buscando la última versión pública..."
    Invoke-Checked -FilePath $gitCommand.Source -Arguments @(
      "fetch",
      "https://github.com/CidZigon/ascencion-ro-guia.git",
      "main"
    )
    Invoke-Checked -FilePath $gitCommand.Source -Arguments @("merge", "--ff-only", "FETCH_HEAD")
  }

  $pending = & $gitCommand.Source status --porcelain
  $repositoryClean = -not [bool]$pending
} elseif (-not $SinActualizar -and -not $gitCommand) {
  Write-Host "Git no está disponible; se abrirá la copia que ya tienes." -ForegroundColor DarkYellow
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$bundledRoot = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies"
$bundledNode = Join-Path $bundledRoot "node\bin\node.exe"
$bundledPnpm = Join-Path $bundledRoot "node\node_modules\pnpm\bin\pnpm.mjs"

if ($nodeCommand) {
  $nodePath = $nodeCommand.Source
} elseif (Test-Path -LiteralPath $bundledNode) {
  $nodePath = $bundledNode
  $env:Path = "$(Split-Path -Parent $bundledNode);$env:Path"
} else {
  throw "Necesitas Node.js 22 o superior. Instálalo una sola vez desde https://nodejs.org/"
}

$nodeMajor = [int](& $nodePath -p "process.versions.node.split('.')[0]")
if ($LASTEXITCODE -ne 0 -or $nodeMajor -lt 22) {
  throw "AscencionRO necesita Node.js 22 o superior."
}

$pnpmCommand = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
$corepackCommand = Get-Command corepack.cmd -ErrorAction SilentlyContinue
if ($pnpmCommand) {
  $packageRunner = $pnpmCommand.Source
  $packagePrefix = @()
} elseif ($corepackCommand) {
  $packageRunner = $corepackCommand.Source
  $packagePrefix = @("pnpm")
} elseif (Test-Path -LiteralPath $bundledPnpm) {
  $packageRunner = $nodePath
  $packagePrefix = @($bundledPnpm)
} else {
  throw "No se encontró pnpm. Activa Corepack o instala pnpm una sola vez."
}

function Invoke-Pnpm {
  param([Parameter(Mandatory)][string[]]$Arguments)
  Invoke-Checked -FilePath $packageRunner -Arguments @($packagePrefix + $Arguments)
}

$runtimeDir = Join-Path $projectDir ".local-runtime"
$markerPath = Join-Path $runtimeDir "pnpm-lock.sha256"
$modulesManifest = Join-Path $projectDir "node_modules\.modules.yaml"
$lockHash = (Get-FileHash -LiteralPath (Join-Path $projectDir "pnpm-lock.yaml") -Algorithm SHA256).Hash
$installedHash = if (Test-Path -LiteralPath $markerPath) { (Get-Content -LiteralPath $markerPath -Raw).Trim() } else { "" }

if (-not (Test-Path -LiteralPath $modulesManifest) -or $installedHash -ne $lockHash) {
  Write-Host "Preparando dependencias (sólo es necesario la primera vez o después de una actualización)..."
  Invoke-Pnpm -Arguments @("install", "--frozen-lockfile")
  New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
  Set-Content -LiteralPath $markerPath -Value $lockHash -Encoding ascii
}

New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$buildMarkerPath = Join-Path $runtimeDir "build.sha"
$serverEntry = Join-Path $projectDir "dist\server\index.js"
$buildKey = if ($repositoryClean) { (& $gitCommand.Source rev-parse HEAD).Trim() } else { "" }
$builtKey = if (Test-Path -LiteralPath $buildMarkerPath) { (Get-Content -LiteralPath $buildMarkerPath -Raw).Trim() } else { "" }

if (-not (Test-Path -LiteralPath $serverEntry) -or -not $repositoryClean -or $builtKey -ne $buildKey) {
  Write-Host "Optimizando la versión actual..."
  Invoke-Checked -FilePath $nodePath -Arguments @(".\node_modules\vinext\dist\cli.js", "build")
  if ($repositoryClean) {
    Set-Content -LiteralPath $buildMarkerPath -Value $buildKey -Encoding ascii
  }
}

$outputLog = Join-Path $runtimeDir "server.log"
$errorLog = Join-Path $runtimeDir "server-error.log"
$serverArgs = @(".\node_modules\vinext\dist\cli.js", "start", "--hostname", "127.0.0.1", "--port", "3000")

Write-Host "Iniciando el sitio..."
$server = Start-Process -FilePath $nodePath -ArgumentList $serverArgs -WorkingDirectory $projectDir -WindowStyle Hidden -RedirectStandardOutput $outputLog -RedirectStandardError $errorLog -PassThru
$url = "http://127.0.0.1:3000/#inicio"
$ready = $false

try {
  for ($attempt = 0; $attempt -lt 120; $attempt++) {
    if ($server.HasExited) {
      $details = if (Test-Path -LiteralPath $errorLog) { (Get-Content -LiteralPath $errorLog -Raw).Trim() } else { "" }
      throw "El servidor se detuvo antes de iniciar. $details"
    }

    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 1
      if ($response.StatusCode -lt 500) {
        $ready = $true
        break
      }
    } catch {
      Start-Sleep -Milliseconds 250
    }
  }

  if (-not $ready) {
    throw "El sitio tardó demasiado en responder."
  }

  if ($SoloComprobar) {
    Write-Host "El iniciador local respondió correctamente." -ForegroundColor Green
    return
  }

  Start-Process $url
  Write-Host ""
  Write-Host "AscencionRO está abierto en $url" -ForegroundColor Green
  Write-Host "Mantén esta ventana abierta. Ciérrala para detener el servidor local."
  Wait-Process -Id $server.Id
} finally {
  if (-not $server.HasExited) {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
  }
}
