# ============================================================================
# STAGE 1: Builder - Compilación y construcción de la aplicación
# ============================================================================
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm@latest

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias con pnpm (incluye devDependencies para el build)
RUN pnpm install --frozen-lockfile

# Copiar el código fuente
COPY . .

# Generar cliente de Prisma
RUN pnpm run prisma:generate

# Construir la aplicación NestJS
RUN pnpm run build

# ============================================================================
# STAGE 2: Runtime - Imagen final optimizada para producción
# ============================================================================
FROM node:20-alpine

# Instalar pnpm en la imagen final
RUN npm install -g pnpm@latest

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar solo dependencias de producción
RUN pnpm install --frozen-lockfile --prod

# Copiar el cliente de Prisma generado
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma

# Copiar el código compilado desde el builder
COPY --from=builder /app/dist ./dist

# Copiar archivos de configuración de Prisma
COPY prisma ./prisma

# Exponer el puerto (por defecto 3001 según main.ts)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/docs', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]
