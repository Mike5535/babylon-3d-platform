import { Scene, SceneLoader, Engine } from '@babylonjs/core';
import '@babylonjs/loaders';

export async function loadEditorScene(
  engine: Engine,
  canvas: HTMLCanvasElement
) {
  const scene = new Scene(engine);

  await SceneLoader.AppendAsync('/scenes/', 'scene.babylon', scene);

  return scene;
}

export async function loadRuntimeScene(engine: Engine) {
  const scene = new Scene(engine);

  await SceneLoader.AppendAsync('', 'scene.babylon', scene);

  return scene;
}
