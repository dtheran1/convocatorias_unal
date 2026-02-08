@echo off
REM Script de despliegue para Banco de Perfiles Externos (Windows)
REM Uso: deploy.bat [version]

setlocal enabledelayedexpansion

echo ========================================
echo   Banco de Perfiles Externos - Deploy
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "banco-perfiles-externos.html" (
    echo [ERROR] No se encuentra banco-perfiles-externos.html
    echo Asegurate de ejecutar este script desde el directorio banco-perfiles-externos/
    exit /b 1
)

REM Verificar que clasp está instalado
where clasp >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] clasp no esta instalado
    echo Instala clasp con: npm install -g @google/clasp
    exit /b 1
)

REM Verificar que .clasp.json tiene scriptId
findstr /C:"\"scriptId\": \"\"" .clasp.json >nul
if %ERRORLEVEL% equ 0 (
    echo [ADVERTENCIA] .clasp.json no tiene scriptId configurado
    echo.
    echo Opciones:
    echo 1. Crear nuevo proyecto: clasp create --type webapp --title "Banco Perfiles Externos"
    echo 2. Agregar scriptId manualmente a .clasp.json
    exit /b 1
)

REM Mostrar información del proyecto
echo [INFO] Proyecto configurado
for /f "tokens=2 delims=:," %%a in ('findstr "scriptId" .clasp.json') do (
    set SCRIPT_ID=%%a
    set SCRIPT_ID=!SCRIPT_ID:"=!
    set SCRIPT_ID=!SCRIPT_ID: =!
    echo    Script ID: !SCRIPT_ID!
)
echo.

REM Confirmar antes de continuar
set /p CONFIRM="Continuar con el despliegue? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo Despliegue cancelado.
    exit /b 0
)

REM Paso 1: Push del código
echo.
echo [1/3] Subiendo codigo a Apps Script...
call clasp push

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Error al subir codigo
    exit /b 1
)
echo [OK] Codigo subido exitosamente

REM Paso 2: Crear versión
if "%1"=="" (
    set VERSION=v1.0
) else (
    set VERSION=%1
)
echo.
echo [2/3] Creando version: %VERSION%
call clasp version "%VERSION%"

REM Paso 3: Deploy
echo.
echo [3/3] Creando implementacion...
call clasp deploy --description "%VERSION%" --deploymentId @latest

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Error al crear implementacion
    exit /b 1
)
echo [OK] Implementacion creada exitosamente

REM Mostrar deployments
echo.
echo [INFO] Implementaciones actuales:
call clasp deployments

REM Abrir en navegador (opcional)
echo.
set /p OPEN="Abrir proyecto en el navegador? (y/N): "
if /i "%OPEN%"=="y" (
    call clasp open
)

echo.
echo ========================================
echo   DESPLIEGUE COMPLETADO EXITOSAMENTE
echo ========================================
echo.
echo Proximos pasos:
echo 1. Verifica que la pestana 'Perfiles Externos' existe en el Sheet
echo 2. Ejecuta setupBancoPerfilesExternos() en Apps Script (si no lo hiciste antes)
echo 3. Prueba el formulario desde la URL /exec
echo 4. Embebe la URL en Google Sites
echo.

endlocal
