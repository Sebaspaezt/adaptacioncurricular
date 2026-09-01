// Base de datos de Amenazas y Riesgos PGIRE (40 registros clasificados)
var PGIRE_DB = [
  {
    "categoria": "NATURAL",
    "amenaza": "Sismo",
    "ejemplo": "Movimiento sísmico",
    "riesgo": "Lesiones, colapso parcial de infraestructura, interrupción de clases",
    "ruta": "🏙️ MTGIRE / UNGRD / CMGRD / CDGRD / Alcaldía (Mesa Territorial de Gestión del Riesgo)"
  },
  {
    "categoria": "NATURAL",
    "amenaza": "Inundación",
    "ejemplo": "Creciente de río o quebrada",
    "riesgo": "Daños a infraestructura, suspensión de actividades académicas",
    "ruta": "🏙️ MTGIRE / UNGRD / CMGRD / CDGRD / Alcaldía (Mesa Territorial de Gestión del Riesgo)"
  },
  {
    "categoria": "NATURAL",
    "amenaza": "Vendaval",
    "ejemplo": "Fuertes vientos",
    "riesgo": "Caída de cubiertas, árboles o postes",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "NATURAL",
    "amenaza": "Tormenta eléctrica",
    "ejemplo": "Descargas atmosféricas",
    "riesgo": "Electrocución, daños en equipos",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "NATURAL",
    "amenaza": "Sequía",
    "ejemplo": "Escasez de agua",
    "riesgo": "Suspensión del servicio educativo",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "NATURAL",
    "amenaza": "Ola de calor",
    "ejemplo": "Altas temperaturas",
    "riesgo": "Afectaciones en salud",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "NATURAL",
    "amenaza": "Incendio forestal",
    "ejemplo": "Quema de cobertura vegetal",
    "riesgo": "Afectación de sedes rurales",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "NATURAL",
    "amenaza": "Heladas",
    "ejemplo": "Bajas temperaturas",
    "riesgo": "Afectación a estudiantes y cultivos escolares",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "NATURAL",
    "amenaza": "Granizada",
    "ejemplo": "Precipitaciones intensas",
    "riesgo": "Daños en cubiertas",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "NATURAL",
    "amenaza": "Epidemias de origen natural",
    "ejemplo": "Brotes de enfermedades",
    "riesgo": "Ausentismo escolar",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Deslizamientos",
    "ejemplo": "Tala de bosques y ocupación de laderas",
    "riesgo": "Afectación de sedes rurales",
    "ruta": "🏙️ MTGIRE / UNGRD / CMGRD / CDGRD / Alcaldía (Mesa Territorial de Gestión del Riesgo)"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Erosión",
    "ejemplo": "Deterioro del terreno",
    "riesgo": "Riesgo estructural",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Inundaciones por mal drenaje",
    "ejemplo": "Alcantarillado insuficiente",
    "riesgo": "Daños locativos",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Avalanchas",
    "ejemplo": "Intervención de cuencas",
    "riesgo": "Aislamiento de la comunidad educativa",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Caída de árboles",
    "ejemplo": "Deforestación",
    "riesgo": "Lesiones y daños",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Incendios por quemas agrícolas",
    "ejemplo": "Prácticas inadecuadas",
    "riesgo": "Riesgo para estudiantes",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Contaminación de fuentes hídricas",
    "ejemplo": "Manejo inadecuado de residuos",
    "riesgo": "Riesgo sanitario",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Hundimientos",
    "ejemplo": "Alteración del suelo",
    "riesgo": "Daño estructural",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Deterioro de taludes",
    "ejemplo": "Excavaciones",
    "riesgo": "Riesgo de colapso",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "SOCIONATURAL",
    "amenaza": "Desertificación",
    "ejemplo": "Degradación ambiental",
    "riesgo": "Afectación del abastecimiento de agua",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Incendio estructural",
    "ejemplo": "Cortocircuitos o fallas eléctricas",
    "riesgo": "Lesiones, pérdida de infraestructura",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Emergencia médica",
    "ejemplo": "Accidentes escolares",
    "riesgo": "Atención prehospitalaria",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Accidentes de tránsito",
    "ejemplo": "Transporte escolar",
    "riesgo": "Lesiones a estudiantes",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Fuga de gas",
    "ejemplo": "Laboratorios o cocinas",
    "riesgo": "Explosiones",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Riesgo eléctrico",
    "ejemplo": "Instalaciones deterioradas",
    "riesgo": "Electrocución",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Colapso estructural",
    "ejemplo": "Infraestructura en mal estado",
    "riesgo": "Lesiones graves",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Derrame de sustancias peligrosas",
    "ejemplo": "Laboratorios",
    "riesgo": "Contaminación",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Consumo de SPA",
    "ejemplo": "Entorno escolar",
    "riesgo": "Afectación de la convivencia",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Violencia escolar",
    "ejemplo": "Agresiones entre estudiantes",
    "riesgo": "Lesiones físicas y emocionales",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA",
    "amenaza": "Ciberacoso",
    "ejemplo": "Uso de redes sociales",
    "riesgo": "Afectación psicosocial",
    "ruta": "🏫 CIGIRE (Comité Institucional en IE - Res. MEN 6519/2025 y Circular 19/2022) + Bomberos / Salud / Convivencia"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "Presencia de grupos armados",
    "ejemplo": "Entorno de la IE",
    "riesgo": "Restricción al derecho a la educación",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "Reclutamiento, uso y utilización de NNA",
    "ejemplo": "Riesgo para estudiantes",
    "riesgo": "Deserción y vulneración de derechos",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "MAP/MUSE/AEI",
    "ejemplo": "Contaminación del territorio",
    "riesgo": "Accidentes por explosivos",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "Enfrentamientos armados",
    "ejemplo": "Cercanía a la IE",
    "riesgo": "Lesiones y suspensión de clases",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "Hostigamientos",
    "ejemplo": "Ataques a la comunidad",
    "riesgo": "Riesgo para docentes y estudiantes",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "Desplazamiento forzado",
    "ejemplo": "Movilidad de familias",
    "riesgo": "Interrupción de la trayectoria educativa",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "Confinamiento",
    "ejemplo": "Restricciones de movilidad",
    "riesgo": "Inasistencia escolar",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "Violencia Basada en Género (VBG)",
    "ejemplo": "Riesgo para niñas, adolescentes y mujeres",
    "riesgo": "Vulneración de derechos",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "Violencia sexual",
    "ejemplo": "Dentro o fuera del entorno escolar",
    "riesgo": "Afectación física y emocional",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  },
  {
    "categoria": "ANTRÓPICA – CONFLICTO ARMADO Y PROTECCIÓN",
    "amenaza": "Uso u ocupación de la infraestructura educativa",
    "ejemplo": "Presencia de actores armados",
    "riesgo": "Suspensión del servicio educativo",
    "ruta": "🛡️ RUTA DE PROTECCIÓN HUMANITARIA (CIGIRE + ICBF + Defensoría + Personería + NRC)"
  }
];
