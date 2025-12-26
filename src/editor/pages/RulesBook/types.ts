export type Rules = {
  condition?: { type: string; params: { node_id: string }[] };
  action?: { action_type: string; action_params: { node_id: string } };
}[];