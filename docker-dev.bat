@echo off
REM ============================================================================
REM Docker Helper Script para API Muestras Médicas (Windows)
REM Uso: docker-dev.bat [comando]
REM ============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "PROJECT_NAME=api-muestras"

REM Colores (aproximación usando doskey)
set "SUCCESS=[92m"
set "ERROR=[91m"
set "INFO=[94m"
set "WARNING=[93m"
set "RESET=[0m"

REM Mostrar ayuda si no hay argumento
if "%1"=="" (
    call :show_help
    exit /b 0
)

REM Ejecutar comando
call :%1
if errorlevel 1 (
    echo Error ejecutando comando: %1
    exit /b 1
)

exit /b 0

:show_help
cls
echo.
echo Docker Helper - API Muestras Medicas
echo.
echo Comandos disponibles:
echo.
echo   up              Levantar servicios (PostgreSQL + NestJS^)
echo   down            Detener servicios
echo   restart         Reiniciar servicios
echo   logs            Ver logs en tiempo real
echo   shell           Acceder a terminal del contenedor
echo   db              Conectar a PostgreSQL
echo   migrate         Ejecutar migraciones
echo   prisma-gen      Generar cliente Prisma
echo   build           Compilar aplicacion
echo   clean           Eliminar contenedores y volumenes
echo   ps              Ver estado de servicios
echo   help            Mostrar esta ayuda
echo.
echo Ejemplos:
echo   docker-dev.bat up
echo   docker-dev.bat logs
echo   docker-dev.bat shell
echo.
exit /b 0

:up
echo.
echo [94m* Levantando servicios...[0m
echo.

if not exist .env (
    echo [93m* .env no encontrado, creando desde .env.example[0m
    copy .env.example .env
)

docker-compose up -d
echo [92m* Servicios iniciados[0m
echo.

echo [94m* Esperando a que PostgreSQL este listo...[0m
timeout /t 5 /nobreak

echo [94m* Generando cliente Prisma...[0m
docker-compose exec -T app pnpm run prisma:generate

echo [94m* Aplicando migraciones...[0m
docker-compose exec -T app pnpm run prisma:push

echo.
echo [92m* !Listo! Swagger disponible en: http://localhost:3001/api/docs[0m
echo.
exit /b 0

:down
echo.
echo [94m* Deteniendo servicios...[0m
docker-compose down
echo [92m* Servicios detenidos[0m
echo.
exit /b 0

:restart
echo.
echo [94m* Reiniciando servicios...[0m
docker-compose restart
echo [92m* Servicios reiniciados[0m
echo.
exit /b 0

:logs
echo.
echo [94m* Mostrando logs (Ctrl+C para salir)...[0m
docker-compose logs -f app
exit /b 0

:shell
echo.
echo [94m* Abriendo terminal del contenedor...[0m
docker-compose exec app sh
exit /b 0

:db
echo.
echo [94m* Conectando a PostgreSQL...[0m
docker-compose exec db psql -U postgres -d muestras_medicas
exit /b 0

:migrate
echo.
echo [94m* Ejecutando migraciones...[0m
docker-compose exec -T app pnpm run prisma:push
echo [92m* Migraciones completadas[0m
echo.
exit /b 0

:prisma-gen
echo.
echo [94m* Generando cliente Prisma...[0m
docker-compose exec -T app pnpm run prisma:generate
echo [92m* Cliente Prisma generado[0m
echo.
exit /b 0

:build
echo.
echo [94m* Compilando aplicacion...[0m
docker-compose exec -T app pnpm run build
echo [92m* Compilacion completada[0m
echo.
exit /b 0

:clean
echo.
echo [93m* ADVERTENCIA: Esto eliminara contenedores y volumenes (datos de DB se perderan^)[0m
set /p "confirm=Continuar? (s/n): "
if /i "!confirm!"=="s" (
    echo.
    echo [94m* Eliminando servicios y volumenes...[0m
    docker-compose down -v
    echo [92m* Limpieza completada[0m
) else (
    echo [94m* Cancelado[0m
)
echo.
exit /b 0

:ps
echo.
echo [94m* Estado de servicios:[0m
docker-compose ps
echo.
exit /b 0
