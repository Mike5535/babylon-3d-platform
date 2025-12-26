import { observer } from 'mobx-react-lite';
import { Editor } from './editor';
import { Runtime } from './runtime';
import { appStore } from './store/appStore';

export default observer(function App() {
  return <>{appStore.mode === 'editor' ? <Editor /> : <Runtime />}</>;
});
