import { EventBus } from '../events/EventBus';

export class ObjectTouchObjectCondition {
  private handler: any;

  constructor(
    private bus: EventBus,
    private aId: string,
    private bId: string,
    private action: { execute(): void }
  ) {}

  init() {
    this.handler = (e: { a: string; b: string }) => {
      const match =
        (e.a === this.aId && e.b === this.bId) ||
        (e.a === this.bId && e.b === this.aId);

      if (match) {
        this.action.execute();
      }
    };

    this.bus.on('objectTouchObject', this.handler);
  }

  dispose() {
    this.bus.off('objectTouchObject', this.handler);
  }
}
