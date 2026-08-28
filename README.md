# 🌐 Proyecto 2: Plataforma Web de Flexibilización y Adaptación Curricular (NRC / MEN)

Plataforma Web interactiva, modular y *Offline-First* (PWA) diseñada para directivos, docentes y equipos territoriales del **Norwegian Refugee Council (NRC)** y del **Ministerio de Educación Nacional (MEN)** para la planificación, diagnóstico paramétrico y monitoreo escolar en situaciones de emergencia.

---

## 🎯 Archivos y Herramientas Maestras del Proyecto

1. **[MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.md](MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.md)**  
   *Guía del Hub Maestro de Sincronización*. Documenta cómo ingresar ajustes pedagógicos y técnicos que se reflejan simultáneamente en los Excel (Ciclos I al V) y en la aplicación web.

2. **[MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.json](MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.json)**  
   *Dataset Maestro Unificado (Single Source of Truth)*. Contiene el catálogo completo de los 5 Ciclos, 40 amenazas PGIRE, taxonomía Bloom, estrategias NNA y configuraciones.

3. **[sincronizar_ajustes.bat](sincronizar_ajustes.bat)** / **[orquestador_maestro_sincronizacion.py](orquestador_maestro_sincronizacion.py)**  
   *Motor de Sincronización Automática (1-Click)*. Actualiza las bases JS, compila la app web y sincroniza los libros de cálculo de Proyecto 1 con validación de 0 errores.

4. **[DOCUMENTO_MAESTRO_INTEGRACION_PROYECTO_1_Y_2.md](DOCUMENTO_MAESTRO_INTEGRACION_PROYECTO_1_Y_2.md)**  
   *Especificación Técnica y Arquitectura de Integración*. Marco normativo, gobernanza GIRE, directrices de despliegue en Linux (Nginx) y requisitos offline.

---

## 🚀 Opciones de Ejecución de la Plataforma Web

### Opción 1: Ejecución Autónoma Inmediata (Zero Servidor)
Hacer doble clic en **[app_standalone.html](app_standalone.html)** en cualquier navegador web moderno (Chrome, Edge, Firefox). Funciona 100% sin conexión a internet y sin necesidad de instalar programas adicionales.

### Opción 2: Ejecución Local con Servidor Ligero
Hacer doble clic en **[iniciar_servidor_local.bat](iniciar_servidor_local.bat)** o ejecutar en terminal:
`ash
python -m http.server 8080
`
Y abrir en el navegador http://localhost:8080 para disfrutar de la experiencia completa PWA con Service Worker.

### Opción 3: Despliegue en Servidor Linux (Producción / Open Source)
Copia la carpeta en el directorio web (/var/www/nrc-herramienta-web) y configura el servidor Nginx siguiendo las directrices de [DOCUMENTO_MAESTRO_INTEGRACION_PROYECTO_1_Y_2.md](DOCUMENTO_MAESTRO_INTEGRACION_PROYECTO_1_Y_2.md).

---

## 📦 Estructura del Directorio Web

`	ext
├── MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.md     <- GUÍA DEL HUB MAESTRO DE AJUSTES
├── MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.json   <- DATASET MAESTRO (SSOT)
├── orquestador_maestro_sincronizacion.py          <- SCRIPT DE SINCRONIZACIÓN MAESTRA
├── sincronizar_ajustes.bat                        <- LANZADOR 1-CLICK DE SINCRONIZACIÓN
├── DOCUMENTO_MAESTRO_INTEGRACION_PROYECTO_1_Y_2.md<- DOCUMENTO MAESTRO DE ARQUITECTURA
├── index.html                                     <- APLICACIÓN WEB MODULAR PWA
├── app_standalone.html                            <- APLICACIÓN WEB AUTÓNOMA 100% OFFLINE
├── iniciar_servidor_local.bat                     <- SERVIDOR LOCAL LIGERO
├── README.md                                      <- ESTE ARCHIVO
│
├── css/                                           <- Estilos visuales desacoplados
│   ├── variables.css                              <- Paleta de colores, tipografía e identidad visual
│   ├── components.css                             <- Botones, modales, tarjetas, semáforos y formularios
│   └── print.css                                  <- Reglas CSS para impresión en tamaño Carta (Letter)
│
├── js/                                            <- Lógica de aplicación e interactividad
│   ├── app.js                                     <- Inicializador general y enrutamiento modular
│   ├── data/                                      <- Datasets compilados en JS
│   │   ├── curriculum_db.js                       <- Malla curricular multiciclo (Ciclos I al V)
│   │   ├── pgire_db.js                            <- Catálogo de 40 amenazas y rutas GIRE
│   │   └── habs_sups_db.js                        <- Habilidades socioemocionales y supervivencia
│   └── modules/                                   <- Módulos funcionales desacoplados
│       ├── auth.js                                <- Módulo D: Autenticación local multi-docente
│       ├── modulo_a.js                            <- Módulo A: Diagnóstico paramétrico PGIRE
│       ├── modulo_b.js                            <- Módulo B: Rayuela curricular (Explorador)
│       └── modulo_c.js                            <- Módulo C: Monitoreo semanal por etapas
`
