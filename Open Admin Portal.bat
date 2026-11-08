@echo off
title STITCHY - Admin Portal
cd /d "%~dp0"

:: Start the background server if not already running
start wscript.exe "%~dp0Launch_Website.vbs"

:: Open the browser directly to the secret admin URL
start "" "http://localhost:5000/admin"
exit
