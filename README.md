# Ultimo Bastión Maullín — Réplica Moderna en React & WebP

Réplica completa y modernizada del portal de noticias, cultura y territorio **[Último Bastión Maullín](https://maullinultimobastion.cl/)**, reconstruida desde cero utilizando **React 19**, **Vite**, **Tailwind CSS v4** y **React Router**.

---

## 🚀 Características Principales

1. **701 Noticias Completas Importadas**:
   - Se extrajo el 100% del archivo histórico del sitio WordPress oficial con títulos, fechas, autores, categorías, extractos y contenidos completos formateados.
   - Búsqueda instantánea en cliente y paginación rápida sobre las 701 publicaciones.

2. **Imágenes 100% Optimizadas en WebP (Mínimo Peso)**:
   - Todas las imágenes de noticias, logotipos, banners publicitarios, mapas temáticos y fotografías institucionales fueron procesadas y convertidas al formato moderno **`.webp`**.
   - Reducción de peso de hasta un **93.7%** por imagen (desde archivos originales de varios megabytes a ~20-70 KB cada uno), garantizando una velocidad de carga ultrarrápida sin pérdida de nitidez.
   - Cobertura del 100% con imagen local de respaldo garantizada para cada noticia.

3. **Estructura y Páginas Replicadas al 100%**:
   - **Inicio (`/`)**: Portada con titular principal destacado, grilla secundaria 2x2, marquesina animada de último minuto, widget de clima en vivo para Maullín, contador dinámico de lectores en línea, secciones temáticas (Cultura, Proyectos, Fomento, Deporte, Educación, Salud), banners publicitarios y archivo audiovisual.
   - **Noticia Individual (`/noticia/:slug`)**: Lectura completa, tipografía editorial optimizada, selector de tamaño de fuente (A-, A, A+), tiempo estimado de lectura, botones para compartir (WhatsApp, Facebook, Twitter, enlace), noticias relacionadas y navegación previa/siguiente.
   - **Historia (`/historia`)**: Línea de tiempo interactiva desde 1567 hasta el siglo XXI, reseña del "Último Bastión Continental", y registro histórico interactivo de alcaldes de Maullín con buscador y ordenamiento.
   - **Mapas (`/mapas`)**: Atlas cartográfico interactivo con los 15 capítulos temáticos de la cuenca del Río Maullín (origen, humedales, dinámicas mareales, impacto del terremoto de 1960 y cartografía colonial) con visor ampliado y mapa satelital interactivo.
   - **Emprendimientos (`/emprendimientos`)**: Directorio clasificado de comercio local (gastronomía como Derniere Restobar, cabañas, transporte fluvial/terrestre, turismo rural) y formulario de inscripción directa vía WhatsApp.
   - **Quiénes Somos (`/quienes-somos`)**: Trayectoria comunitaria desde sus orígenes en Facebook en 2008, declaración de principios periodísticos, misión y visión territorial.
   - **Contacto (`/contacto`)**: Formulario interactivo con validación instantánea, coordenadas territoriales en Calle Almeyda 151, Maullín, y enlace directo a WhatsApp.
   - **Archivo y Buscador (`/noticias`, `/buscar`)**: Motor de búsqueda en tiempo real con filtros por categoría y paginación fluida.

---

## 🛠️ Tecnologías Utilizadas

- **React 19**: Librería principal de interfaz de usuario.
- **Vite 8**: Servidor de desarrollo ultrarrápido y empaquetador de producción.
- **Tailwind CSS v4**: Sistema de diseño moderno y utilidades responsivas.
- **React Router 7**: Enrutamiento declarativo para URLs canónicas y alias de WordPress.
- **Lucide Icons**: Iconografía SVG moderna y minimalista.
- **Pillow (Python PIL)**: Motor de procesamiento y compresión de imágenes WebP.

---

## 📦 Instrucciones de Ejecución

### 1. Iniciar servidor de desarrollo
```bash
npm run dev
```
El portal estará disponible en: `http://localhost:3000/`

### 2. Compilar para producción
```bash
npm run build
```
Genera los archivos estáticos optimizados en la carpeta `dist/`.

### 3. Previsualizar la versión de producción
```bash
npm run preview
```
Servidor de previsualización en: `http://localhost:4173/`

---

## 📁 Estructura del Proyecto

```
BATION/
├── public/
│   ├── images/
│   │   ├── site/         # Logo oficial, banners publicitarios y fotos institucionales (.webp)
│   │   ├── maps/         # Los 15 mapas temáticos de la cuenca del Maullín (.webp)
│   │   └── posts/        # 701 imágenes de noticias optimizadas en WebP
├── src/
│   ├── components/       # Header, Footer, NewsCard, WeatherWidget, BreakingTicker, SocialIcons
│   ├── pages/            # HomePage, PostDetailPage, CategoryPage, HistoriaPage, MapasPage, etc.
│   ├── data/             # posts_index.json (506KB), posts.json (completo), categories.json, pages.json
│   ├── utils/            # postsService.js (consultas, filtrado, búsqueda, formateo de fechas)
│   ├── App.jsx           # Enrutamiento de la aplicación
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales y Tailwind CSS
├── scripts/              # Scripts de extracción de datos y optimización WebP
└── vite.config.js        # Configuración de compilación Vite y Tailwind
```
