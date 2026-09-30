# 🔐 GUÍA DE ENTREGA Y CONFIGURACIÓN DE PERFILES DE USUARIO (RBAC)
**Plataforma de Flexibilización y Adaptación Curricular en Situaciones de Emergencia**  
**Destinatario:** Secretaría de Educación Departamental / Gobernación de Norte de Santander  
**Subdominio Institucional:** `flexedu.nortedesantander.gov.co`

---

## 📌 1. ¿Cómo se entrega esta información a la Gobernación?

La entrega formal a la Secretaría de Educación Departamental (SED) y a su Oficina de TIC se compone de:

1. **El Software Configurado (Frontend Web):** Los archivos de la aplicación ya incluyen el sistema de roles y validación de permisos en [`auth.js`](file:///e:/Proyectos%20antigravity/NRC/Proyecto%20herramienta%202%20(web)/js/modules/auth.js).
2. **Este Documento de Entrega:** Entrega física o digital (PDF) con la definición de cada perfil, alcance de permisos y recomendaciones de credenciales.
3. **Cuentas Iniciales para la Puesta en Marcha:** La lista de cuentas base que la Gobernación utilizará para administrar y operar la plataforma en el subdominio.

---

## 👥 2. Matriz de Perfiles Adaptada a Nuestra Herramienta Curricular

Nuestra plataforma web está compuesta por tres componentes centrales:
* **Módulo A (Diagnóstico de Emergencia):** Formulario paramétrico multirriesgo (PGIRE), ciclo/grados, fechas y barreras de aprendizaje.
* **Módulo B (Rayuela Curricular):** Canasta de aprendizajes priorizados en 5 ciclos y 4 áreas disciplinares + socioemocional y supervivencia.
* **Módulo C (Monitoreo Semanal y SIEE):** Cronograma de 16 semanas efectivas, bitácora de evidencias y constancia oficial de acreditación.

Conforme a estos módulos, los **4 perfiles oficiales** tienen el siguiente alcance:

| Perfil Institucional | ¿A quién se le asigna? | ¿Qué puede hacer en nuestra plataforma? | Tipo de Permiso |
| :--- | :--- | :--- | :---: |
| **👑 Administrador** | Responsable institucional de la herramienta / Equipo TIC SED | • Crear y gestionar las cuentas de acceso.<br>• Parametrizar la plataforma.<br>• Consultar y supervisar todos los planes y diagnósticos guardados. | **Total (Lectura y Edición)** |
| **🛠️ Usuario Técnico** | Equipo pedagógico de la SED (Calidad y Cobertura) | • Acompañar a las Instituciones Educativas en territorio.<br>• Revisar diagnósticos, canastas curriculares y bitácoras.<br>• Asesorar y apoyar ajustes metodológicos. | **Lectura y Edición Departamental** |
| **🏫 Usuario IE** | Rectores, directivos docentes y docentes de la Institución Educativa | • Diligenciar y guardar el diagnóstico de su emergencia (Módulo A).<br>• Seleccionar y sincronizar su canasta curricular (Módulo B).<br>• Registrar el avance semanal y bitácora de evidencias (Módulo C).<br>• Exportar a Excel e imprimir constancias oficiales firmadas. | **Lectura y Edición de su IE** |
| **👁️ Usuario de Consulta** | Docentes observadores, organismos cooperantes y veeduría | • Explorar y revisar los 5 ciclos y mallas curriculares.<br>• Visualizar diagnósticos y monitoreo en modo lectura.<br>• Exportar resúmenes e informes en PDF/Excel.<br>• *No tiene permiso para modificar o alterar datos guardados.* | **Solo Lectura** |

---

## 🔑 3. Cuentas Maestras Iniciales para la Gobernación

Para la puesta en producción en `flexedu.nortedesantander.gov.co`, se entregan las siguientes cuentas iniciales:

| Usuario | Contraseña Inicial | Perfil | Entidad / Cargo | Observación |
| :--- | :--- | :---: | :--- | :--- |
| `admin_sed` | `admin123*` | **Administrador** | Secretaría de Educación Departamental | Cuenta maestra para el administrador de la herramienta |
| `tecnico_sed` | `tecnico123*` | **Usuario Técnico** | Equipo Pedagógico SED | Para funcionarios de supervisión curricular |
| `usuario_ie` | `ie123*` | **Usuario IE** | Institución Educativa Departamental | Modelo para rectores y docentes que diligencian planes |
| `usuario_consulta` | `consulta123*` | **Usuario Consulta** | Observadores / Cooperantes | Modo de solo lectura sin posibilidad de editar |

> **Nota de Seguridad para la SED:** Una vez instalado el sistema en el servidor de la Gobernación, el Administrador podrá cambiar las contraseñas predeterminadas directamente desde la plataforma.

---

## 🚀 4. Proceso de Instalación en el Subdominio (`flexedu.nortedesantander.gov.co`)

La plataforma web es de tecnología ligera, autónoma y sin dependencias pesadas:

1. **Subir archivos a la Máquina Virtual de la Gobernación:**
   Copiar el contenido de la carpeta `Proyecto herramienta 2 (web)` a la ruta web del servidor:
   ```bash
   scp -r "Proyecto herramienta 2 (web)/*" goberti@38.191.221.27:/var/www/flexedu/
   ```
2. **Permisos de lectura en el servidor:**
   ```bash
   sudo chown -R www-data:www-data /var/www/flexedu/
   sudo chmod -R 755 /var/www/flexedu/
   ```
3. **Verificación en el Navegador:**
   Ingresar a `https://flexedu.nortedesantander.gov.co`.
   Hacer clic en el botón de usuario en la barra superior: se abrirá la ventana de autenticación con el selector de perfiles listo para operar.
