import { makeAutoObservable } from 'mobx';

type SCREEN = 'editor' | 'rulesBook';

class ScreenStore {
  screen: SCREEN;

  constructor() {
    makeAutoObservable(this);

    this.screen = 'editor';
  }

  public setCurrentScreen(screen: SCREEN) {
    this.screen = screen;
  }

  public get currentScreen() {
    return this.screen;
  }
}

export const screenStore = new ScreenStore();
