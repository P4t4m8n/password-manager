import { BehaviorSubject } from 'rxjs';

export class AbstractGlobalStateService<T> {
  protected _state$ = new BehaviorSubject<T | null>(null);
  public readonly state$ = this._state$.asObservable();

  protected updateState(data: T | null): void {
    this._state$.next(data);
  }

  protected getState(): T | null {
    return this._state$.getValue();
  }
}
