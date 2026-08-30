#!/usr/bin/env python3
"""
Script para corregir espaciado vertical en diagramas SVG.
Estándar de espaciado:
- LoS: y=240
- QB: y=315 (75px desde LoS)
- RB: y=385 (70px desde QB)
"""

import os
import re
from pathlib import Path

# Rutas de las carpetas
OFENSIVOS_PATH = Path("C:/Users/emiez/OneDrive/Desktop/NFL app/Diagramas ofensivos")
DEFENSIVOS_PATH = Path("C:/Users/emiez/OneDrive/Desktop/NFL app/diagramas-defensa")

# Estándar de espaciado
LOS_Y = 240
QB_Y = 315
RB_Y = 385

# Colores para identificar elementos
COLORS = {
    "QB": "#e63946",  # Rojo
    "RB": "#2a9d8f",  # Teal
}

def fix_svg_spacing(svg_path):
    """Corrige el espaciado vertical en un archivo SVG."""
    with open(svg_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Patrón: encontrar círculos con color QB y ajustar cy
    # <circle cx="..." cy="..." r="..." fill="#e63946" ...>
    pattern_qb = r'(<circle\s+cx="[^"]*"\s+cy=")(\d+(?:\.\d+)?)(".*?fill="#e63946")'
    content = re.sub(pattern_qb, rf'\g<1>{QB_Y}\g<3>', content)

    # Patrón: encontrar círculos con color RB y ajustar cy
    pattern_rb = r'(<circle\s+cx="[^"]*"\s+cy=")(\d+(?:\.\d+)?)(".*?fill="#2a9d8f")'
    content = re.sub(pattern_rb, rf'\g<1>{RB_Y}\g<3>', content)

    # Patrón: ajustar elementos de texto debajo de QB
    # Buscar <text> que está 14-15px debajo del círculo QB
    pattern_qb_text = r'(<text\s+x="400(?:\.\d+)?"\s+y=")(\d+(?:\.\d+)?)(".*?>QB</text>)'
    content = re.sub(pattern_qb_text, rf'\g<1>{QB_Y + 15}\g<3>', content)

    # Patrón: ajustar elementos de texto debajo de RB
    pattern_rb_text = r'(<text\s+x="[^"]*"\s+y=")(\d+(?:\.\d+)?)(".*?>RB</text>)'
    content = re.sub(pattern_rb_text, rf'\g<1>{RB_Y + 15}\g<3>', content)

    # Si hubo cambios, guardar el archivo
    if content != original:
        with open(svg_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Corrige todos los diagramas SVG."""

    # Recopilar todos los archivos SVG
    svg_files = []

    # Ofensivos
    if OFENSIVOS_PATH.exists():
        svg_files.extend(OFENSIVOS_PATH.rglob("*.svg"))

    # Defensivos
    if DEFENSIVOS_PATH.exists():
        svg_files.extend(DEFENSIVOS_PATH.rglob("*.svg"))

    print(f"Encontrados {len(svg_files)} archivos SVG")
    print("=" * 60)

    fixed_count = 0
    for svg_path in sorted(svg_files):
        try:
            if fix_svg_spacing(svg_path):
                fixed_count += 1
                print(f"[FIXED] {svg_path.name}")
            else:
                print(f"[SKIP] {svg_path.name} (no changes)")
        except Exception as e:
            print(f"[ERROR] {svg_path.name}: {e}")

    print("=" * 60)
    print(f"FIXED: {fixed_count}/{len(svg_files)} diagramas")

if __name__ == "__main__":
    main()
