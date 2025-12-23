import { UniversalCamera, Vector3, type Scene } from '@babylonjs/core';

export const createCamera = (scene: Scene, canvas: HTMLCanvasElement) => {
  const camera = new UniversalCamera(
    'EditorCamera',
    new Vector3(0, 2, -5),
    scene
  );
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);
  camera.speed = 0.35;
  camera.angularSensibility = 3000;
  camera.minZ = 0.01;
  camera.maxZ = 10000;

  camera.keysUp = [87];
  camera.keysDown = [83];
  camera.keysLeft = [65];
  camera.keysRight = [68];
  camera.keysUpward = [69];
  camera.keysDownward = [81];

  scene.activeCamera = camera;
};
