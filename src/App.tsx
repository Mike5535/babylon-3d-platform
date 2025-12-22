import { observer } from 'mobx-react-lite';
import { Viewport } from './editor/Viewport';
import { sceneStore } from './editor/SceneStore';
import { exportWeb } from './editor/exportWeb';

export default observer(function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <Viewport />
      </div>

      <div style={{ width: 280, padding: 10 }}>
        <h3>Inspector</h3>

        <div>
          Selected:
          <b>{sceneStore.selected?.name ?? '—'}</b>
        </div>

        <hr />

        <button onClick={exportWeb}>Export Web</button>
      </div>
    </div>
  );
});
