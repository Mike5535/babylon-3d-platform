import {
  TransformNode,
  LoadAssetContainerAsync,
  Scene,
  Quaternion,
  AbstractMesh,
} from '@babylonjs/core';
import { computeCenterWorld } from './computeCenterWorld';
import { makeUniqueMeshesId } from '../../shared/utils/makeUniqueMeshesId';

export const loadGlbFromInputAsEntity = async (
  scene: Scene,
  file: File,
  entityId: string
): Promise<TransformNode> => {
  const container = await LoadAssetContainerAsync(file, scene);
  container.addAllToScene();

  const modelRoot = container.rootNodes[0] as TransformNode;

  makeUniqueMeshesId(modelRoot);

  const centerWorld = computeCenterWorld(container.meshes);

  const entity = new TransformNode(entityId, scene);

  entity.setAbsolutePosition(centerWorld);
  entity.rotationQuaternion = Quaternion.Identity();

  modelRoot.getChildren().forEach((mesh) => {
    mesh.parent = entity;
    mesh.id = mesh.id + Date.now();
  });

  modelRoot.dispose();

  return entity;
};
