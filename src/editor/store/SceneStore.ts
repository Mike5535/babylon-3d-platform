import { makeAutoObservable } from 'mobx';
import { saveAs } from 'file-saver';
import {
  Scene,
  Node,
  GizmoManager,
  Camera,
  Light,
  ShadowGenerator,
  AbstractMesh,
  TransformNode,
  Vector3,
  MeshBuilder,
} from '@babylonjs/core';
import { indexdbStore } from '../../store/IndexdbStore';
import { loadGlbFromInputAsEntity } from '../utils/loadGlbFromInputAsEntity';
import { GLTF2Export } from '@babylonjs/serializers';
import { getRootNode } from '../../shared/utils/getRootNode';
import {
  CHARACTER_NODE_NAME,
  SCENE_BUILD_DB_KEY,
  SCENE_LOGIC_KEY,
} from '../../shared/consts';
import type { Rules } from '../pages/RulesBook/types';
import {
  getAllMeshesId,
  makeUniqueMeshesId,
} from '../../shared/utils/makeUniqueMeshesId';
import { filterWithParents } from '../utils/deepFilter';

class SceneStore {
  scene: Scene | null = null;
  sceneLogic: { logic: Rules; version: number } | null = null;
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
        if (this.isGizmoReset) {
          this.setGizmoMode('position');
        }
      } else {
        this.gizmoManager.attachToMesh(null);
        this.select(null);
      }
    };
  };

  public setSceneLogicFromRules = (rules: Rules) => {
    if (!this.sceneLogic) return;
    this.sceneLogic.logic = JSON.parse(JSON.stringify(rules));
  };

  public loadSceneLogic = async () => {
    const sceneLogicString = localStorage.getItem(SCENE_LOGIC_KEY);

    if (sceneLogicString) {
      this.sceneLogic = JSON.parse(sceneLogicString) as any;
    } else {
      const sceneLogicJson = await (
        await fetch('scenes/scene-logic.json')
      ).json();

      this.sceneLogic = sceneLogicJson;
    }
  };

  public setGizmoMode = (mode: 'position' | 'rotation' | 'scale') => {
    this.resetGizmo();

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

      if (this.sceneLogic) {
        localStorage.setItem(SCENE_LOGIC_KEY, JSON.stringify(this.sceneLogic));
      }
    }
  };

  public delete = () => {
    if (!this.selected || this.selected.name === CHARACTER_NODE_NAME) return;
    this.resetGizmo();
    const selectedRoot = getRootNode(this.selected as AbstractMesh);
    const selectedRootMeshsIds = getAllMeshesId(selectedRoot);

    if (this.sceneLogic) {
      this.sceneLogic.logic = filterWithParents(
        this.sceneLogic?.logic,
        selectedRootMeshsIds
      );
    }

    selectedRoot.dispose();
    this.selected = null;
  };

  public clone = () => {
    if (!this.selected || this.selected.name === CHARACTER_NODE_NAME) return;
    const selectedRoot = getRootNode(this.selected as AbstractMesh);
    const clone = selectedRoot.clone(selectedRoot.name, null) as TransformNode;
    clone.position = clone.position.add(new Vector3(0.1, 0, 0));
    makeUniqueMeshesId(clone);
    this.select(clone);
    this.gizmoManager.attachToNode(clone);
  };

  public addCube = () => {
    const cube = MeshBuilder.CreateBox('cube', { size: 0.5 }, this.scene);
    cube.position = new Vector3(0, 0, 0);
    makeUniqueMeshesId(cube);
    this.select(cube);
    this.gizmoManager.attachToNode(cube);
  };

  public download = () => {
    if (!this.scene) return;
    GLTF2Export.GLBAsync(this.scene, SCENE_BUILD_DB_KEY, {
      meshCompressionMethod: 'Draco',
      shouldExportNode: (node) => !(node instanceof Camera),
      removeNoopRootNodes: true,
    }).then((glb) => {
      glb.downloadFiles();
    });

    const sceneLogicString = localStorage.getItem(SCENE_LOGIC_KEY);

    if (sceneLogicString) {
      const blob = new Blob([sceneLogicString], {
        type: 'application/json',
      });
      saveAs(blob, 'data.json');
    }
  };

  private resetGizmo = () => {
    this.gizmoManager.positionGizmoEnabled = false;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;
  };

  private select = (node: Node | null) => {
    this.selected = node;
  };

  get isGizmoReset() {
    return (
      !this.gizmoManager.positionGizmoEnabled &&
      !this.gizmoManager.positionGizmoEnabled &&
      !this.gizmoManager.scaleGizmoEnabled
    );
  }
}

export const sceneStore = new SceneStore();
