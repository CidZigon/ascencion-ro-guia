@echo off
setlocal
title AscencionRO - servidor local
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-local.ps1"
if errorlevel 1 (
  echo.
  echo No se pudo iniciar AscencionRO. Revisa el mensaje anterior.
  pause
)
endlocal
