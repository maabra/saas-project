@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if not errorlevel 1 (
  start "" http://localhost:8000
  py -m http.server 8000 --bind 127.0.0.1
  goto :end
)

where python >nul 2>nul
if not errorlevel 1 (
  start "" http://localhost:8000
  python -m http.server 8000 --bind 127.0.0.1
  goto :end
)

echo Python was not found.
echo Install Python from https://www.python.org/downloads/ and select "Add Python to PATH",
echo or open index.html directly in your browser.
pause

:end
endlocal
