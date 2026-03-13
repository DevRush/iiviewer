#!/usr/bin/env python3
"""
Convert BodyParts3D OBJ files into a single GLB for the IIviews heart viewer.
Groups meshes into named segments that map to our coronary artery IDs.
"""

import trimesh
import numpy as np
import os

SRC_DIR = os.path.join(os.path.dirname(__file__), '..', 'heart-viz-temp', 'data', 'Postnatal_anatomical_structure')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'models')

# Map our segment IDs to BodyParts3D MM IDs
# Multiple MM IDs per segment get merged into one mesh
# Use the SAME IDs as src/data/arteries.ts so the 3D and 2D panels share segment IDs
CORONARY_SEGMENTS = {
    'lm':       {'mm': ['MM557'], 'label': 'Left Main', 'color': [1.0, 0.85, 0.2, 1.0]},
    'prox-lad': {'mm': ['MM420'], 'label': 'Prox LAD', 'color': [1.0, 0.3, 0.3, 1.0]},
    'mid-lad':  {'mm': ['MM424'], 'label': 'Mid LAD', 'color': [1.0, 0.35, 0.35, 1.0]},
    'dist-lad': {'mm': ['MM425'], 'label': 'Dist LAD', 'color': [1.0, 0.4, 0.4, 1.0]},
    'd1':       {'mm': ['MM422'], 'label': 'Diagonal 1', 'color': [1.0, 0.5, 0.3, 1.0]},
    'd2':       {'mm': ['MM432'], 'label': 'Diagonal 2', 'color': [1.0, 0.55, 0.35, 1.0]},
    'sep1':     {'mm': ['MM431', 'MM433', 'MM434'], 'label': 'Septal', 'color': [1.0, 0.6, 0.5, 1.0]},
    'prox-lcx': {'mm': ['MM426'], 'label': 'Prox LCx', 'color': [0.3, 0.7, 1.0, 1.0]},
    'dist-lcx': {'mm': ['MM635'], 'label': 'Dist LCx', 'color': [0.35, 0.65, 1.0, 1.0]},
    'om1':      {'mm': ['MM610'], 'label': 'OM1', 'color': [0.4, 0.8, 1.0, 1.0]},
    'om2':      {'mm': ['MM428'], 'label': 'OM2', 'color': [0.3, 0.6, 0.9, 1.0]},
    'pda':      {'mm': ['MM430'], 'label': 'PDA', 'color': [0.4, 0.7, 0.9, 1.0]},
    'prox-rca': {'mm': ['MM436'], 'label': 'Prox RCA', 'color': [0.3, 1.0, 0.5, 1.0]},
    'mid-rca':  {'mm': ['MM439'], 'label': 'Mid RCA', 'color': [0.35, 0.95, 0.5, 1.0]},
    'dist-rca': {'mm': ['MM441', 'MM556'], 'label': 'Dist RCA', 'color': [0.4, 0.9, 0.5, 1.0]},
    'am':       {'mm': ['MM440'], 'label': 'Acute Marginal', 'color': [0.5, 1.0, 0.6, 1.0]},
    'plv':      {'mm': ['MM444', 'MM437'], 'label': 'PLV', 'color': [0.4, 0.85, 0.45, 1.0]},
}

# Myocardium wall segments (merged into one big mesh)
MYOCARDIUM_MM = [
    'MM474', 'MM542', 'MM544',  # Free wall of left ventricle
    'MM550', 'MM551',            # Wall of inflow part of right ventricle
    'MM538',                     # Wall of outflow part of right ventricle
    'MM456',                     # Lateral wall of left atrium
    'MM458',                     # Septal wall of left atrium
    'MM460',                     # Superior wall of left atrium
    'MM559',                     # Anterior wall of right atrium
    'MM560',                     # Lateral wall of right atrium
    'MM577', 'MM578', 'MM580',  # Septal wall of left ventricle
    'MM594',                     # Muscular interventricular septum
    'MM419', 'MM582', 'MM592', 'MM593',  # Interatrial septum
]

# Great vessels (aorta, pulmonary)
VESSELS_MM = [
    'MM506',  # Ascending aorta
]


def load_mm(mm_id: str) -> trimesh.Trimesh | None:
    """Load an OBJ file by its MM ID prefix."""
    for fname in os.listdir(SRC_DIR):
        if fname.startswith(mm_id + '_') and fname.endswith('.obj'):
            path = os.path.join(SRC_DIR, fname)
            try:
                mesh = trimesh.load(path, force='mesh')
                if hasattr(mesh, 'vertices') and len(mesh.vertices) > 0:
                    return mesh
            except Exception as e:
                print(f'  Warning: failed to load {fname}: {e}')
    return None


def merge_meshes(meshes: list[trimesh.Trimesh]) -> trimesh.Trimesh | None:
    """Merge multiple trimesh objects into one."""
    valid = [m for m in meshes if m is not None]
    if not valid:
        return None
    if len(valid) == 1:
        return valid[0]
    return trimesh.util.concatenate(valid)


def fix_mesh(mesh: trimesh.Trimesh):
    """Fix face winding for correct rendering in WebGL (CCW)."""
    # Flip face winding — BodyParts3D OBJs use CW winding,
    # but WebGL/Three.js expects CCW for front-facing
    mesh.faces = np.fliplr(mesh.faces)


def set_mesh_color(mesh: trimesh.Trimesh, rgba: list[float]):
    """Apply a uniform vertex color to a mesh."""
    color_uint8 = [int(c * 255) for c in rgba]
    mesh.visual = trimesh.visual.ColorVisuals(
        mesh=mesh,
        vertex_colors=np.tile(color_uint8, (len(mesh.vertices), 1))
    )


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    scene = trimesh.Scene()

    # 1. Load coronary artery segments
    print('Loading coronary arteries...')
    artery_count = 0
    for seg_id, info in CORONARY_SEGMENTS.items():
        meshes = []
        for mm_id in info['mm']:
            m = load_mm(mm_id)
            if m:
                meshes.append(m)
        merged = merge_meshes(meshes)
        if merged:
            fix_mesh(merged)
            set_mesh_color(merged, info['color'])
            # Name format: "artery__{segId}__{label}"
            geom_name = f"artery__{seg_id}__{info['label']}"
            scene.add_geometry(merged, geom_name=geom_name, node_name=geom_name)
            artery_count += 1
            print(f'  {seg_id}: {info["label"]} ({len(merged.vertices)} verts)')
        else:
            print(f'  {seg_id}: MISSING ({info["mm"]})')

    # 2. Load myocardium walls
    print('Loading myocardium...')
    myo_meshes = []
    for mm_id in MYOCARDIUM_MM:
        m = load_mm(mm_id)
        if m:
            myo_meshes.append(m)
    myo = merge_meshes(myo_meshes)
    if myo:
        set_mesh_color(myo, [0.76, 0.46, 0.43, 1.0])  # Warm cardiac color
        fix_mesh(myo)
        scene.add_geometry(myo, geom_name='myocardium', node_name='myocardium')
        print(f'  Myocardium: {len(myo.vertices)} verts')

    # 3. Load great vessels (aorta)
    print('Loading vessels...')
    vessel_meshes = []
    for mm_id in VESSELS_MM:
        m = load_mm(mm_id)
        if m:
            vessel_meshes.append(m)
    vessels = merge_meshes(vessel_meshes)
    if vessels:
        set_mesh_color(vessels, [0.85, 0.65, 0.6, 1.0])  # Pinkish
        fix_mesh(vessels)
        scene.add_geometry(vessels, geom_name='aorta', node_name='aorta')
        print(f'  Aorta: {len(vessels.vertices)} verts')

    # 4. Center the scene at origin
    bounds = scene.bounds
    center = (bounds[0] + bounds[1]) / 2
    for name, geom in scene.geometry.items():
        geom.vertices -= center

    # 5. Scale to fit in a ~3 unit bounding box (matching our scene units)
    bounds = scene.bounds
    max_extent = (bounds[1] - bounds[0]).max()
    scale = 3.0 / max_extent
    for name, geom in scene.geometry.items():
        geom.vertices *= scale

    # 6. Export
    out_path = os.path.join(OUT_DIR, 'heart_anatomy.glb')
    scene.export(out_path, file_type='glb')
    file_size = os.path.getsize(out_path) / 1024
    print(f'\nExported: {out_path} ({file_size:.0f} KB)')
    print(f'Coronary segments: {artery_count}')
    print(f'Total meshes in scene: {len(scene.geometry)}')


if __name__ == '__main__':
    main()
