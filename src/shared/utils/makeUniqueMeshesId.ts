import { Mesh, type AbstractMesh } from '@babylonjs/core';

export const makeUniqueMeshesId = (mesh: any) => {
  mesh.id = mesh.id + Date.now();
  mesh.name = mesh.name + Date.now();
  const childrenMeshs = mesh.getChildMeshes();
  if (!childrenMeshs) return;

  (childrenMeshs as AbstractMesh[]).forEach((mesh) => {
    mesh.id = mesh.id + Date.now();
    mesh.name = mesh.name + Date.now();
    makeUniqueMeshesId(mesh);
  });
};

export const getAllMeshesId = (mesh: any) => {
  const meshsId: string[] = [];
  if (mesh instanceof Mesh) {
    meshsId.push(mesh.id);
  }
  const childrenMeshs = mesh.getChildMeshes();
  if (!childrenMeshs) return meshsId;

  (childrenMeshs as AbstractMesh[]).forEach((mesh) => {
    meshsId.push(mesh.id);
    getAllMeshesId(mesh);
  });

  return meshsId;
};
