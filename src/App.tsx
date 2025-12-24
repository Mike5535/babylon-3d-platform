import { observer } from 'mobx-react-lite';
import { Viewport } from './editor';
import { Runtime } from './runtime';
import { appStore } from './store';

export default observer(function App() {
  return <>{appStore.mode === 'editor' ? <Viewport /> : <Runtime />}</>;
});
