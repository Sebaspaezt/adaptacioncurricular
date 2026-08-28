---
name: Mundo Homeopático v2
version: alpha
description: Sistema de diseño "Elite" para la plataforma Mundo Homeopático. Enfocado en precisión micro-métrica, estética premium y coherencia atómica.
colors:
  primary: "#0A5C4E"
  primary-vibrant: "#158C77"
  secondary: "#020617"
  text-body: "#334155"
  text-muted: "#64748B"
  surface-white: "#FFFFFF"
  surface-muted: "#E7EDE3" # Sage Green Real
  surface-hover: "#E6EFED"
  border-light: "#E2E8F0"
  border-medium: "#CBD5E1"
typography:
  sans:
    fontFamily: Inter
    fontSize: 1rem
  serif:
    fontFamily: Libre Baskerville
    fontSize: 1rem
  h1:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: 800
    letterSpacing: "-0.025em"
  h2:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: 800
  label-caps:
    fontFamily: Inter
    fontSize: 0.6875rem # 11px
    fontWeight: 700
    letterSpacing: "0.1em"
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  "2xl": 24px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  layout-px-mobile: 32px
  layout-px-desktop: 72px
components:
  badge-elite:
    typography: "{typography.label-caps}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
  sidebar-capsule:
    height: 44px
    rounded: "{rounded.md}"
    fontSize: 14px
  input-elite:
    height: 40px
    backgroundColor: "rgba(248, 250, 252, 0.7)" # slate-50/70
    rounded: "{rounded.md}"
    border: "1px solid {colors.border-light}"
---

## Overview

**Elite Swiss-Fine Aesthetic.** La interfaz de Mundo Homeopático v2 se rige por la precisión quirúrgica, el uso de espacios negativos generosos y una paleta botánica sofisticada. No es solo una tienda, es un vademécum digital de alta gama.

Reglas maestras:
- **Sentence Case:** Prohibido el uso de uppercase sostenido. La legibilidad humana prima sobre el impacto visual agresivo.
- **Micro-interacciones:** Transiciones fluidas (`cubic-bezier(0.16, 1, 0.3, 1)`) en todos los estados hover y active.
- **Antialiasing:** Optimización de renderizado de fuentes para máxima nitidez en pantallas de alta densidad.

## Colors

La paleta está anclada en el **Verde Farmacéutico Profundo** (`primary`) y el **Sage Green** (`surface-muted`).

- **Primary (#0A5C4E):** El núcleo de la marca. Confianza y herencia homeopática.
- **Surface Muted (#E7EDE3):** Tono base para fondos secundarios, evocando papel botánico natural.
- **Secondary (#020617):** Negro pizarra profundo para máxima jerarquía en textos y elementos de contraste.

## Typography

Utilizamos una escala dinámica que permite al usuario ajustar la densidad de información.

- **Inter:** Nuestra fuente de trabajo. Se utiliza con `letter-spacing: 0.01em` para compensar la densidad del renderizado moderno.
- **Libre Baskerville:** Reservada para citas, descripciones botánicas o elementos que requieran un toque de herencia editorial.
- **Escalado Elite:**
  - **SM:** 14px (Base Swiss Fine)
  - **MD:** 17px (Texto Grande)
  - **LG:** 20px (Enfoque Accesibilidad)

## Layout & Spacing

El diseño respeta una "Plomada Visual" estricta:
- **Márgenes Laterales:** 32px en mobile, 72px en desktop para una inmersión total.
- **Grilla Atómica:** Basada en múltiplos de 4px y 8px.

## Shapes

Curvatura suave pero definida. Evitamos los bordes afilados para mantener la amigabilidad de la marca, pero usamos radios precisos (`8px` a `16px`) para mantener la estructura profesional.

## Components

### Badge Elite
Pequeños indicadores de estado que nunca deben gritar. Usan `color-mix` para variantes sutiles sobre el color `primary` o tonos pizarra.

### Sidebar "Lego"
Estructura modular donde el texto siempre mantiene una plomada a 48px del borde izquierdo, independientemente de si hay iconos o niveles de profundidad (acordeones).

## Do's and Don'ts

- **DO:** Usar `text-wrap: balance` en títulos largos.
- **DO:** Mantener los íconos (Hugeicons Solid) con el mismo color que el texto que acompañan.
- **DON'T:** Usar sombras paralelas pesadas. Preferimos bordes sutiles y cambios de tono de superficie.
- **DON'T:** Romper la jerarquía de Sentence Case.
