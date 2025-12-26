import { Scene, AbstractMesh } from '@babylonjs/core';
import { EventBus } from './events/EventBus';
import { ObjectTouchEventSource } from './events/ObjectTouchEventSource';
import { ConditionFactory } from './conditions/ConditionFactory';

export class LogicRuntime {
  private bus = new EventBus();
  private sources: any[] = [];
  private conditions: any[] = [];

  constructor(scene: Scene, json: any) {
    const nodes = new Map<string, AbstractMesh>();
    scene.meshes.forEach((m) => nodes.set(m.id, m));

    for (const block of json.logic) {
      if (block.condition.type === 'objectTouchObject') {
        const a = nodes.get(block.condition.params[0].node_id)!;
        const b = nodes.get(block.condition.params[1].node_id)!;

        const src = new ObjectTouchEventSource(scene, a, b, this.bus);
        src.start();
        this.sources.push(src);
      }
    }

    for (const block of json.logic) {
      const condition = ConditionFactory.create(block, this.bus, nodes);
      condition.init();
      this.conditions.push(condition);
    }
  }

  dispose() {
    this.sources.forEach((s) => s.dispose && s.dispose());
    this.conditions.forEach((c) => c.dispose && c.dispose());
  }
}
