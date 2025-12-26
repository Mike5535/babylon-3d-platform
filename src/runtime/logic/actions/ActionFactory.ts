import { AbstractMesh } from "@babylonjs/core";
import { ShowAction } from "./ShowAction";
import { HideAction } from "./HideAction";

export class ActionFactory {
  static create(type: string, params: any, nodes: Map<string, AbstractMesh>) {
    const mesh = nodes.get(params.node_id);
    if (!mesh) throw new Error("Mesh not found");

    switch (type) {
      case "show":
        return new ShowAction(mesh);
      case "hide":
        return new HideAction(mesh);
      default:
        throw new Error(`Unknown action: ${type}`);
    }
  }
}