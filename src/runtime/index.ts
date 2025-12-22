import { Engine } from '@babylonjs/core';
import { loadRuntimeScene } from './loadScene';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);

const scene = await loadRuntimeScene(engine);

engine.runRenderLoop(() => scene.render());
