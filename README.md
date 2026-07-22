# 🚛 EYON Cargo Internacional - Sistema de Gestión de Transportes, Flota & Finanzas

Sistema de gestión estratégica, control operativo y auditoría financiera para empresas de transporte de carga pesada y logística internacional.

---

## 📖 GUÍA DE DESARROLLO Y ESTRUCTURA DEL CÓDIGO (DOCUMENTACIÓN INTERNA)

Esta sección explica exactamente dónde está cada parte del código para que puedas **modificarlo o editarlo fácilmente en el futuro**:

### 📁 Estructura del Código Fuente (`/src`)

| Archivo / Carpeta | ¿Qué hace y para qué sirve? | ¿Cómo modificarlo en el futuro? |
| :--- | :--- | :--- |
| **`src/types/index.ts`** | Contiene todas las interfaces TypeScript (Clientes, Viajes, Vehículos, Cuentas, Deudas, Pagos, Socios). | **Añadir nuevos campos**: Si deseas agregar un campo como "Número de Licencia", entra aquí primero y agrégalo a la interfaz. |
| **`src/context/AppContext.tsx`** | Maneja el estado global de la aplicación, sincronización con Google Sheets, respaldos automáticos en `localStorage` y métodos de autenticación. | **Lógica de datos**: Si deseas cambiar cómo se calcula la caja disponible o agregar una función global, modifícala aquí. |
| **`src/utils/crypto.ts`** | Encriptación SHA-256 nativa de contraseñas mediante la API Web Crypto del navegador. | **Seguridad**: Puedes cambiar la sal de seguridad o el método de hash si necesitas mayores niveles de encriptación. |
| **`src/components/Common/ExpirationCountdownBar.tsx`** | Componente con **cronómetro en tiempo real** (días, horas, minutos) y barra visual de progreso para vencimientos de deudas y documentos (SOAT, CITV, SUTRAN, MTC). | **Ajuste de tiempos/colores**: Edita este archivo para modificar los umbrales de días críticos o la barra visual. |
| **`src/components/LoginScreen.tsx`** | Pantalla de Autenticación y **Registro Único Inicial**. Pide usuario y clave la primera vez y luego solo login. | **Formulario de Ingreso**: Modifica diseño o validaciones de acceso. |
| **`src/components/Finance/FinanceView.tsx`** | Módulo financiero dividido en 5 pestañas: Liquidez, Cuentas, Deudas con Cronómetro, Control de Pagos y Socios. | **Cálculos Financieros**: Cambia la fórmula de caja disponible o añade nuevos filtros de movimientos. |
| **`src/components/Vehicles/VehiclesView.tsx`** | Control de flota pesada, tráilers, odómetros, combustible y cronómetros de vencimientos de documentos oficiales. | **Documentos de Flota**: Edita o agrega nuevos tipos de permisos de transporte pesados. |
| **`src/components/Settings/SettingsView.tsx`** | Configuración, respaldos diarios en JSON, conexión a Google Sheets y modo de seguridad GitHub. | **Respaldos y Seguridad**: Modifica la frecuencia de copia o el cambio de contraseña encriptada. |
| **`src/components/Sidebar.tsx`** | Menú lateral navegable para PC y **Panel Deslizable Off-Canvas** para celular con fondo atenuado. | **Navegación**: Añade o cambia íconos y nombres de menú. |
| **`src/components/Header.tsx`** | Cabecera superior con selector de tema, botón de privacidad y botón de apertura en celular. | **Acciones de Cabecera**: Personaliza accesos directos o títulos superiores. |

---

## ⏱️ CRONÓMETRO Y BARRAS VISUALES DE VENCIMIENTO

El sistema incluye visualizadores activos de expiración:
- **Reloj en Tiempo Real**: Muestra el conteo regresivo exacto en **Días, Horas y Minutos** para pagar una cuota o renovar un SOAT / CITV.
- **Barra de Progreso Dinámica**: Muestra porcentualmente cuánto tiempo del ciclo queda disponible.
- **Alertas por Código de Color**:
  - 🟢 **Verde (Normal)**: Más de 15 días disponibles.
  - 🟡 **Amarillo (Próximo)**: Entre 8 y 15 días antes del vencimiento.
  - 🔴 **Rojo Titilante (Crítico/Vencido)**: Menos de 7 días o ya expirado.

---

## 🔒 SEGURIDAD Y CÓMO SUBIR ESTE PROYECTO A GITHUB

El código está **totalmente preparado para publicarse en repositorios públicos o privados de GitHub**:
- ❌ **Cero Claves Expuestas**: No existe ninguna API key ni contraseña escrita en el código fuente.
- 🔑 **Clave Encriptada SHA-256**: La contraseña se guarda con un hash irreversible en el navegador local.
- 🙈 **Modo Privacidad (Anonimizador)**: Con un solo clic oculta RUCs, montos de caja y nombres para capturas de pantalla o demostraciones en vivo.

### 🌐 SOLUCIÓN AL PANTALLAZO EN BLANCO EN GITHUB PAGES (`https://webze.github.io/eyon-cargo-internacional/`)

Si al publicar en GitHub Pages la página se ve **totalmente en blanco**, se debe a dos razones comunes:

1. **Ruta base de archivos (YA CORREGIDO):**
   - He actualizado `vite.config.ts` agregando `base: './'`. Esto permite que los archivos JS y CSS carguen desde cualquier subdominio o carpeta de GitHub Pages (ej. `/eyon-cargo-internacional/`).

2. **Compilación de React/TypeScript (IMPORTANTE):**
   - Los navegadores **no pueden leer archivos `.tsx` directamente**. Si subes el ZIP del código fuente a GitHub, GitHub Pages necesita compilarlo a HTML/JS estático.

#### 🛠️ CÓMO PUBLICAR CORRECTAMENTE EN GITHUB PAGES (2 Opciones):

##### **Opción A: Mediante GitHub Actions (RECOMENDADO Y AUTOMÁTICO)**
Ya he creado el archivo de automatización `.github/workflows/deploy.yml` en el proyecto.
1. Sube los archivos a tu repositorio en GitHub (`webze/eyon-cargo-internacional`).
2. Ve a tu repositorio en GitHub -> **Settings** -> **Pages**.
3. En **Source** (Fuente), selecciona **"GitHub Actions"** (en lugar de "Deploy from a branch").
4. ¡Listo! Cada vez que subas cambios, GitHub se encargará de compilar el proyecto y tu página cargará perfectamente.

##### **Opción B: Subir la carpeta compilada (`dist`) manualmente**
Si prefieres compilarlo en tu computadora antes de subirlo:
1. En tu terminal ejecuta: `npm run build`
2. Se generará una carpeta llamada `dist`.
3. Sube únicamente los archivos que están **DENTRO** de la carpeta `dist` a la rama de GitHub Pages.

---

### 🚀 PASOS PARA SUBIR TU PROYECTO A GITHUB

1. **Crea un nuevo repositorio en GitHub**:
   - Ingresa a [GitHub.com](https://github.com) -> haz clic en el botón **New Repository**.
   - Ponle de nombre `eyon-cargo-app`.
   - No marques la opción de inicializar con README (ya tenemos este completo).

2. **Abre tu terminal en la carpeta del proyecto y ejecuta**:

```bash
# 1. Inicializar git (si aún no está inicializado)
git init

# 2. Agregar todos los archivos
git add .

# 3. Guardar tu primer commit
git commit -m "feat: EYON Cargo v3.5 con autenticacion encriptada y cronometro de vencimientos"

# 4. Cambiar la rama principal a main
git branch -M main

# 5. Conectar tu repositorio local con tu repositorio de GitHub
# (Reemplaza TU_USUARIO por tu nombre de usuario en GitHub)
git remote add origin https://github.com/TU_USUARIO/eyon-cargo-app.git

# 6. Subir el proyecto a GitHub
git push -u origin main
```

---

## ⚡ COMANDOS DE DESARROLLO LOCAL

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Validar errores de código
npm run lint

# Compilar para producción
npm run build
```
