import JSZip from 'jszip';
import { sceneStore } from '../store/SceneStore';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/serializers';

export async function exportWeb() {
  const scene = sceneStore.scene;
  if (!scene) return;

  const zip = new JSZip();

  const serializedScene = await BABYLON.SceneSerializer.SerializeAsync(scene);

  // scene.babylon
  zip.file('scene.babylon', JSON.stringify(serializedScene, null, 2));

  // meta
  zip.file(
    'scene.meta.json',
    JSON.stringify(Object.fromEntries(sceneStore.meta), null, 2)
  );

  // runtime template
  for (const file of ['index.html', 'runtime.js']) {
    const res = await fetch(`/runtime-template/${file}`);
    zip.file(file, await res.text());
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  download(blob, 'scene-web.zip');
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}
