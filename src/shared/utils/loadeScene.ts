import {
  Scene,
  SceneLoader,
  Engine,
  ShadowGenerator,
  type IShadowLight,
  TransformNode,
  Quaternion,
  Color4,
  HemisphericLight,
  Vector3,
  Color3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import { CHARACTER_NODE_NAME } from '../consts';

export async function loadScene({
  engine,
  sceneUrl,
  isRightHandedSystem,
}: {
  engine: Engine;
  sceneUrl: string | null;
  isRightHandedSystem?: boolean;
}) {
  const scene = new Scene(engine);

  if (isRightHandedSystem) {
    scene.useRightHandedSystem = true;
  }

  const container = await SceneLoader.LoadAssetContainerAsync(
    sceneUrl ? sceneUrl : '/scenes/',
    sceneUrl ? '' : 'scene.glb',
    scene,
    null,
    '.glb'
  );
  container.addAllToScene();

  scene.transformNodes.forEach((mesh) => {
    mesh.setParent(null);
  });

  scene.meshes.forEach((mesh) => {
    if (mesh.name !== CHARACTER_NODE_NAME) {
      const entity = new TransformNode(mesh.id, scene);

      const bounds = mesh.getHierarchyBoundingVectors();
      const min = bounds.min;
      const max = bounds.max;
      const center = min.add(max).scale(0.5);

      entity.setAbsolutePosition(center);
      entity.rotationQuaternion = Quaternion.Identity();

      mesh.setParent(entity);
    } else {
      mesh.setParent(null);
    }
  });

  const nodesToRemove = scene
    .getNodes()
    .filter((node) => node.id === '__root__');

  nodesToRemove.forEach((node) => node.dispose());

  scene.clearColor = new Color4(0.49, 0.78, 0.99, 1);

  return scene;
}

export const createShadows = (scene: Scene) => {
  scene.transformNodes.forEach((mesh) => {
    if (mesh.getChildren().length === 0) {
      mesh.dispose();
    }
  });

  const sun = scene.getLightByName('Sun');
  const hemiLight = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.2;
  hemiLight.groundColor = new Color3(0.49, 0.78, 0.99);

  const shadowGenerator = new ShadowGenerator(1024, sun as IShadowLight);
  shadowGenerator.usePercentageCloserFiltering = true;
  shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
  shadowGenerator.setDarkness(0.2);

  scene.meshes.forEach((mesh) => {
    mesh.receiveShadows = true;
    shadowGenerator.addShadowCaster(mesh);
  });
  return shadowGenerator;
};
