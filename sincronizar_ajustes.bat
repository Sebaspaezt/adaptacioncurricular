@echo off
chcp 65001 > nul
echo =======================================================================
echo   SINCRONIZANDO AJUSTES MAESTROS: PROYECTO 1 (EXCEL) Y PROYECTO 2 (WEB)
echo =======================================================================
python orquestador_maestro_sincronizacion.py
pause
