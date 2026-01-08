import { BehaviorSubject } from 'rxjs';

export class AbstractGlobalStateService<T> {
  protected state = new BehaviorSubject<T | null>(null);
  public readonly state$ = this.state.asObservable();

  protected updateState(data: T | null): void {
    this.state.next(data);
  }

  protected getState(): T | null {
    return this.state.getValue();
  }
}
