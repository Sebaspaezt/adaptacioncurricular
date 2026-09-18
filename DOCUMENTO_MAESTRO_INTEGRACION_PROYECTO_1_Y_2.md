# 📘 DOCUMENTO MAESTRO DE INTEGRACIÓN: PROYECTO 1 & PROYECTO 2 (WEB)
**Iniciativa de Flexibilización y Adaptación Curricular en Situaciones de Emergencia (NRC / MEN)**  
**Destinatario Institucional:** Secretaría de Educación Departamental / Gobernación de Norte de Santander

---

## 📌 1. Resumen Ejecutivo y Alcance
Este documento constituye la **fuente única de verdad (Single Source of Truth)** para la articulación entre el **Proyecto 1** (modelación curricular en hojas de cálculo, soporte normativo PGIRE/GIRE, matrices DBA y productos metodológicos) y el **Proyecto 2** (plataforma web interactiva *Open Source*, diseñada para despliegue en la infraestructura institucional de la **Gobernación de Norte de Santander** bajo subdominio oficial asignado por la Oficina TIC y ejecución local autónoma para sedes educativas en zonas de baja o nula conectividad).

---

## 🏛️ 2. Marco Normativo y Pedagógico Integrado

| Eje Normativo / Técnico | Instrumento Legal | Aplicación en la Herramienta |
| :--- | :--- | :--- |
| **Gestión Integral del Riesgo Escolar (GIRE)** | *Resolución MEN 6519 de 2025* | Gobernanza escolar, articulación con Comités Institucionales CIGIRE y Mesas Territoriales MTGIRE. |
| **Directrices de Emergencia Educativa** | *Circular MEN 19 de 2022* | Protocolos de atención inmediata y adaptación del calendario escolar. |
| **Gestión del Riesgo de Desastres** | *Ley 1523 de 2012* | Clasificación macro de amenazas (Natural, Socionatural, Antrópica, Conflicto Armado). |
| **Estándares Humanitarios Internacionales** | *Normas Mínimas INEE (MSEE)* | Protección infantil, espacios amigables, bienestar psicosocial y núcleos de aprendizaje esencial. |
| **Validez y Acreditación Académica** | *Decreto 1075 de 2015 / SIEE* | Garantía de que los aprendizajes flexibilizados mantienen trazabilidad y validez en el sistema evaluativo. |

---

## 🧠 3. Arquitectura del Modelo de Datos (5 Ciclos y 40 Amenazas PGIRE)

### 3.1. Estructura de los 5 Ciclos Formativos Estandarizados
1. **Ciclo I (Grados 1°, 2° y 3° - Básica Primaria Inicial):** Alfabetización inicial, conteo contextualizado, nociones espaciales, autocuidado y 81 DBA oficiales MEN.
2. **Ciclo II (Grados 4° y 5° - Básica Primaria Superior):** Comprensión textual, operaciones aplicadas, ciencias del entorno, convivencia y 55 DBA oficiales MEN.
3. **Ciclo III (Grados 6° y 7° - Básica Secundaria Inicial):** Transición a básica secundaria, análisis crítico, resolución de problemas, pensamiento científico y 57 DBA oficiales MEN.
4. **Ciclo IV (Grados 8° y 9° - Básica Secundaria Superior):** Argumentación, pensamiento abstracto, ciudadanía activa, saneamiento ambiental WASH y 57 DBA oficiales MEN.
5. **Ciclo V (Grados 10° y 11° - Educación Media):** Educación media, formulación de proyectos comunitarios, mitigación del riesgo, preparación SIEE/Saber 11 y 47 DBA oficiales MEN.

### 3.2. Taxonomía de Bloom y Relación de Compensación Humanitaria
$$\text{Mayor Gravedad de la Crisis (Etapa 1 / Afectación Alta)} \Longrightarrow \text{Menor Complejidad Cognitiva Inicial (Bloom 1-2: Recordar / Comprender)}$$
* **Etapa 1 (Respuesta Inmediata - Semanas 1 a 4):** Complejidad Baja / Esencial (*Bloom 1-2: Recordar / Comprender*). Enfoque en contención emocional, alfabetización mínima y supervivencia.
* **Etapa 2 (Recuperación Temprana - Semanas 6 a 25):** Complejidad Media / Intermedia (*Bloom 3-4: Aplicar / Analizar*). Enfoque en proyectos integrados y reconstrucción de rutinas.
* **Etapa 3 (Retorno / Educación Formal - Más de 25 semanas):** Complejidad Alta / Profundización (*Bloom 5-6: Evaluar / Crear*). Enfoque en avance curricular pleno y acreditación formal.

---

## 💻 4. Especificación Funcional de la Plataforma Web (Proyecto 2)

```mermaid
flowchart TD
    A["👤 0. Autenticación Local & Perfil Multi-Docente"] --> B["🎛️ Módulo A: Diagnóstico Paramétrico PGIRE"]
    B --> C["📚 Módulo B: Rayuela Curricular (Biblioteca de Planificación)"]
    B --> D["📋 Módulo C: Monitoreo Semanal por Etapas"]
    D --> E["🖨️ Vista e Impresión Tamaño Carta (Letter)"]
    D --> F["💾 Guardado, Reanudación y Exportación JSON/Excel"]
```

### 4.1. Módulo A: Diagnóstico Paramétrico y Control (Soporte Multirriesgo e Inducción Pedagógica)
* **Inducción Pedagógica Previa (5 Guías Normativas Oficiales):**
  * 4 preguntas generadoras de apropiación en terreno.
  * **Guía 1.1:** Etapas de Respuesta a la Emergencia.
  * **Guía 1.2:** Escala Unificada de Afectación Educativa y Taxonomía de Bloom (Pág. 7).
  * **Guía 1.3:** Categorías de Riesgo Prevalente PGIRE (*Ley 1523 de 2012 / Res. MEN 6519 de 2025*).
  * **Guía 1.4:** Enfoque de Habilidades para la Vida y Desarrollo Socioemocional (*Ley 2383/2024, Ley 2491/2025, MEN 2026, UNICEF 2025*).
  * **Guía 1.5:** Capa de Protección y Aprendizajes de Supervivencia WASH/ERM (*Normas Mínimas INEE / Política Pública GIRE*).
* **Formulario Paramétrico Multirriesgo:**
  1. `Selección de Ciclo` (Ciclos I al V).
  2. `1. Etapa de Respuesta a la Emergencia` $\rightarrow$ Auto-calcula `2. Nivel de Complejidad Cognitiva Bloom`.
  3. `3. Tipo / Categoría Macro de Amenaza PGIRE` $\rightarrow$ Selección manual múltiple sin opción "Todas" (*Natural*, *Socionatural*, *Antrópica*, *Conflicto Armado y Protección*).
  4. `4. Amenaza(s) Específica(s) Diagnosticada(s)` $\rightarrow$ Filtro dinámico y selección múltiple de amenazas concurrentes (40 amenazas PGIRE).
  5. Despliegue consolidado multilínea automático de:
     * `5. Ejemplo(s) en Institución Educativa`
     * `6. Riesgos Asociados en la Institución Educativa`
     * `7. Instancia(s) GIRE Responsable(s) y Ruta(s)` (*Ruta de Protección Humanitaria*, *Mesa Territorial MTGIRE* o *Comité CIGIRE*).
  6. Entradas del docente:
     * `8. Grado Escolar en Aula`
     * `9. Matrícula de NNA en Aula` $\rightarrow$ Determina estrategia: *Tutoría 1:1 (<15)*, *Cooperativo (15-35)* o *Micro-estaciones (>35)*.
     * `10. Fecha de Inicio de la Emergencia` $\rightarrow$ Genera el calendario semanal proyectado.
* **Resumen de Diagnóstico:** Botón "Guardar y Aplicar Diagnóstico de Aula" y tarjeta de confirmación de parámetros con badges por cada amenaza diagnosticada.

### 4.2. Módulo B: Rayuela Curricular (Biblioteca de Planificación)
* Espacio de exploración profunda de la malla curricular priorizada con **encabezados contextualizados por tipología**:
  * **Áreas Académicas (Lenguaje, Matemáticas, Sociales, Naturales):**
    * Encabezados: `Factor / Eje` | `DBA / Aprendizaje Esencial` | `Complejidad & Bloom` | `Didáctica Situada / Mini-Proyecto`.
  * **Socioemocional & Vida:**
    * Encabezados: `Dimensión & Etapa de Respuesta` | `Habilidad & Objetivo de Aprendizaje (Bloom)` | `Proceso Cognitivo (Bloom)` | `Contenido de Aprendizaje & Evidencias Clave`.
  * **Supervivencia & ERM:**
    * Encabezados: `Tipología de Riesgo & Afectación` | `Aprendizaje Clave & Objetivo de Protección` | `Proceso Cognitivo (Bloom)` | `Mini-Proyecto Situado & Fases de Acción`.
    * **Priorización Contextual:** Resalta automáticamente con badge los mini-proyectos de protección que responden al diagnóstico de amenazas activas en el Módulo A.

### 4.3. Módulo C: Monitoreo Semanal por Etapas (Integración Completa por Semanas)
* Tablero dinámico de seguimiento semana a semana (Semanas 1 a 16 / 32 / 64):
  * **Tarjeta Pedagógica Semanal Integrada:** Agrupa en cada semana: *Grado + Estrategia NNA + Amenazas PGIRE + DBA Nuclear + Didáctica Situada + Desafío Bloom + Habilidad Socioemocional + Mini-Proyecto de Protección WASH/ERM*.
  * **Registro y Trazabilidad Temporal:** Guarda automáticamente la marca de tiempo exacta (`fechaRegistro`) en que el docente guardó cada avance.
  * **Exportación a Excel Directa:** Descarga de hoja de cálculo estructurada (`.csv` con UTF-8 BOM y delimitador `;`) que abre directamente en Microsoft Excel, Google Sheets o Calc con todas las columnas organizadas.
  * **Impresión Oficial en Tamaño Carta (Letter):** Maquetación CSS estricta (`print.css`), sin páginas en blanco iniciales, con encabezado oficial MEN / NRC y bloque institucional de firmas para acreditación en el SIEE.

### 4.4. Capa Transversal y Experiencia de Usuario Multi-Dispositivo
* **Navegación Sticky:** La barra superior y los botones de los 3 módulos permanecen siempre fijos y visibles al hacer scroll hacia abajo.
* **Diseño Responsivo Total:** Adaptado y optimizado para teléfonos celulares (<680px), tablets (680px-992px), laptops y computadores de escritorio.
* **100% Offline-First / PWA:** Ejecución local autónoma sin conexión vía `index.html` o `app_standalone.html`.
* **Multi-Perfil Local:** Varios docentes pueden usar la misma máquina con contraseñas locales sin cruzar sus datos.
* **Exportación / Respaldo:** Capacidad de descargar e importar bitácoras en formato JSON/Excel.

---

## 🌐 5. Directrices de Despliegue en Infraestructura Institucional (Gobernación de Norte de Santander)

### 5.1. Especificación Técnica de la Máquina Virtual (Oficina TIC - Gobernación)
Conforme a la notificación oficial de la Oficina de Tecnologías de la Información y las Comunicaciones (TIC) de la **Gobernación de Norte de Santander**, se ha dispuesto la Máquina Virtual (MV) dedicada para el entorno de desarrollo, conexión y puesta en producción del sistema:

* **Sistema Operativo:** Ubuntu Server 24.04 LTS (versión de soporte extendido, recomendada para entornos productivos).
* **Memoria RAM:** 16 GB RAM.
* **Procesamiento (CPU):** 4 núcleos virtuales (vCPU).
* **Almacenamiento (Disco 1):** 500 GB (destinado para actualizaciones, archivos de log, servicios internos del sistema, aplicativo y base de datos).
* **Dirección IP pública:** `38.191.221.27`
* **Dominio / Subdominio:** Registros DNS tipo A apuntando a la IP pública: [flexedu.nortedesantander.gov.co](http://flexedu.nortedesantander.gov.co/)
* **Usuario de acceso SSH:** `goberti`
* **Certificado SSL Wildcard:** `*.[nortedesantander.gov.co]` (instalado)
  * Certificado público: `/etc/ssl/certs/wildcard_nortedesantander_gov_co.crt`
  * Llave privada: `/etc/ssl/private/wildcard_nortedesantander_gov_co.key`
* **Identidad Institucional y Lineamientos Gráficos:**
  * Adopción de lineamientos de diseño UI/UX MinTIC (Kit 9.5).
  * Colorimetría institucional del sector: Tono petróleo institucional `#0e4c5b` (utilizado para contraste con el Logo SIT blanco).
  * Logo Gobernación de Norte de Santander (sin fondo).
  * Ícono institucional de Educación (`ICONO_EDUCACION`) letra blanca sin fondo.
  * Logo SIT blanco sin fondo (para fondo oscuro `#0e4c5b`).
  * Denominación limpia oficial: **"Herramienta de adaptación y flexibilización curricular en emergencias"** (sin menciones de convenios ni entidades cooperantes en el subtítulo).

### 5.2. Paquete Integral de Entrega y Transferencia Tecnológica
Para garantizar la plena autonomía, seguridad y sostenibilidad institucional en la Gobernación, el proceso de entrega incluye:
1. **Código fuente completo de la herramienta:** Repositorio versionado con la totalidad de componentes frontend (PWA modular y standalone), scripts de sincronización y utilitarios.
2. **Diccionario de datos:** Esquema estructurado con definición detallada de tablas, campos, llaves foráneas, tipos de datos y restricciones del modelo relacional pedagógico.
3. **Credenciales y claves de acceso correspondientes:** Usuarios y roles administrativos tanto a nivel de sistema operativo como de base de datos PostgreSQL, entregados bajo protocolo confidencial.
4. **Documentación técnica del software:** Manual de arquitectura, guía de instalación paso a paso, manual de despliegue en Linux y manual de soporte operativo para el equipo de TIC departamental.
5. **Estrategia y configuración de backups y contingencia:** Rutina automatizada vía `cron` diario ejecutando `pg_dump` con compresión, retención rotativa local (7 días diarios, 4 semanales, 3 mensuales) y directrices para copia cruzada al almacenamiento institucional de la Gobernación.

### 5.3. Configuración Nginx Oficial para el Subdominio `flexedu.nortedesantander.gov.co`
```nginx
server {
    listen 80;
    server_name flexedu.nortedesantander.gov.co;

    # Redirección obligatoria a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name flexedu.nortedesantander.gov.co;

    ssl_certificate /etc/ssl/certs/wildcard_nortedesantander_gov_co.crt;
    ssl_certificate_key /etc/ssl/private/wildcard_nortedesantander_gov_co.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/flexedu;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché estática y compresión Gzip para rendimiento óptimo
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### 5.4. Ejecución y Prueba Local Autónoma (Zonas sin Conectividad)
Para garantizar la atención en sedes rurales dispersas del Catatumbo y Norte de Santander sin internet:
1. **Opción Directa (Offline-First):** Abrir `index.html` o `app_standalone.html` en cualquier navegador web moderno sin requerir conexión a internet.
2. **Opción Servidor Ligero:** Ejecutar `iniciar_servidor_local.bat` o `python -m http.server 8080`.

### 5.5. Entorno de Pruebas y Homologación (CI/CD GitHub Pages)
* **Repositorio Oficial:** `https://github.com/Sebaspaezt/adaptacioncurricular`
* **URL de Pruebas en Vivo (Homologación previa a la MV):** [https://sebaspaezt.github.io/adaptacioncurricular/](https://sebaspaezt.github.io/adaptacioncurricular/)
* **URL en Producción Definitiva (MV Gobernación):** [https://flexedu.nortedesantander.gov.co](https://flexedu.nortedesantander.gov.co)
* **Flujo de Automatización:** Cada ajuste es validado y sincronizado automáticamente por el asistente de desarrollo (**Antigravity**) mediante `git push` a la rama `main`, sirviendo de entorno de homologación previo al despliegue definitivo en el servidor institucional de la Gobernación.



