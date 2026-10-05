export type Vec3Tuple = readonly [number, number, number];

export type TileTransform = {
  position: Vec3Tuple;
  rotation: Vec3Tuple;
  scale: Vec3Tuple;
  visible?: boolean;
};

export type TileConfig = {
  desktop: TileTransform;
  mobile: TileTransform;
  tone: "dark" | "glass" | "bright";
  entrance: Vec3Tuple;
};

export type CameraConfig = {
  position: Vec3Tuple;
  introPosition: Vec3Tuple;
  target: Vec3Tuple;
  fov: number;
};

export const DESKTOP_CAMERA: CameraConfig = {
  position: [0.35, 0.92, 10.35],
  introPosition: [0.48, 1.18, 9.2],
  target: [0, -1.38, 0],
  fov: 35,
};

export const MOBILE_CAMERA: CameraConfig = {
  position: [0.08, 0.48, 10.8],
  introPosition: [0.08, 0.72, 9.75],
  target: [0, -0.22, 0],
  fov: 37,
};

export const TILE_CONFIGS: readonly TileConfig[] = [
  {
    tone: "dark",
    entrance: [-0.35, -0.45, -0.5],
    desktop: {
      position: [-5.35, -2.85, -0.25],
      rotation: [-0.18, 0.18, -0.13],
      scale: [2.45, 1.18, 1],
    },
    mobile: {
      position: [-2.05, -2.85, -0.2],
      rotation: [-0.14, 0.15, -0.12],
      scale: [1.55, 0.9, 1],
    },
  },
  {
    tone: "glass",
    entrance: [-0.2, -0.55, -0.35],
    desktop: {
      position: [-3.05, -2.62, 0.05],
      rotation: [-0.12, 0.1, 0.07],
      scale: [2.08, 1.34, 1],
    },
    mobile: {
      position: [-0.55, -2.78, 0.08],
      rotation: [-0.11, 0.08, 0.08],
      scale: [1.35, 1.02, 1],
    },
  },
  {
    tone: "dark",
    entrance: [0.12, -0.5, -0.55],
    desktop: {
      position: [-0.95, -2.88, 0.3],
      rotation: [-0.09, -0.08, -0.05],
      scale: [1.7, 1.42, 1],
    },
    mobile: {
      position: [1.02, -2.73, 0.26],
      rotation: [-0.08, -0.08, -0.06],
      scale: [1.42, 1.04, 1],
    },
  },
  {
    tone: "glass",
    entrance: [0.25, -0.62, -0.3],
    desktop: {
      position: [1.18, -2.58, 0.14],
      rotation: [-0.16, -0.12, 0.09],
      scale: [2.15, 1.2, 1],
    },
    mobile: {
      position: [2.15, -2.35, 0.05],
      rotation: [-0.15, -0.1, 0.1],
      scale: [1.5, 0.84, 1],
    },
  },
  {
    tone: "dark",
    entrance: [0.3, -0.5, -0.45],
    desktop: {
      position: [3.55, -2.13, -0.08],
      rotation: [-0.12, -0.2, -0.1],
      scale: [2.2, 1.28, 1],
    },
    mobile: {
      position: [-1.65, -1.72, -0.12],
      rotation: [-0.12, 0.16, -0.08],
      scale: [1.38, 0.88, 1],
    },
  },
  {
    tone: "glass",
    entrance: [0.45, -0.35, -0.4],
    desktop: {
      position: [5.65, -1.58, 0.1],
      rotation: [-0.16, -0.24, 0.06],
      scale: [2.18, 1.12, 1],
    },
    mobile: {
      position: [-0.22, -1.62, 0.12],
      rotation: [-0.1, 0.05, 0.07],
      scale: [1.22, 0.94, 1],
    },
  },
  {
    tone: "dark",
    entrance: [-0.42, -0.4, -0.42],
    desktop: {
      position: [-4.25, -1.12, -0.16],
      rotation: [-0.13, 0.22, 0.08],
      scale: [2.05, 1.03, 1],
    },
    mobile: {
      position: [1.25, -1.45, 0.25],
      rotation: [-0.08, -0.1, -0.05],
      scale: [1.36, 1.0, 1],
    },
  },
  {
    tone: "glass",
    entrance: [-0.15, -0.52, -0.28],
    desktop: {
      position: [-1.82, -1.18, 0.2],
      rotation: [-0.1, 0.04, -0.08],
      scale: [2.02, 1.2, 1],
    },
    mobile: {
      position: [2.08, -0.92, -0.02],
      rotation: [-0.14, -0.15, 0.08],
      scale: [1.44, 0.86, 1],
    },
  },
  {
    tone: "bright",
    entrance: [0.05, -0.65, -0.62],
    desktop: {
      position: [0.58, -1.02, 0.48],
      rotation: [-0.08, -0.06, 0.04],
      scale: [2.18, 1.46, 1],
    },
    mobile: {
      position: [-0.52, -0.52, 0.42],
      rotation: [-0.08, 0.04, 0.04],
      scale: [1.55, 1.08, 1],
    },
  },
  {
    tone: "glass",
    entrance: [0.22, -0.38, -0.34],
    desktop: {
      position: [2.95, -0.56, 0.12],
      rotation: [-0.12, -0.14, -0.06],
      scale: [2.0, 1.12, 1],
    },
    mobile: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: false,
    },
  },
  {
    tone: "dark",
    entrance: [0.4, -0.32, -0.5],
    desktop: {
      position: [5.15, 0.08, -0.1],
      rotation: [-0.16, -0.25, 0.1],
      scale: [2.26, 1.08, 1],
    },
    mobile: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: false,
    },
  },
];
