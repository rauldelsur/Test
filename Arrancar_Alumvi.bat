@echo off
title Servidor Alumvi
color 0A

echo =======================================================
echo          INICIANDO EL SERVIDOR DE ALUMVI
echo =======================================================
echo.
echo Por favor, NO CIERRES esta ventana.
echo Si la cierras, los ordenadores perderan la conexion.
echo.
echo Para apagar el servidor de forma segura, pulsa Ctrl + C
echo.
echo =======================================================
echo Arrancando la aplicacion...
echo.

call npm run dev

echo.
echo El servidor se ha detenido.
pause
