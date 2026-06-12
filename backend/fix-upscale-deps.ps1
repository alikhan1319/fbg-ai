# Fix upscale + opencv/rembg (run once from backend folder)
Set-Location $PSScriptRoot
$py = ".\.venv311\Scripts\python.exe"
if (-not (Test-Path $py)) { Write-Error "Run: python main.py --setup"; exit 1 }

& $py -m pip uninstall -y opencv-python opencv-contrib-python 2>$null
& $py -m pip install "numpy==1.26.4" "opencv-python-headless==4.9.0.80" "rembg==2.0.59"
& $py -c "from advanced_upscale import _get_cached_upsampler, UpscaleConfig; _get_cached_upsampler(UpscaleConfig(target_size='x2')); print('Real-ESRGAN is ready. Restart: python main.py')"
