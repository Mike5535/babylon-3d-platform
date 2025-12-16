import * as BABYLON from 'babylonjs';
import { EditControl } from 'babylonjs-editcontrol';

window.onload = function () {
  main();
};

const main = function () {
  const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
    document.getElementById('renderCanvas')
  );
  const engine = new BABYLON.Engine(canvas, true);
  const scene = addScene(engine);
  const camera = addCamera(scene, canvas);
  const grid = addGrid(scene);
  const box = addBox(scene);
  for (let i = 0; i < 5; i++) {
    addBox(scene);
  }
  const editControl = addEditControl(box, camera, canvas);

  setButtons(editControl);

  scene.onPointerDown = (evt, pickInfo) => {
    if (pickInfo.hit && pickInfo.pickedMesh && pickInfo.pickedMesh !== grid) {
      const clickedMesh = pickInfo.pickedMesh;


      pickInfo.pickedMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
      editControl.switchTo(clickedMesh);
    }
  };

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener('resize', function () {
    engine.resize();
  });
};

const addScene = function (engine) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.75, 0.75, 0.75, 1);
  const light = new BABYLON.HemisphericLight(
    'light1',
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.5;
  return scene;
};

const addCamera = function (scene, canvas) {
  const camera = new BABYLON.ArcRotateCamera(
    'ArcRotateCamera',
    Math.PI / 4,
    Math.PI / 4,
    20,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.wheelPrecision = 15;
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, false);
  return camera;
};

const addGrid = function (scene) {
  const ground = BABYLON.Mesh.CreateGround('ground1', 20, 20, 10, scene);
  const gridMaterial = new BABYLON.StandardMaterial('Grid Material', scene);
  gridMaterial.wireframe = true;
  ground.material = gridMaterial;
  return ground;
};

const addBox = function (scene) {
  const mat = new BABYLON.StandardMaterial('mat', scene);
  mat.diffuseColor = new BABYLON.Color3(1, 0, 0);

  const box = BABYLON.MeshBuilder.CreateBox('', {
    height: 5,
    width: 3,
    depth: 2,
  });
  box.material = mat;

  box.position = new BABYLON.Vector3(0, 1, 0);

  return box;
};

const addEditControl = function (mesh, camera, canvas) {
  //if we are planning on doing rotation in quaternion then make sure the rotationQuaternion is atleast initialized
  //else edit control will throw following exception
  //"Eulerian is set to false but the mesh's rotationQuaternion is not set."
  mesh.rotationQuaternion = BABYLON.Quaternion.Identity();

  //create edit control (mesh to attach to,camera, canvas, scale of editcontrol, if doing rotation in euler)
  const ec: EditControl = new EditControl(
    mesh,
    camera,
    canvas,
    0.75,
    false,
    0.02
  );

  //show translation controls
  ec.enableTranslation();

  return ec;
};

const setButtons = function (editControl) {
  const transButton = document.getElementById('trans');
  const rotButton = document.getElementById('rotate');
  const scaleButton = document.getElementById('scale');

  transButton.onclick = function () {
    editControl.enableTranslation();
  };
  rotButton.onclick = function () {
    editControl.enableRotation();
  };
  scaleButton.onclick = function () {
    editControl.enableScaling();
  };
};
