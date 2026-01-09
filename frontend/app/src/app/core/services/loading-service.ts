import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  protected isFetching = new BehaviorSubject<boolean>(false);
  public readonly isFetching$ = this.isFetching.asObservable();

  protected isSaving = new BehaviorSubject<boolean>(false);
  public readonly isSaving$ = this.isSaving.asObservable();

  protected isDeleteing = new BehaviorSubject<boolean>(false);
  public readonly isDeleting$ = this.isDeleteing.asObservable();

  public setFetching(isFetching: boolean): void {
    this.isFetching.next(isFetching);
  }

  public setSaving(isSaving: boolean): void {
    this.isSaving.next(isSaving);
  }

  public setDeleting(isDeleting: boolean): void {
    this.isDeleteing.next(isDeleting);
  }
}
