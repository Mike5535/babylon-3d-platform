import {
  CharacterSupportedState,
  FreeCamera,
  KeyboardEventTypes,
  Mesh,
  PhysicsCharacterController,
  PointerEventTypes,
  Quaternion,
  Vector3,
  type CharacterSurfaceInfo,
  type Scene,
} from '@babylonjs/core';

export const initCharacterController = (
  scene: Scene,
  characterMesh: Mesh,
  sizes: { height: number; radius: number }
) => {
  // This creates and positions a free camera (non-mesh)
  const camera = new FreeCamera('camera1', new Vector3(0, 5, -5), scene);
  scene.activeCamera = camera;

  // Player/Character state
  let state = 'IN_AIR';
  const inAirSpeed = 8.0;
  const onGroundSpeed = 10.0;
  const jumpHeight = 1.5;
  let wantJump = false;
  const inputDirection = new Vector3(0, 0, 0);
  const forwardLocalSpace = new Vector3(0, 0, 1);
  let characterOrientation = Quaternion.Identity();
  let characterGravity = new Vector3(0, -18, 0);

  const characterPosition = characterMesh.getAbsolutePosition().clone();
  characterPosition.z = characterPosition.z + 1;
  let characterController = new PhysicsCharacterController(
    characterPosition,
    { capsuleHeight: sizes.height, capsuleRadius: sizes.radius },
    scene
  );

  camera.setTarget(characterPosition);

  // State handling
  // depending on character state and support, set the new state
  const getNextState = function (supportInfo: CharacterSurfaceInfo) {
    if (state == 'IN_AIR') {
      if (supportInfo.supportedState == CharacterSupportedState.SUPPORTED) {
        return 'ON_GROUND';
      }
      return 'IN_AIR';
    } else if (state == 'ON_GROUND') {
      if (supportInfo.supportedState != CharacterSupportedState.SUPPORTED) {
        return 'IN_AIR';
      }

      if (wantJump) {
        return 'START_JUMP';
      }
      return 'ON_GROUND';
    } else if (state == 'START_JUMP') {
      return 'IN_AIR';
    }
  };

  // From aiming direction and state, compute a desired velocity
  // That velocity depends on current state (in air, on ground, jumping, ...) and surface properties
  const getDesiredVelocity = function (
    deltaTime: number,
    supportInfo: CharacterSurfaceInfo,
    characterOrientation: Quaternion,
    currentVelocity: Vector3
  ) {
    let nextState = getNextState(supportInfo);
    if (nextState != state) {
      state = nextState || '';
    }

    let upWorld = characterGravity.normalizeToNew();
    upWorld.scaleInPlace(-1.0);
    let forwardWorld =
      forwardLocalSpace.applyRotationQuaternion(characterOrientation);
    if (state == 'IN_AIR') {
      let desiredVelocity = inputDirection
        .scale(inAirSpeed)
        .applyRotationQuaternion(characterOrientation);
      let outputVelocity = characterController.calculateMovement(
        deltaTime,
        forwardWorld,
        upWorld,
        currentVelocity,
        Vector3.ZeroReadOnly,
        desiredVelocity,
        upWorld
      );
      // Restore to original vertical component
      outputVelocity.addInPlace(upWorld.scale(-outputVelocity.dot(upWorld)));
      outputVelocity.addInPlace(upWorld.scale(currentVelocity.dot(upWorld)));
      // Add gravity
      outputVelocity.addInPlace(characterGravity.scale(deltaTime));
      return outputVelocity;
    } else if (state == 'ON_GROUND') {
      // Move character relative to the surface we're standing on
      // Correct input velocity to apply instantly any changes in the velocity of the standing surface and this way
      // avoid artifacts caused by filtering of the output velocity when standing on moving objects.
      let desiredVelocity = inputDirection
        .scale(onGroundSpeed)
        .applyRotationQuaternion(characterOrientation);

      let outputVelocity = characterController.calculateMovement(
        deltaTime,
        forwardWorld,
        supportInfo.averageSurfaceNormal,
        currentVelocity,
        supportInfo.averageSurfaceVelocity,
        desiredVelocity,
        upWorld
      );
      // Horizontal projection
      {
        outputVelocity.subtractInPlace(supportInfo.averageSurfaceVelocity);
        let inv1k = 1e-3;
        if (outputVelocity.dot(upWorld) > inv1k) {
          let velLen = outputVelocity.length();
          outputVelocity.normalizeFromLength(velLen);

          // Get the desired length in the horizontal direction
          let horizLen = velLen / supportInfo.averageSurfaceNormal.dot(upWorld);

          // Re project the velocity onto the horizontal plane
          let c = supportInfo.averageSurfaceNormal.cross(outputVelocity);
          outputVelocity = c.cross(upWorld);
          outputVelocity.scaleInPlace(horizLen);
        }
        outputVelocity.addInPlace(supportInfo.averageSurfaceVelocity);
        return outputVelocity;
      }
    } else if (state == 'START_JUMP') {
      let u = Math.sqrt(2 * characterGravity.length() * jumpHeight);
      let curRelVel = currentVelocity.dot(upWorld);
      return currentVelocity.add(upWorld.scale(u - curRelVel));
    }
    return Vector3.Zero();
  };

  // Display tick update: compute new camera position/target, update the capsule for the character display
  scene.onBeforeRenderObservable.add((scene) => {
    characterMesh.position.copyFrom(characterController.getPosition());

    // camera following
    const cameraDirection = camera.getDirection(new Vector3(0, 0, 1));
    cameraDirection.y = 0;
    cameraDirection.normalize();
    camera.setTarget(
      Vector3.Lerp(camera.getTarget(), characterMesh.position, 0.1)
    );
    const dist = Vector3.Distance(camera.position, characterMesh.position);
    const amount = (Math.min(dist - 6, 0) + Math.max(dist - 9, 0)) * 0.04;
    cameraDirection.scaleAndAddToRef(amount, camera.position);
    camera.position.y +=
      (characterMesh.position.y + 2 - camera.position.y) * 0.04;
  });

  // After physics update, compute and set new velocity, update the character controller state
  scene.onAfterPhysicsObservable.add((_) => {
    if (scene.deltaTime == undefined) return;
    let dt = scene.deltaTime / 1000.0;
    if (dt == 0) return;

    let down = new Vector3(0, -1, 0);
    let support = characterController.checkSupport(dt, down);

    Quaternion.FromEulerAnglesToRef(
      0,
      camera.rotation.y,
      0,
      characterOrientation
    );
    let desiredLinearVelocity = getDesiredVelocity(
      dt,
      support,
      characterOrientation,
      characterController.getVelocity()
    );
    characterController.setVelocity(desiredLinearVelocity);

    characterController.integrate(dt, support, characterGravity);
  });

  // Rotate camera
  // Add a slide vector to rotate arount the character
  let isMouseDown = false;
  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        isMouseDown = true;
        break;

      case PointerEventTypes.POINTERUP:
        isMouseDown = false;
        break;

      case PointerEventTypes.POINTERMOVE:
        if (isMouseDown) {
          const tgt = camera.getTarget().clone();
          camera.position.addInPlace(
            camera
              .getDirection(Vector3.Right())
              .scale(pointerInfo.event.movementX * -0.02)
          );
          camera.setTarget(tgt);
        }
        break;
    }
  });
  // Input to direction
  // from keys down/up, update the Vector3 inputDirection to match the intended direction. Jump with space
  scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
      case KeyboardEventTypes.KEYDOWN:
        if (
          kbInfo.event.key == 'w' ||
          kbInfo.event.key == 'ц' ||
          kbInfo.event.key == 'ArrowUp'
        ) {
          inputDirection.z = 1;
        } else if (
          kbInfo.event.key == 's' ||
          kbInfo.event.key == 'ы' ||
          kbInfo.event.key == 'ArrowDown'
        ) {
          inputDirection.z = -1;
        } else if (
          kbInfo.event.key == 'a' ||
          kbInfo.event.key == 'ф' ||
          kbInfo.event.key == 'ArrowLeft'
        ) {
          inputDirection.x = -1;
        } else if (
          kbInfo.event.key == 'd' ||
          kbInfo.event.key == 'в' ||
          kbInfo.event.key == 'ArrowRight'
        ) {
          inputDirection.x = 1;
        } else if (kbInfo.event.key == ' ') {
          wantJump = true;
        }
        break;
      case KeyboardEventTypes.KEYUP:
        if (
          kbInfo.event.key == 'w' ||
          kbInfo.event.key == 's' ||
          kbInfo.event.key == 'ц' ||
          kbInfo.event.key == 'ы' ||
          kbInfo.event.key == 'ArrowUp' ||
          kbInfo.event.key == 'ArrowDown'
        ) {
          inputDirection.z = 0;
        }
        if (
          kbInfo.event.key == 'a' ||
          kbInfo.event.key == 'd' ||
          kbInfo.event.key == 'ф' ||
          kbInfo.event.key == 'в' ||
          kbInfo.event.key == 'ArrowLeft' ||
          kbInfo.event.key == 'ArrowRight'
        ) {
          inputDirection.x = 0;
        } else if (kbInfo.event.key == ' ') {
          wantJump = false;
        }
        break;
    }
  });

  return { scene, characterController };
};
