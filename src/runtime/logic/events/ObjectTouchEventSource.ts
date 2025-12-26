import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { EventBus } from './EventBus';
import { ActionManager, ExecuteCodeAction, type Scene } from '@babylonjs/core';

export class ObjectTouchEventSource {
  constructor(
    private scene: Scene,
    private a: AbstractMesh,
    private b: AbstractMesh,
    private bus: EventBus
  ) {}

  start() {
    if (!this.a?.physicsBody || !this.b?.physicsBody) {
      return;
    }

    if (!this.a.actionManager) {
      this.a.actionManager = new ActionManager(this.scene);
    }

    this.a.actionManager.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: this.b,
        },
        () => {
          this.bus.emit('objectTouchObject', { a: this.a.id, b: this.b.id });
        }
      )
    );
  }
}
