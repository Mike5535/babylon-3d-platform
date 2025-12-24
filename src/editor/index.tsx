// для дебага
import '@babylonjs/core/Debug/debugLayer'; // Required for access to the debugLayer property
import '@babylonjs/inspector'; // Imports the inspector package

import { Engine } from '@babylonjs/core';
import { observer } from 'mobx-react-lite';
import { sceneStore } from './store/SceneStore';
import { createCamera } from './utils/createCamera';
import { exportWeb } from './utils/exportWeb';
import { FileInput } from './components/FileInput';
import './index.scss';
import { appStore } from '../store';
import { useOnMount } from '../shared/hooks/onMount';
import { createShadows, loadScene } from '../shared/utils/loadeScene';
import { useOnUnMount } from '../shared/hooks/onUnMount';
import { useRef } from 'react';
import { indexdbStore } from '../store/IndexdbStore';
import { SCENE_BUILD_DB_KEY } from '../shared/consts';

export const Viewport = observer(() => {
  const engineRef = useRef<Engine>(null);

  useOnMount(async () => {
    const canvas = document.getElementById(
      'editor-canvas'
    ) as HTMLCanvasElement;
    const engine = new Engine(canvas, true);
    engineRef.current = engine;

    const sceneGlb = await indexdbStore.get(SCENE_BUILD_DB_KEY);

    const sceneUrl = sceneGlb ? URL.createObjectURL(sceneGlb.blob) : null;

    loadScene({ engine, sceneUrl, isRightHandedSystem: true }).then((scene) => {
      scene.debugLayer.show();
      const shadowGenerator = createShadows(scene);
      sceneStore.init(scene, shadowGenerator);

      createCamera(scene, canvas);

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
    <div className="viewport">
      <div style={{ width: 280, padding: 10 }}>
        <h3>Inspector</h3>

        <div>
          Selected:
          <b>{sceneStore.selected?.name ?? '—'}</b>
        </div>

        <hr />

        <button onClick={exportWeb}>Export Web</button>
        <button onClick={() => sceneStore.setGizmoMode('position')}>
          Translate
        </button>
        <button onClick={() => sceneStore.setGizmoMode('rotation')}>
          Rotate
        </button>
        <button onClick={() => sceneStore.setGizmoMode('scale')}>Scale</button>
        <button onClick={() => appStore.setMode('game')}>Play</button>
        <FileInput onFile={(file) => sceneStore.onInputFile(file)} />
        <button onClick={() => sceneStore.saveScene()}>Save</button>
      </div>
    </div>
  );
});
