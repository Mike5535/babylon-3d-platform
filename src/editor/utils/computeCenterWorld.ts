import { AbstractMesh, Vector3 } from '@babylonjs/core';

export const computeCenterWorld = (meshes: AbstractMesh[]) => {
  const real = meshes.filter((m) => m.getTotalVertices?.() > 0);
  if (real.length === 0) return Vector3.Zero();

  let min = new Vector3(Infinity, Infinity, Infinity);
  let max = new Vector3(-Infinity, -Infinity, -Infinity);

  for (const m of real) {
    m.computeWorldMatrix(true);
    const b = m.getBoundingInfo().boundingBox;
    min = Vector3.Minimize(min, b.minimumWorld);
    max = Vector3.Maximize(max, b.maximumWorld);
  }

  return min.add(max).scale(0.5);
}