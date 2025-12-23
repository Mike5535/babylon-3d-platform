import { makeAutoObservable } from 'mobx';
import { Scene, Node, GizmoManager } from '@babylonjs/core';

class SceneStore {
  scene: Scene | null = null;
  selected: Node | null = null;
  gizmoManager!: GizmoManager;
  meta = new Map<string, any>();

  constructor() {
    makeAutoObservable(this);
  }

  public init = (scene: Scene) => {
    this.scene = scene;

    this.gizmoManager = new GizmoManager(scene);
    this.gizmoManager.positionGizmoEnabled = true;

    scene.onPointerDown = (_, pickInfo) => {
      if (pickInfo.hit && pickInfo.pickedMesh) {
        this.gizmoManager.attachToMesh(pickInfo.pickedMesh);
        this.select(pickInfo.pickedMesh);
      } else {
        this.gizmoManager.attachToMesh(null);
        this.select(null);
      }
    };
  };

  public setGizmoMode = (mode: 'position' | 'rotation' | 'scale') => {
    this.gizmoManager.positionGizmoEnabled = false;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;

    switch (mode) {
      case 'position':
        this.gizmoManager.positionGizmoEnabled = true;
        break;
      case 'rotation':
        this.gizmoManager.rotationGizmoEnabled = true;
        break;
      case 'scale':
        this.gizmoManager.scaleGizmoEnabled = true;
        break;
    }
  };

  private select = (node: Node | null) => {
    this.selected = node;
  };
}

export const sceneStore = new SceneStore();
