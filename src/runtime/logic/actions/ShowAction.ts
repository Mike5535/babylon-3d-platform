import { AbstractMesh } from '@babylonjs/core';

export class ShowAction {
  constructor(private mesh: AbstractMesh) {}

  execute() {
    this.mesh.isVisible = true;
  }
}
