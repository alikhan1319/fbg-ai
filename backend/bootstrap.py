"""
Ensure backend runs with the project virtualenv and required packages.

Called at the very start of main.py (stdlib only).
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
VENV_DIR = BASE_DIR / ".venv311"
REQUIREMENTS = BASE_DIR / "requirements.txt"

_IS_WINDOWS = sys.platform == "win32"


def _venv_python(venv_root: Path) -> Path:
    if _IS_WINDOWS:
        return venv_root / "Scripts" / "python.exe"
    return venv_root / "bin" / "python"


def _venv_candidates() -> list[Path]:
    names = (".venv311", "venv", ".venv")
    return [_venv_python(BASE_DIR / name) for name in names]


def _same_python(a: Path, b: Path) -> bool:
    try:
        return a.resolve() == b.resolve()
    except OSError:
        return False


def _venv_is_broken(python_exe: Path) -> bool:
    """True when venv exists but its base interpreter is missing (e.g. copied from another PC)."""
    venv_root = python_exe.parent.parent
    cfg = venv_root / "pyvenv.cfg"
    if cfg.is_file():
        for line in cfg.read_text(encoding="utf-8").splitlines():
            if line.startswith("home = "):
                home = Path(line.split("=", 1)[1].strip().strip('"'))
                base = home / "python.exe" if _IS_WINDOWS else home / "bin" / "python3"
                if not base.is_file():
                    return True
                break
    try:
        subprocess.run(
            [str(python_exe), "--version"],
            check=True,
            capture_output=True,
            text=True,
        )
        return False
    except (subprocess.CalledProcessError, OSError):
        return True


def _relaunch_with(python_exe: Path) -> None:
    main_script = str((BASE_DIR / "main.py").resolve())
    args = [str(python_exe.resolve()), main_script, *sys.argv[1:]]
    print(f"[FBR] Using project Python: {python_exe.resolve()}")
    if _IS_WINDOWS:
        raise SystemExit(subprocess.call(args))
    os.execv(str(python_exe.resolve()), args)


def _find_python_311() -> list[str]:
    if _IS_WINDOWS:
        return ["py", "-3.11"]
    return ["python3.11"]


def _create_venv() -> Path:
    py = _venv_python(VENV_DIR)
    if py.is_file():
        return py

    print("Creating virtual environment at backend/.venv311 ...")
    launcher = _find_python_311() if _IS_WINDOWS else [sys.executable]
    try:
        subprocess.run(
            [*launcher, "-m", "venv", str(VENV_DIR)],
            cwd=str(BASE_DIR),
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        subprocess.run(
            [sys.executable, "-m", "venv", str(VENV_DIR)],
            cwd=str(BASE_DIR),
            check=True,
        )
    return py


def _pip_install(python_exe: Path) -> None:
    if not REQUIREMENTS.is_file():
        raise FileNotFoundError(f"Missing {REQUIREMENTS}")

    print("Installing dependencies (first run may take several minutes)...")
    subprocess.run(
        [str(python_exe), "-m", "pip", "install", "--upgrade", "pip"],
        cwd=str(BASE_DIR),
        check=True,
    )
    subprocess.run(
        [str(python_exe), "-m", "pip", "install", "-r", str(REQUIREMENTS)],
        cwd=str(BASE_DIR),
        check=True,
    )


def _missing_core_modules() -> list[str]:
    missing: list[str] = []
    for name in ("uvicorn", "fastapi", "PIL", "cv2", "numpy", "rembg"):
        try:
            __import__(name)
        except ModuleNotFoundError:
            missing.append(name)
    return missing


def _strip_setup_flag() -> None:
    sys.argv = [a for a in sys.argv if a != "--setup"]


def ensure_venv_python() -> None:
    """Use project venv when present; optionally create/install on --setup."""
    if os.environ.get("FBR_SKIP_VENV_BOOTSTRAP") == "1":
        return

    setup_mode = "--setup" in sys.argv

    active_venv: Path | None = None
    for candidate in _venv_candidates():
        if not candidate.is_file():
            continue
        if _venv_is_broken(candidate):
            venv_root = candidate.parent.parent
            print(f"[FBR] Removing broken virtualenv (base Python missing): {venv_root}")
            shutil.rmtree(venv_root, ignore_errors=True)
            continue
        active_venv = candidate
        if not _same_python(Path(sys.executable), candidate):
            _relaunch_with(candidate)
        break

    if setup_mode:
        _strip_setup_flag()
        target = active_venv or _create_venv()
        _pip_install(target)
        print("\nSetup complete. Start the server with:\n  python main.py\n")
        sys.exit(0)

    if active_venv is not None:
        return

    missing = _missing_core_modules()
    if missing:
        print("\n[FBR AI Backend] Missing Python packages:", ", ".join(missing))
        print("\nQuick fix (recommended):")
        print("  cd backend")
        if _IS_WINDOWS:
            print("  python main.py --setup")
            print("\nOr use the project venv directly:")
            print("  .\\.venv311\\Scripts\\python.exe main.py")
        else:
            print("  python3 main.py --setup")
            print("\nOr:")
            print("  python3 -m venv .venv311 && .venv311/bin/pip install -r requirements.txt")
        print("\nManual install into current Python:")
        print(f"  python -m pip install -r \"{REQUIREMENTS}\"")
        print("\nNote: AI features need Python 3.10 or 3.11 (not 3.12+).")
        sys.exit(1)
