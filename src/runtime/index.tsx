// для дебага
import '@babylonjs/core/Debug/debugLayer'; // Required for access to the debugLayer property
import '@babylonjs/inspector'; // Imports the inspector package

import {
  Engine,
  HavokPlugin,
  Vector3,
  PhysicsAggregate,
  PhysicsShapeType,
  Mesh
} from '@babylonjs/core';
import './index.scss';
import { appStore } from '../store';
import HavokPhysics from '@babylonjs/havok';
import { initCharacterController } from './character';
import { useOnMount } from '../shared/hooks/onMount';
import { createShadows, loadScene } from '../shared/utils/loadeScene';
import { indexdbStore } from '../store/IndexdbStore';
import { CHARACTER_NODE_NAME, SCENE_BUILD_DB_KEY } from '../shared/consts';
import { useRef } from 'react';
import { useOnUnMount } from '../shared/hooks/onUnMount';

export const Runtime = () => {
  const engineRef = useRef<Engine>(null);

  useOnMount(async () => {
    const canvas = document.getElementById(
      'editor-canvas'
    ) as HTMLCanvasElement;
    const engine = new Engine(canvas, true);
    engineRef.current = engine;

    const sceneGlb = await indexdbStore.get(SCENE_BUILD_DB_KEY);

    const sceneUrl = sceneGlb ? URL.createObjectURL(sceneGlb.blob) : null;

    loadScene({ engine, sceneUrl }).then(async (scene) => {
      // для дебага
      // scene.debugLayer.show();

      createShadows(scene);

      const havok = await HavokPhysics({
        locateFile: (file) => {
          return 'assets/HavokPhysics.wasm';
        },
      });
      const gravityVector: Vector3 = new Vector3(0, -9.81, 0);
      const havokPlugin: HavokPlugin = new HavokPlugin(true, havok);
      scene.enablePhysics(gravityVector, havokPlugin);

      scene.meshes.forEach((mesh) => {
        if (mesh.getTotalVertices() > 0) {
          // Проверка, что это не пустой узел
          new PhysicsAggregate(
            mesh,
            PhysicsShapeType.MESH,
            { mass: mesh.name === CHARACTER_NODE_NAME ? 1 : 0 },
            scene
          );
        }
      });

      const characterMesh = scene.getMeshByName(CHARACTER_NODE_NAME);

      if (characterMesh) {
        characterMesh.physicsBody?.setMassProperties({
          inertia: new Vector3(0, 0, 0),
        });
        initCharacterController(scene, characterMesh as Mesh, {
          height: 0.55,
          radius: 0.2,
        });
      }

      engine.runRenderLoop(() => scene.render());
    });

    window.addEventListener('resize', function () {
      engine.resize();
    });
  });

  useOnUnMount(() => {
    engineRef.current?.dispose();
  });

  return (
    <button className="back-button" onClick={() => appStore.setMode('editor')}>
      Back
    </button>
  );
};
