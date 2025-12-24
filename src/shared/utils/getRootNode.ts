import type { AbstractMesh, Node } from "@babylonjs/core";

export const getRootNode = (mesh: AbstractMesh) => {
  let root: Node = mesh;
  while (root.parent !== null) {
    root = root.parent;
  }
  return root;
};
