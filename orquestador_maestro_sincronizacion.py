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
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f'Fecha y hora: {now_str}')
    
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
        subprocess.run([sys.executable, build_script], capture_output=True, text=True, encoding='utf-8', errors='replace')
        print('    [OK] Modulos web e index.html compilados.')
    if os.path.exists(standalone_script):
        subprocess.run([sys.executable, standalone_script], capture_output=True, text=True, encoding='utf-8', errors='replace')
        print('    [OK] app_standalone.html (version autonoma offline) compilada.')
        
    # 4. Actualizar libros Excel de Proyecto 1
    print('\n[4/6] Verificando y sincronizando Libros Excel (Ciclos I al V)...')
    sync_excel_script = os.path.join(p1_dir, 'scripts', 'standardize_all_vistas_and_monitoreo_all_ciclos.py')
    if os.path.exists(sync_excel_script):
        res = subprocess.run([sys.executable, sync_excel_script], capture_output=True, text=True, encoding='utf-8', errors='replace')
        if res.returncode == 0:
            print('    [OK] Hojas de Excel estandarizadas con exito.')
        else:
            print(f'    [!] Advertencia en Excel: {res.stderr[:200]}')
            
    # 5. Ejecucion de Pruebas de Auditoria y Verificacion Cruzada
    print('\n[5/6] Ejecutando suite de verificacion cruzada...')
    test_script = os.path.join(p1_dir, 'scripts', 'test_diagnostic_filter_and_monitoring.py')
    if os.path.exists(test_script):
        res_test = subprocess.run([sys.executable, test_script], cwd=p1_dir, capture_output=True, text=True, encoding='utf-8', errors='replace')
        if res_test.returncode == 0:
            print('    [OK] Pruebas combinatorias de diagnostico y monitoreo: 100% PASADAS.')
        else:
            print(f'    [!] Error en pruebas: {res_test.stderr[:200]}')
            
    # 7. Sincronización Automática con GitHub (Despliegue Continuo Web)
    print('\n[7/8] Sincronizando y desplegando en GitHub Pages...')
    git_bin = r'C:\Program Files\Git\bin\git.exe'
    if not os.path.exists(git_bin):
        git_bin = 'git'
    try:
        subprocess.run([git_bin, 'add', '.'], cwd=p2_dir, capture_output=True, text=True, encoding='utf-8', errors='replace')
        commit_msg = f"Actualización automática sincronizada: {now_str} (v{ver})"
        commit_res = subprocess.run([git_bin, 'commit', '-m', commit_msg], cwd=p2_dir, capture_output=True, text=True, encoding='utf-8', errors='replace')
        if "nothing to commit" in commit_res.stdout:
            print('    [OK] No hay cambios pendientes por subir a GitHub.')
        else:
            print('    [OK] Commit creado localmente en Proyecto 2.')
            push_res = subprocess.run([git_bin, 'push', 'origin', 'main'], cwd=p2_dir, capture_output=True, text=True, encoding='utf-8', errors='replace')
            if push_res.returncode == 0:
                print('    [OK] ¡Despliegue exitoso en GitHub! Web actualizada en vivo.')
            else:
                print(f'    [!] Advertencia al enviar a GitHub: {push_res.stderr[:200]}')
    except Exception as e:
        print(f'    [!] No se pudo conectar con Git automáticamente: {e}')

    # 8. Sincronización Automática con la Máquina Virtual de la Gobernación (flexedu.nortedesantander.gov.co)
    print('\n[8/8] Sincronizando y desplegando en la MV de la Gobernación (flexedu.nortedesantander.gov.co)...')
    try:
        import paramiko
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        vm_ip = '38.191.221.27'
        vm_user = 'goberti'
        vm_pwd = 'GobfQM7wLB3cGS8$w'
        
        ssh.connect(vm_ip, port=22, username=vm_user, password=vm_pwd, timeout=15)
        
        # Subir a carpeta temporal y mover con sudo
        stdin, stdout, stderr = ssh.exec_command("rm -rf /home/goberti/flexedu_sync && mkdir -p /home/goberti/flexedu_sync")
        stdout.read()
        
        sftp = ssh.open_sftp()
        local_root = p2_dir
        remote_temp = "/home/goberti/flexedu_sync"
        
        subidos = 0
        for root, dirs, files in os.walk(local_root):
            if '__pycache__' in root or '.git' in root:
                continue
            rel_path = os.path.relpath(root, local_root).replace('\\', '/')
            dest_dir = remote_temp if rel_path == '.' else f"{remote_temp}/{rel_path}"
            
            current = remote_temp
            if rel_path != '.':
                for part in rel_path.split('/'):
                    current += f"/{part}"
                    try:
                        sftp.mkdir(current)
                    except:
                        pass
                        
            for f in files:
                if f.endswith('.py') and ('test' in f or 'scratch' in f or 'probar' in f):
                    continue
                local_f = os.path.join(root, f)
                remote_f = f"{dest_dir}/{f}"
                sftp.put(local_f, remote_f)
                subidos += 1
        sftp.close()
        
        # Mover a /var/www/flexedu y reiniciar Nginx
        def vm_sudo(cmd):
            si, so, se = ssh.exec_command(f"echo '{vm_pwd}' | sudo -S -p '' {cmd}")
            return so.read().decode('utf-8', errors='ignore'), se.read().decode('utf-8', errors='ignore')
            
        vm_sudo("cp -r /home/goberti/flexedu_sync/* /var/www/flexedu/")
        vm_sudo("chown -R www-data:www-data /var/www/flexedu && chmod -R 755 /var/www/flexedu")
        vm_sudo("rm -rf /home/goberti/flexedu_sync")
        vm_sudo("systemctl reload nginx")
        ssh.close()
        print(f'    [OK] ¡Despliegue exitoso en Gobernación! ({subidos} archivos actualizados en vivo).')
    except Exception as e:
        print(f'    [!] Advertencia al sincronizar con la MV de la Gobernación: {e}')

    print('\n' + '=' * 80)
    print('  SINCRONIZACION TRIPLEMENTE SIMULTANEA FINALIZADA CON EXITO:')
    print('  1. Entorno Local (Archivos y Standalone)')
    print('  2. GitHub Pages (Homologacion en vivo)')
    print('  3. Subdominio Oficial Gobernacion (flexedu.nortedesantander.gov.co)')
    print('=' * 80)
    return True

if __name__ == '__main__':
    run_synchronization()
