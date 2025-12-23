import { useEffect, useRef } from 'react';
import { Engine } from '@babylonjs/core';
import { observer } from 'mobx-react-lite';
import { sceneStore } from './store/SceneStore';
import { loadEditorScene } from '../runtime/loadScene';
import { createCamera } from './utils/createCamera';

export const Viewport = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const engine = new Engine(canvas, true);

    loadEditorScene(engine, canvas).then((scene) => {
      sceneStore.init(scene);

      createCamera(scene, canvas);

      engine.runRenderLoop(() => scene.render());
    });

    window.addEventListener('resize', function () {
      engine.resize();
    });

    return () => engine.dispose();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
});
