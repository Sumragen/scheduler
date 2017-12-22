export class LoadingService {
  private _visible = false;

  public isVisible(): boolean {
    return this._visible;
  }

  show() {
    this._visible = true;
  }

  hide() {
    this._visible = false;
  }
}
