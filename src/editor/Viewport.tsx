import { useEffect, useRef } from 'react';
import { Engine } from '@babylonjs/core';
import "@babylonjs/core/Debug/debugLayer"; 
import "@babylonjs/inspector";
import { observer } from 'mobx-react-lite';
import { sceneStore } from './SceneStore';
import { loadEditorScene } from '../runtime/loadScene';

export const Viewport = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const engine = new Engine(canvas, true);

    loadEditorScene(engine, canvas).then((scene) => {
      sceneStore.setScene(scene);
      scene.debugLayer.show();

      scene.onPointerObservable.add((info) => {
        if (info.pickInfo?.pickedMesh) {
          sceneStore.select(info.pickInfo.pickedMesh);
        }
      });

      engine.runRenderLoop(() => scene.render());
    });

    return () => engine.dispose();
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
});
