import { AbstractMesh } from '@babylonjs/core';
import { EventBus } from '../events/EventBus';
import { ObjectTouchObjectCondition } from './ObjectTouchObjectCondition';
import { ActionFactory } from '../actions/ActionFactory';

export class ConditionFactory {
  static create(data: any, bus: EventBus, nodes: Map<string, AbstractMesh>) {
    const action = ActionFactory.create(
      data.action.action_type,
      data.action.action_params,
      nodes
    );

    switch (data.condition.type) {
      case 'objectTouchObject':
        return new ObjectTouchObjectCondition(
          bus,
          data.condition.params[0].node_id,
          data.condition.params[1].node_id,
          action
        );
      default:
        throw new Error('Unknown condition');
    }
  }
}
