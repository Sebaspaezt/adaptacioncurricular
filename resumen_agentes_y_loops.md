# Resumen de Aprendizaje: Agentes de IA, Loops y Memoria Persistente

Este documento consolida los aprendizajes y conceptos clave extraídos de las últimas publicaciones técnicas de Anthropic y flujos de trabajo con agentes.

## Conceptos Clave

### 1. El Fin del "Simple Prompting"
* **Viejo paradigma**: Re-escribir prompts largos en cada nueva sesión del chat, repitiendo el contexto del proyecto y del usuario.
* **Nuevo paradigma (Loops)**: Diseñar el bucle una sola vez y permitir que el agente de IA trabaje de manera autónoma en disco (buscando, modificando y validando archivos).

### 2. Memoria Persistente (`CLAUDE.md` / `AGENTS.md`)
* Para evitar que la IA "olvide" el contexto entre sesiones, se estructuran archivos de instrucciones locales en la raíz del proyecto.
* **Qué contiene**:
  * Perfil e identidad del usuario.
  * Objetivos principales del proyecto.
  * Reglas de estilo (ej. usar *Sentence Case*).
  * Lista de comandos y herramientas disponibles.

### 3. Integración de Segundo Cerebro (Obsidian + MCP)
* Obsidian almacena el conocimiento local en archivos Markdown planos.
* Claude se conecta a la base de notas usando **MCP (Model Context Protocol)** y el plugin de API REST local de Obsidian.
* Esto permite que la IA lea y relacione notas de proyectos automáticamente en segundo plano.

---

## Dónde Aplicamos Esto en Nuestro Workspace

1. **Configuración de Agente**:
   * Las reglas y personalizaciones globales se gestionan a través del directorio interno `.gemini/config` (administrado automáticamente por la plataforma) y a nivel de proyecto mediante la configuración de `.agents` (cuando se define un workspace activo).
   
2. **Habilidades Locales (Skills)**:
   * Podemos crear carpetas de `skills` en nuestros proyectos. Cada skill es un archivo Markdown que describe un procedimiento recurrente (ej: actualizar duplicados, limpiar reportes o consolidar bases de datos) para que la IA lo ejecute bajo demanda.
