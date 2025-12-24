import { makeAutoObservable } from 'mobx';

type AppMode = 'editor' | 'game';

class AppStore {
  private _mode: AppMode = 'editor';

  constructor() {
    makeAutoObservable(this);
  }

  public get mode() {
    return this._mode;
  }

  public setMode(mode: AppMode) {
    this._mode = mode;
  }
}

export const appStore = new AppStore();
