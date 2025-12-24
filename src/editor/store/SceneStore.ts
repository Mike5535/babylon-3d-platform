import { makeAutoObservable } from 'mobx';
import {
  Scene,
  Node,
  GizmoManager,
  Camera,
  Light,
  ShadowGenerator
} from '@babylonjs/core';
import { indexdbStore } from '../../store/IndexdbStore';
import { loadGlbFromInputAsEntity } from '../utils/loadGlbFromInputAsEntity';
import { GLTF2Export } from '@babylonjs/serializers';
import { getRootNode } from '../../shared/utils/getRootNode';
import { SCENE_BUILD_DB_KEY } from '../../shared/consts';

class SceneStore {
  scene: Scene | null = null;
  selected: Node | null = null;
  gizmoManager!: GizmoManager;
  sun: Light | null = null;
  shadowGenerator: ShadowGenerator | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  public init = async (scene: Scene, shadowGenerator: ShadowGenerator) => {
    await indexdbStore.init();
    this.scene = scene;
    this.shadowGenerator = shadowGenerator;
    this.sun = scene.getLightByName('Sun');
    this.gizmoManager = new GizmoManager(scene);
    this.gizmoManager.positionGizmoEnabled = true;

    scene.onPointerDown = (_, pickInfo) => {
      if (pickInfo.hit && pickInfo.pickedMesh) {
        const rootNode = getRootNode(pickInfo.pickedMesh);
        this.gizmoManager.attachToNode(rootNode);
        this.select(rootNode);
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

  public onInputFile = async (file: File) => {
    if (!this.scene) return;

    await indexdbStore.putFile(file.name, file);
    const asset = await loadGlbFromInputAsEntity(this.scene, file, file.name);

    asset.getChildMeshes().forEach((mesh) => {
      mesh.receiveShadows = true;
       this.shadowGenerator?.addShadowCaster(mesh);
    });

    this.gizmoManager.attachToNode(asset);
    this.select(asset);
  };

  public saveScene = async () => {
    if (this.scene) {
      const compressedGlbScene = await GLTF2Export.GLBAsync(
        this.scene,
        SCENE_BUILD_DB_KEY,
        {
          meshCompressionMethod: 'Draco',
          shouldExportNode: (node) => !(node instanceof Camera),
          removeNoopRootNodes: true,
        }
      );

      indexdbStore.putFile(
        SCENE_BUILD_DB_KEY,
        compressedGlbScene.files[`${SCENE_BUILD_DB_KEY}.glb`] as File
      );
    }
  };

  private select = (node: Node | null) => {
    this.selected = node;
  };
}

export const sceneStore = new SceneStore();
