# 🐳 Docker Setup Guide - API Muestras Médicas

## Inicio rápido con Docker

### Requisitos previos
- Docker Desktop instalado ([Descargar](https://www.docker.com/products/docker-desktop))
- Docker Compose v2.x

### Opción 1: Desarrollo con Docker Compose (Recomendado)

```bash
# 1. Clonar y entrar al directorio
cd api-muetras

# 2. Crear archivo .env desde el ejemplo
cp .env.example .env

# 3. Levantar servicios (PostgreSQL + NestJS)
docker-compose up -d

# 4. Generar cliente Prisma en el contenedor
docker-compose exec app pnpm run prisma:generate

# 5. Aplicar migraciones
docker-compose exec app pnpm run prisma:push

# 6. Acceder a Swagger
# http://localhost:3001/api/docs
```

### Opción 2: Build de imagen para Producción

```bash
# 1. Construir imagen
docker build -t api-muestras:latest .

# 2. Ejecutar contenedor
docker run -d \
  --name api-muestras \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret-key" \
  api-muestras:latest

# 3. Verificar logs
docker logs -f api-muestras
```

## Comandos útiles

### Desarrollo con docker-compose

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Acceder a la terminal del contenedor
docker-compose exec app sh

# Ejecutar comandos pnpm
docker-compose exec app pnpm run build
docker-compose exec app pnpm run prisma:generate

# Detener servicios
docker-compose down

# Eliminar volúmenes (cuidado: elimina datos)
docker-compose down -v
```

### Verificación de salud

```bash
# Check del contenedor
docker-compose ps

# Conectar a PostgreSQL desde el host
psql -h localhost -U postgres -d muestras_medicas
```

## Estructura de servicios

```
docker-compose.yml
├── db (PostgreSQL 16)
│   ├── Puerto: 5432
│   ├── Usuario: postgres
│   └── Base de datos: muestras_medicas
│
└── app (NestJS)
    ├── Puerto: 3001
    ├── Swagger: /api/docs
    └── Healthcheck: Activo cada 30s
```

## Variables de entorno

Ver `.env.example` para todas las variables disponibles:

- `DATABASE_URL`: Conexión PostgreSQL
- `JWT_SECRET`: Clave de firma JWT
- `NODE_ENV`: development | production
- `PORT`: Puerto de la aplicación

## Troubleshooting

### Puerto 3001 ya está en uso
```bash
# Cambiar puerto en .env
PORT=3002

# O matar el proceso
lsof -ti:3001 | xargs kill -9
```

### PostgreSQL falla al iniciar
```bash
# Limpiar volúmenes y reiniciar
docker-compose down -v
docker-compose up -d
```

### No puede conectar a la base de datos
```bash
# Asegúrate de que .env tiene:
DATABASE_URL=postgresql://postgres:postgres@db:5432/muestras_medicas
#                                           ^^-- 'db' es el nombre del servicio en docker-compose
```

## Arquitectura del Dockerfile

- **Stage 1 (Builder)**: Compila la aplicación con todas las dependencias
- **Stage 2 (Runtime)**: Imagen optimizada solo con dependencias de producción
- **Tamaño final**: ~400MB (alpine base)
- **Healthcheck**: Verifica API cada 30 segundos
