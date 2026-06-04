#!/bin/bash

# ============================================================================
# Docker Helper Script para API Muestras Médicas
# Uso: ./docker-dev.sh [comando]
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="api-muestras"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

show_help() {
    cat <<EOF
${BLUE}Docker Helper - API Muestras Médicas${NC}

Comandos disponibles:

  ${GREEN}up${NC}              Levantar servicios (PostgreSQL + NestJS)
  ${GREEN}down${NC}            Detener servicios
  ${GREEN}restart${NC}         Reiniciar servicios
  ${GREEN}logs${NC}            Ver logs en tiempo real
  ${GREEN}shell${NC}           Acceder a terminal del contenedor
  ${GREEN}db${NC}              Conectar a PostgreSQL
  ${GREEN}migrate${NC}         Ejecutar migraciones
  ${GREEN}prisma-gen${NC}      Generar cliente Prisma
  ${GREEN}build${NC}           Compilar aplicación
  ${GREEN}clean${NC}           Eliminar contenedores y volúmenes
  ${GREEN}ps${NC}              Ver estado de servicios
  ${GREEN}help${NC}            Mostrar esta ayuda

Ejemplos:
  ./docker-dev.sh up
  ./docker-dev.sh logs
  ./docker-dev.sh shell
EOF
}

cmd_up() {
    print_info "Levantando servicios..."
    
    if [ ! -f .env ]; then
        print_warning ".env no encontrado, creando desde .env.example"
        cp .env.example .env
    fi
    
    docker-compose up -d
    print_success "Servicios iniciados"
    
    print_info "Esperando a que PostgreSQL esté listo..."
    sleep 5
    
    print_info "Generando cliente Prisma..."
    docker-compose exec -T app pnpm run prisma:generate
    
    print_info "Aplicando migraciones..."
    docker-compose exec -T app pnpm run prisma:push || print_warning "Migraciones pueden fallar si ya existen"
    
    print_success "¡Listo! Swagger disponible en: http://localhost:3001/api/docs"
}

cmd_down() {
    print_info "Deteniendo servicios..."
    docker-compose down
    print_success "Servicios detenidos"
}

cmd_restart() {
    print_info "Reiniciando servicios..."
    docker-compose restart
    print_success "Servicios reiniciados"
}

cmd_logs() {
    print_info "Mostrando logs (Ctrl+C para salir)..."
    docker-compose logs -f app
}

cmd_shell() {
    print_info "Abriendo terminal del contenedor..."
    docker-compose exec app sh
}

cmd_db() {
    print_info "Conectando a PostgreSQL..."
    docker-compose exec db psql -U postgres -d muestras_medicas
}

cmd_migrate() {
    print_info "Ejecutando migraciones..."
    docker-compose exec -T app pnpm run prisma:push
    print_success "Migraciones completadas"
}

cmd_prisma_gen() {
    print_info "Generando cliente Prisma..."
    docker-compose exec -T app pnpm run prisma:generate
    print_success "Cliente Prisma generado"
}

cmd_build() {
    print_info "Compilando aplicación..."
    docker-compose exec -T app pnpm run build
    print_success "Compilación completada"
}

cmd_clean() {
    print_warning "Esto eliminará contenedores y volúmenes (datos de DB se perderán)"
    read -p "¿Continuar? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_info "Eliminando servicios y volúmenes..."
        docker-compose down -v
        print_success "Limpieza completada"
    else
        print_info "Cancelado"
    fi
}

cmd_ps() {
    print_info "Estado de servicios:"
    docker-compose ps
}

# Main
COMMAND=${1:-help}

case $COMMAND in
    up) cmd_up ;;
    down) cmd_down ;;
    restart) cmd_restart ;;
    logs) cmd_logs ;;
    shell) cmd_shell ;;
    db) cmd_db ;;
    migrate) cmd_migrate ;;
    prisma-gen) cmd_prisma_gen ;;
    build) cmd_build ;;
    clean) cmd_clean ;;
    ps) cmd_ps ;;
    help) show_help ;;
    *)
        print_error "Comando no reconocido: $COMMAND"
        echo
        show_help
        exit 1
        ;;
esac
