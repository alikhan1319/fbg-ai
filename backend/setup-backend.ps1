# One-time backend setup: Python 3.11 venv + all dependencies
Set-Location $PSScriptRoot
py -3.11 main.py --setup 2>$null
if ($LASTEXITCODE -ne 0) { python main.py --setup }
