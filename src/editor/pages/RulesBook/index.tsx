import './index.scss';
import { useEffect, useState } from 'react';
import { ButtonSecondary } from '../../components/ButtonSecondary';
import { screenStore } from '../../store/ScreenStore';
import { ObjectList } from './components/ObjectList';
import { sceneStore } from '../../store/SceneStore';
import { CHARACTER_NODE_NAME } from '../../../shared/consts';
import type { Rules } from './types';

const CONDITIONS_TYPES: { [key: string]: string } = {
  objectTouchObject: 'Когда объект касается объекта',
};

const ACTIONS_TYPES: { [key: string]: string } = {
  show: 'Показать',
  hide: 'Спрятать',
};

export const RulesBook = () => {
  const [rules, setRules] = useState<Rules>(
    JSON.parse(JSON.stringify(sceneStore.sceneLogic?.logic)) || []
  );
  const [openConditionFor, setOpenConditionFor] = useState<number | null>(null);

  const [openActionFor, setOpenActionFor] = useState<number | null>(null);

  const addRule = () => {
    setRules([...rules, {}]);
  };

  const updateRuleConditionType = (
    ruleKey: number,
    conditionalTypeKey: string
  ) => {
    const copiedRules = JSON.parse(JSON.stringify(rules));
    copiedRules[ruleKey].condition = { type: conditionalTypeKey };
    setRules(copiedRules);
  };

  const updateRuleActionType = (ruleKey: number, actionTypeKey: string) => {
    const copiedRules = JSON.parse(JSON.stringify(rules));
    copiedRules[ruleKey].action = { action_type: actionTypeKey };
    setRules(copiedRules);
  };

  const updateRuleConditionParams = (
    meshId: string | number,
    ruleKey: number
  ) => {
    const copiedRules = JSON.parse(JSON.stringify(rules));
    if (!copiedRules[ruleKey].condition.params) {
      copiedRules[ruleKey].condition.params = [{ node_id: meshId }];
    } else {
      copiedRules[ruleKey].condition.params.push({ node_id: meshId });
    }

    setRules(copiedRules);
  };

  const updateRuleActionParams = (meshId: string | number, ruleKey: number) => {
    const copiedRules = JSON.parse(JSON.stringify(rules));
    if (!copiedRules[ruleKey].action.action_params) {
      copiedRules[ruleKey].action.action_params = { node_id: meshId };
    } else {
      copiedRules[ruleKey].action.action_params.node_id = meshId;
    }

    setRules(copiedRules);
  };

  const deleteRule = (ruleKey: number) => {
    const copiedRules = JSON.parse(JSON.stringify(rules)) as Rules;
    copiedRules.splice(ruleKey, 1);
    setRules(copiedRules);
  };

  const onPagePointerDown = () => {
    setOpenConditionFor(null);
    setOpenActionFor(null);
  };

  useEffect(() => {
    sceneStore.setSceneLogicFromRules(rules);
  }, [rules]);

  const sceneMeshes = sceneStore.scene?.meshes.map((mesh) => {
    return {
      id: mesh.id,
      label: mesh.name,
      icon:
        mesh.name === CHARACTER_NODE_NAME ? (
          <span>🏃‍♂️</span>
        ) : (
          <span style={{ color: 'green' }}>■</span>
        ),
    };
  });

  return (
    <div className="rulebook" onPointerDown={onPagePointerDown}>
      <ButtonSecondary
        mode="back"
        className="backButton"
        onClick={async () => {
          screenStore.setCurrentScreen('editor');
        }}
      />

      <h1 className="title">Книга Правил</h1>

      <div className="ruleWrapper">
        {rules.map((rule, key) => (
          <div key={key} className="rule">
            <div className="ruleContent">
              {
                <div
                  className="condition"
                  onPointerDown={(e) => {
                    setOpenConditionFor(key);
                    setOpenActionFor(null);
                    e.stopPropagation();
                  }}
                >
                  {rule.condition?.type ? (
                    rule.condition?.type ===
                    Object.keys(CONDITIONS_TYPES)[0] ? (
                      <div>
                        Когда{' '}
                        <ObjectList
                          onSelect={(meshId: string | number) =>
                            updateRuleConditionParams(meshId, key)
                          }
                          title="Объект"
                          items={sceneMeshes}
                          selectedMeshId={
                            rule.condition?.params?.length === 2
                              ? rule.condition.params[0].node_id
                              : null
                          }
                        />
                        касается{' '}
                        <ObjectList
                          onSelect={(meshId: string | number) =>
                            updateRuleConditionParams(meshId, key)
                          }
                          title="Объект"
                          items={sceneMeshes}
                          selectedMeshId={
                            rule.condition?.params?.length === 2
                              ? rule.condition.params[1].node_id
                              : null
                          }
                        />
                      </div>
                    ) : (
                      ''
                    )
                  ) : (
                    '+ Условие'
                  )}
                </div>
              }

              {openConditionFor === key && (
                <div className="condition-menu">
                  {Object.entries(CONDITIONS_TYPES).map(
                    ([conditionalTypeKey, condition], conditionNumber) => (
                      <div
                        key={conditionNumber}
                        onPointerDown={() =>
                          updateRuleConditionType(key, conditionalTypeKey)
                        }
                        className="menu-item"
                      >
                        {condition}
                      </div>
                    )
                  )}
                </div>
              )}

              <div
                className="action"
                onPointerDown={(e) => {
                  setOpenActionFor(key);
                  setOpenConditionFor(null);
                  e.stopPropagation();
                }}
              >
                {rule.action?.action_type ? (
                  rule.action?.action_type === Object.keys(ACTIONS_TYPES)[0] ? (
                    <div>
                      Показать{' '}
                      <ObjectList
                        onSelect={(meshId: string | number) =>
                          updateRuleActionParams(meshId, key)
                        }
                        selectedMeshId={rule.action?.action_params?.node_id}
                        title="Объект"
                        items={sceneMeshes}
                      />
                    </div>
                  ) : rule.action?.action_type ===
                    Object.keys(ACTIONS_TYPES)[1] ? (
                    <div>
                      Скрыть{' '}
                      <ObjectList
                        onSelect={(meshId: string | number) =>
                          updateRuleActionParams(meshId, key)
                        }
                        selectedMeshId={rule.action?.action_params?.node_id}
                        title="Объект"
                        items={sceneMeshes}
                      />
                    </div>
                  ) : (
                    ''
                  )
                ) : (
                  '+ Действие'
                )}
              </div>

              {openActionFor === key && (
                <div className="action-menu">
                  {Object.entries(ACTIONS_TYPES).map(
                    ([actionTypeKey, action], actionTypeNumber) => (
                      <div
                        key={actionTypeNumber}
                        onPointerDown={() =>
                          updateRuleActionType(key, actionTypeKey)
                        }
                        className="menu-item"
                      >
                        {action}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="ruleDeleteButton" onClick={() => deleteRule(key)} />
          </div>
        ))}

        <button className="add-rule" onClick={addRule}>
          + Правило
        </button>
      </div>
    </div>
  );
};
