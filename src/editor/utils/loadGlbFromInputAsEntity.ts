import { TransformNode, LoadAssetContainerAsync, Scene, Quaternion } from '@babylonjs/core';
import { computeCenterWorld } from './computeCenterWorld';

export const loadGlbFromInputAsEntity = async(
  scene: Scene,
  file: File,
  entityId: string
): Promise<TransformNode> => {
  const container = await LoadAssetContainerAsync(file, scene);
  container.addAllToScene();

  const modelRoot = (container.rootNodes[0] as TransformNode);

  const centerWorld = computeCenterWorld(container.meshes);

  const entity = new TransformNode(entityId, scene);

  entity.setAbsolutePosition(centerWorld);
  entity.rotationQuaternion = Quaternion.Identity();

  modelRoot.setParent(entity);

  return entity;
}

