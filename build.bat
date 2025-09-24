@echo off
echo ProBillDesk Electron Build Helper
echo ================================
echo.

if "%1"=="" (
    echo Usage: build.bat [frontend-only^|fullstack^|both]
    echo.
    echo Build Types:
    echo   frontend-only  - Build only the frontend Electron app
    echo   fullstack      - Build the full-stack Electron app with backend
    echo   both           - Build both versions
    echo.
    echo Examples:
    echo   build.bat frontend-only
    echo   build.bat fullstack
    echo   build.bat both
    pause
    exit /b 1
)

echo Starting %1 build process...
echo.

node build-helper.js %1

echo.
echo Build process completed!
pause
