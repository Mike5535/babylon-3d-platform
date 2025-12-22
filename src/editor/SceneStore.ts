import { makeAutoObservable } from 'mobx';
import { Scene, Node } from '@babylonjs/core';

class SceneStore {
  scene: Scene | null = null;
  selected: Node | null = null;
  meta = new Map<string, any>();

  constructor() {
    makeAutoObservable(this);
  }

  setScene(scene: Scene) {
    this.scene = scene;
  }

  select(node: Node | null) {
    this.selected = node;
  }
}

export const sceneStore = new SceneStore();
