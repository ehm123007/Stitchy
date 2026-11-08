@echo off
title STITCHY - Pure Export Apparel Website
cd /d "%~dp0"

echo ========================================================
echo        STITCHY Pure Export Clothing Website
echo ========================================================
echo.
echo Starting web server on http://localhost:5000 ...

:: Launch the silent launcher or node
start wscript.exe "%~dp0Launch_Website.vbs"

echo.
echo Website opened in your default browser!
echo.
timeout /t 3
exit
