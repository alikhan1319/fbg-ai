# Start FBR AI backend (kills any old server on port 8000 first)
Set-Location $PSScriptRoot

$conns = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
foreach ($c in $conns) {
    $procId = $c.OwningProcess
    if ($procId -and $procId -ne $PID) {
        Write-Host "Stopping old backend on port 8000 (PID $procId)..."
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2

python main.py
