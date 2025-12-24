import { sceneStore } from '../store/SceneStore';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/serializers';
import { GLTF2Export } from '@babylonjs/serializers';
import { SCENE_BUILD_DB_KEY } from '../../shared/consts';

export async function exportWeb() {
  const scene = sceneStore.scene;
  if (!scene) return;

  GLTF2Export.GLBAsync(scene, SCENE_BUILD_DB_KEY, {
    meshCompressionMethod: 'Draco',
    shouldExportNode: (node) => !(node instanceof BABYLON.Camera),
    removeNoopRootNodes: true,
  }).then((glb) => {
    glb.downloadFiles();
  });
}
