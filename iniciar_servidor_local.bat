@echo off
title Servidor Local NRC Herramienta 2
echo ===================================================
echo   Iniciando Servidor Web Local NRC Herramienta 2
echo ===================================================
echo Abriendo navegador en http://localhost:8080 ...
start http://localhost:8080
python -m http.server 8080
pause
