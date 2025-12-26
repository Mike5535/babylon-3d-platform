import { AbstractMesh } from '@babylonjs/core';

export class HideAction {
  constructor(private mesh: AbstractMesh) {}

  execute() {
    this.mesh.isVisible = false;
  }
}
