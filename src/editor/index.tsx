import { observer } from 'mobx-react-lite';
import { EditorInterface } from './pages/EditorInterface';
import { RulesBook } from './pages/RulesBook';
import { screenStore } from './store/ScreenStore';

export const Editor = observer(() => {
  return (
    <>
      <EditorInterface
        className={screenStore.currentScreen !== 'editor' ? 'page_hidden' : ''}
      />
      {screenStore.currentScreen === 'rulesBook' && <RulesBook />}
    </>
  );
});
