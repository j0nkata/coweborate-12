import * as THREE from "three";

export type GlassTone = "dark" | "glass" | "bright";

export type TileAssets = {
  geometry: THREE.ExtrudeGeometry;
  edgeGeometry: THREE.EdgesGeometry;
  materials: Record<GlassTone, THREE.MeshPhysicalMaterial>;
  edgeMaterials: Record<GlassTone, THREE.LineBasicMaterial>;
};

function createRoundedRectangleShape() {
  const width = 1;
  const height = 1;
  const radius = 0.14;
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const shape = new THREE.Shape();

  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);

  return shape;
}

export function createTileAssets(): TileAssets {
  const geometry = new THREE.ExtrudeGeometry(createRoundedRectangleShape(), {
    depth: 0.17,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.045,
    bevelThickness: 0.045,
    curveSegments: 10,
    steps: 1,
  });
  geometry.center();
  geometry.computeVertexNormals();

  const edgeGeometry = new THREE.EdgesGeometry(geometry, 22);
  const shared = {
    roughness: 0.3,
    metalness: 0.06,
    transmission: 0.58,
    thickness: 1.15,
    ior: 1.42,
    clearcoat: 0.74,
    clearcoatRoughness: 0.24,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  } satisfies THREE.MeshPhysicalMaterialParameters;

  const materials = {
    dark: new THREE.MeshPhysicalMaterial({
      ...shared,
      color: 0x000108,
      emissive: 0x00002c,
      emissiveIntensity: 0.12,
      opacity: 0.76,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      ...shared,
      color: 0x000729,
      emissive: 0x00005c,
      emissiveIntensity: 0.14,
      opacity: 0.8,
    }),
    bright: new THREE.MeshPhysicalMaterial({
      ...shared,
      color: 0x000b38,
      emissive: 0x0000c0,
      emissiveIntensity: 0.24,
      opacity: 0.84,
      roughness: 0.26,
    }),
  } satisfies Record<GlassTone, THREE.MeshPhysicalMaterial>;

  const createEdgeMaterial = (color: number, opacity: number) =>
    new THREE.LineBasicMaterial({
      color,
      opacity,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });

  const edgeMaterials = {
    dark: createEdgeMaterial(0x0756d9, 0.34),
    glass: createEdgeMaterial(0x0878ff, 0.56),
    bright: createEdgeMaterial(0x6ab5ff, 0.78),
  } satisfies Record<GlassTone, THREE.LineBasicMaterial>;

  return { geometry, edgeGeometry, materials, edgeMaterials };
}

export function createRoundedGlassTile(
  assets: TileAssets,
  tone: GlassTone,
) {
  const tile = new THREE.Group();
  const surface = new THREE.Mesh(assets.geometry, assets.materials[tone]);
  const edge = new THREE.LineSegments(
    assets.edgeGeometry,
    assets.edgeMaterials[tone],
  );

  surface.renderOrder = 1;
  edge.renderOrder = 2;
  tile.add(surface, edge);

  return tile;
}

export function disposeTileAssets(assets: TileAssets) {
  assets.geometry.dispose();
  assets.edgeGeometry.dispose();
  Object.values(assets.materials).forEach((material) => material.dispose());
  Object.values(assets.edgeMaterials).forEach((material) =>
    material.dispose(),
  );
}
