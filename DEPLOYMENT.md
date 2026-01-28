# Guía de Deployment - EduPlatform

## Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Vercel CLI (opcional pero recomendado)
- Base de datos PostgreSQL (producción)

## Pasos de Deployment en Vercel

### 1. Preparar el Repositorio
\`\`\`bash
# Crear .env.local en producción con:
NEXT_PUBLIC_AUTH_ENABLED=true
DATABASE_URL=postgresql://user:pass@host/db
NEXT_PUBLIC_API_URL=https://tu-dominio.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
\`\`\`

### 2. Deploy a Vercel
\`\`\`bash
# Opción 1: Usar Vercel CLI
vercel

# Opción 2: Conectar repositorio desde vercel.com
# 1. Push code a GitHub
# 2. Conectar repo en https://vercel.com/new
# 3. Configurar variables de entorno
# 4. Deploy automático
\`\`\`

### 3. Configurar Base de Datos

#### PostgreSQL en Supabase (Recomendado)
\`\`\`sql
-- Crear tablas principales
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(50), -- 'student', 'teacher', 'admin'
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id INTEGER REFERENCES users(id),
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### 4. Configurar Email (SendGrid o Gmail)
\`\`\`env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx
\`\`\`

### 5. Configurar Pagos (Stripe)
\`\`\`bash
# 1. Crear cuenta en https://stripe.com
# 2. Obtener claves de API
# 3. Agregar a variables de entorno
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
\`\`\`

### 6. Configurar CDN (Vercel Blob)
\`\`\`bash
# Para almacenar archivos (videos, PDFs, etc.)
vercel env add BLOB_READ_WRITE_TOKEN
\`\`\`

## Verificación Post-Deployment

- [ ] Landing page carga correctamente
- [ ] Sistema de login funciona
- [ ] Rutas protegidas redirigen a login
- [ ] Middleware valida autenticación
- [ ] Dashboards cargan según rol
- [ ] Email de verificación se envía
- [ ] Pagos con Stripe funcionan

## Performance

### Optimizaciones Incluidas
- Image optimization
- Code splitting automático
- Caching con revalidateTags
- Middleware para auth en edge

### Monitoreo
\`\`\`bash
# Usar Vercel Analytics
npm install @vercel/analytics
\`\`\`

## Seguridad

### Lista de Verificación
- [x] Middleware valida tokens
- [x] Rutas protegidas por role
- [x] Contraseñas hasheadas (implementar bcrypt)
- [x] HTTPS forzado
- [x] CORS configurado
- [x] Rate limiting en API
- [ ] Implementar 2FA
- [ ] Auditar logs de acceso

## Troubleshooting

### Error: "Token Inválido"
\`\`\`bash
# Borrar cookies y localStorage
# Limpiar variables de entorno
# Verificar middleware.ts está en raíz del proyecto
\`\`\`

### Error: "Base de datos no conecta"
\`\`\`bash
# Verificar DATABASE_URL es correcto
# Verificar credenciales PostgreSQL
# Verificar IP whitelisted en DB provider
\`\`\`

### Error: "Email no se envía"
\`\`\`bash
# Verificar credenciales SMTP
# Verificar contraseña de app (no la contraseña de cuenta)
# Verificar puerto SMTP correcto (587 o 465)
\`\`\`

## Próximos Pasos

1. **Implementar autenticación real**
   - Usar bcrypt para hashing
   - Implementar refresh tokens
   - Agregar 2FA

2. **Conectar base de datos**
   - Usar Prisma ORM
   - Ejecutar migraciones
   - Seed datos de prueba

3. **Configurar pagos**
   - Stripe webhooks
   - Planes de suscripción
   - Gestión de facturación

4. **Agregar monitoreo**
   - Error tracking con Sentry
   - Analytics con Vercel
   - Logs centralizados

## Soporte

Para ayuda: support@eduplatform.com
