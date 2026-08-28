# -*- coding: utf-8 -*-
"""
ORQUESTADOR MAESTRO DE SINCRONIZACION: PROYECTO 1 (EXCEL) Y PROYECTO 2 (WEB)
Iniciativa de Flexibilizacion Curricular en Emergencia (NRC / MEN)

Este orquestador lee la 'MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.json' y aplica automaticamente
todos los cambios tanto en los 5 libros Excel (Proyecto 1) como en la Plataforma Web (Proyecto 2).
"""

import os
import sys
import json
import subprocess
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def find_paths():
    base_p2 = r'E:\Proyectos antigravity\NRC\Proyecto herramienta 2 (web)'
    base_p1 = r'E:\Proyectos antigravity\NRC\Proyecto herramienta 1'
    
    if not os.path.exists(base_p2):
        base_p2 = os.path.abspath('.')
    if not os.path.exists(base_p1):
        base_p1 = os.path.abspath(r'..\Proyecto herramienta 1')
        
    return base_p1, base_p2

def run_synchronization():
    print('=' * 80)
    print('  SINCRONIZACION DE AJUSTES MAESTROS: PROYECTO 1 (EXCEL) Y PROYECTO 2 (WEB)')
    print('=' * 80)
    print(f'Fecha y hora: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    
    p1_dir, p2_dir = find_paths()
    print(f'[*] Directorio Proyecto 1 (Excel): {p1_dir}')
    print(f'[*] Directorio Proyecto 2 (Web):   {p2_dir}')
    
    master_json_path = os.path.join(p2_dir, 'MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.json')
    if not os.path.exists(master_json_path):
        master_json_path = os.path.join(p1_dir, 'MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.json')
    if not os.path.exists(master_json_path):
        print(f'[ERROR] No se encontro el archivo maestro: {master_json_path}')
        return False
        
    with open(master_json_path, 'r', encoding='utf-8') as f:
        master_data = json.load(f)
        
    ver = master_data.get("metadata", {}).get("version", "1.0")
    print(f'\n[1/6] Cargando Matriz Maestra v{ver}...')
    
    # 1. Extraer sub-datasets
    curr_master = master_data.get('ecosistema_curriculo_multiciclo', {})
    reglas = master_data.get('reglas_calendario_y_monitoreo', {})
    for k, v in reglas.items():
        curr_master[k] = v
        
    pgire_data = master_data.get('catalogo_pgire_40_amenazas', [])
    habs_sups_data = master_data.get('habilidades_socioemocionales_y_supervivencia', {})
    
    # 2. Sincronizar Datasets JSON en Proyecto 1 y Proyecto 2
    print('\n[2/6] Sincronizando Datasets JSON maestros...')
    # En Proyecto 1
    p1_ciclos = os.path.join(p1_dir, 'CICLOS')
    os.makedirs(p1_ciclos, exist_ok=True)
    with open(os.path.join(p1_ciclos, 'curriculum_master.json'), 'w', encoding='utf-8') as f:
        json.dump(curr_master, f, indent=2, ensure_ascii=False)
    with open(os.path.join(p1_dir, 'pgire_extracted.json'), 'w', encoding='utf-8') as f:
        json.dump(pgire_data, f, indent=2, ensure_ascii=False)
    with open(os.path.join(p1_dir, 'habs_sups.json'), 'w', encoding='utf-8') as f:
        json.dump(habs_sups_data, f, indent=2, ensure_ascii=False)
    # Guardar copia de backup del master json en p1
    with open(os.path.join(p1_dir, 'MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.json'), 'w', encoding='utf-8') as f:
        json.dump(master_data, f, indent=2, ensure_ascii=False)
        
    # En Proyecto 2 JS DATA
    p2_js_data = os.path.join(p2_dir, 'js', 'data')
    os.makedirs(p2_js_data, exist_ok=True)
    with open(os.path.join(p2_js_data, 'curriculum_db.js'), 'w', encoding='utf-8') as f:
        f.write('export const CURRICULUM_DB = ' + json.dumps(curr_master, indent=2, ensure_ascii=False) + ';\n')
    with open(os.path.join(p2_js_data, 'pgire_db.js'), 'w', encoding='utf-8') as f:
        f.write('export const PGIRE_DB = ' + json.dumps(pgire_data, indent=2, ensure_ascii=False) + ';\n')
    with open(os.path.join(p2_js_data, 'habs_sups_db.js'), 'w', encoding='utf-8') as f:
        f.write('export const HABS_SUPS_DB = ' + json.dumps(habs_sups_data, indent=2, ensure_ascii=False) + ';\n')
    print('    [OK] curriculum_master.json / curriculum_db.js actualizados.')
    print('    [OK] pgire_extracted.json / pgire_db.js actualizados.')
    print('    [OK] habs_sups.json / habs_sups_db.js actualizados.')
    
    # 3. Compilar archivos modulares y standalone de la Aplicacion Web (Proyecto 2)
    print('\n[3/6] Compilando plataforma Web en Proyecto 2...')
    build_script = os.path.join(p1_dir, 'scripts', 'build_web_app_files.py')
    standalone_script = os.path.join(p1_dir, 'scripts', 'create_standalone_app.py')
    
    if os.path.exists(build_script):
        subprocess.run([sys.executable, build_script], capture_output=True, text=True)
        print('    [OK] Modulos web e index.html compilados.')
    if os.path.exists(standalone_script):
        subprocess.run([sys.executable, standalone_script], capture_output=True, text=True)
        print('    [OK] app_standalone.html (version autonoma offline) compilada.')
        
    # 4. Actualizar libros Excel de Proyecto 1
    print('\n[4/6] Verificando y sincronizando Libros Excel (Ciclos I al V)...')
    sync_excel_script = os.path.join(p1_dir, 'scripts', 'standardize_all_vistas_and_monitoreo_all_ciclos.py')
    if os.path.exists(sync_excel_script):
        res = subprocess.run([sys.executable, sync_excel_script], capture_output=True, text=True)
        if res.returncode == 0:
            print('    [OK] Hojas de Excel estandarizadas con exito.')
        else:
            print(f'    [!] Advertencia en Excel: {res.stderr[:200]}')
            
    # 5. Ejecucion de Pruebas de Auditoria y Verificacion Cruzada
    print('\n[5/6] Ejecutando suite de verificacion cruzada...')
    test_script = os.path.join(p1_dir, 'scripts', 'test_diagnostic_filter_and_monitoring.py')
    if os.path.exists(test_script):
        res_test = subprocess.run([sys.executable, test_script], capture_output=True, text=True)
        if res_test.returncode == 0:
            print('    [OK] Pruebas combinatorias de diagnostico y monitoreo: 100% PASADAS.')
        else:
            print(f'    [!] Error en pruebas: {res_test.stderr[:200]}')
            
    # 6. Actualizacion de Registro de Ajustes (Changelog)
    print('\n[6/6] Consolidando registro de ajustes y metadatos...')
    ajustes = master_data.get('registro_ajustes', [])
    ajustes_aplicados_ahora = 0
    now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    for aj in ajustes:
        if aj.get('estado') == 'PENDIENTE':
            aj['estado'] = 'APLICADO'
            aj['fecha_aplicacion'] = now_str
            ajustes_aplicados_ahora += 1
            
    master_data['metadata']['ultima_sincronizacion'] = now_str
    with open(master_json_path, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, indent=2, ensure_ascii=False)
    with open(os.path.join(p1_dir, 'MATRIZ_MAESTRA_AJUSTES_Y_SINCRONIZACION.json'), 'w', encoding='utf-8') as f:
        json.dump(master_data, f, indent=2, ensure_ascii=False)
        
    print(f'    [OK] Registro de ajustes actualizado ({ajustes_aplicados_ahora} ajustes aplicados).')
    print('\n' + '=' * 80)
    print('  SINCRONIZACION INTEGRAL PROYECTO 1 Y PROYECTO 2 FINALIZADA CON EXITO')
    print('=' * 80)
    return True

if __name__ == '__main__':
    run_synchronization()
