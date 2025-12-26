// // для дебага
// import '@babylonjs/core/Debug/debugLayer'; // Required for access to the debugLayer property
// import '@babylonjs/inspector'; // Imports the inspector package

import { Engine } from '@babylonjs/core';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { sceneStore } from '../../store/SceneStore';
import { createCamera } from '../../utils/createCamera';
import { FileInput } from '../../components/FileInput';
import { appStore } from '../../../store/appStore';
import { useOnMount } from '../../../shared/hooks/onMount';
import { createShadows, loadScene } from '../../../shared/utils/loadeScene';
import { useOnUnMount } from '../../../shared/hooks/onUnMount';
import { indexdbStore } from '../../../store/IndexdbStore';
import {
  CHARACTER_NODE_NAME,
  SCENE_BUILD_DB_KEY
} from '../../../shared/consts';
import { ButtonPrimary } from '../../components/ButtonPrimary';
import { ToolBar } from '../../components/ToolBar';
import { ButtonSecondary } from '../../components/ButtonSecondary';
import { screenStore } from '../../store/ScreenStore';
import './index.scss';

export const EditorInterface = observer(
  ({ className }: { className: string }) => {
    const engineRef = useRef<Engine>(null);

    useOnMount(async () => {
      const canvas = document.getElementById(
        'editor-canvas'
      ) as HTMLCanvasElement;
      const engine = new Engine(canvas, true);
      engineRef.current = engine;

      const sceneGlb = await indexdbStore.get(SCENE_BUILD_DB_KEY);

      const sceneUrl = sceneGlb ? URL.createObjectURL(sceneGlb.blob) : null;

      loadScene({ engine, sceneUrl, isRightHandedSystem: true }).then(
        (scene) => {
          // scene.debugLayer.show();
          const shadowGenerator = createShadows(scene);
          sceneStore.init(scene, shadowGenerator);

          createCamera(scene, canvas);

          engine.runRenderLoop(() => scene.render());
        }
      );

      await sceneStore.loadSceneLogic();

      window.addEventListener('resize', function () {
        engine.resize();
      });
    });

    useOnUnMount(() => {
      engineRef.current?.dispose();
    });

    return (
      <div className={`editor ${className ? className : ''}`}>
        <div className="editor__topBar">
          <ButtonSecondary
            mode="save"
            className="editor__saveButton"
            onClick={() => sceneStore.saveScene()}
          />

          <div
            className={`editor__selectedMesh ${
              sceneStore.selected ? '' : 'disabled'
            }`}
          >
            {sceneStore.selected?.name ?? '-----'}
          </div>
          <ButtonSecondary
            mode="copy"
            isDisabled={
              !sceneStore.selected ||
              sceneStore.selected.name === CHARACTER_NODE_NAME
            }
            onClick={sceneStore.clone}
          />
          <ButtonSecondary
            mode="delete"
            isDisabled={
              !sceneStore.selected ||
              sceneStore.selected.name === CHARACTER_NODE_NAME
            }
            onClick={sceneStore.delete}
          />
        </div>

        <ButtonPrimary
          mode="play"
          onClick={async () => {
            await sceneStore.saveScene();
            appStore.setMode('game');
          }}
          className="editor__playButton"
        />

        <div className="editor__sideBar">
          <ToolBar setMode={(mode) => sceneStore.setGizmoMode(mode)} />

          <ButtonPrimary
            mode="add"
            onClick={() => {
              sceneStore.addCube();
            }}
          />

          <FileInput onFile={(file) => sceneStore.onInputFile(file)} />

          <ButtonPrimary
            mode="download"
            onClick={() => {
              sceneStore.download();
            }}
          />

          <ButtonPrimary
            mode="rulesBook"
            onClick={() => {
              screenStore.setCurrentScreen('rulesBook');
            }}
          />
        </div>
      </div>
    );
  }
);
