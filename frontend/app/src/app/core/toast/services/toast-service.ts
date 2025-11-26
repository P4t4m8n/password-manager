import { Injectable } from '@angular/core';
import { IToastData, toastTypes } from '../interface/toastData';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  data: IToastData = {
    title: '',
    content: '',
    show: false,
    type: toastTypes.success,
    progressWidth: '100%',
  };
  public open = new Subject<IToastData>();

  initiate(data: IToastData) {
    this.data = { ...data, show: true, progressWidth: '100%' };
    this.open.next(this.data);
  }

  hide() {
    this.data = { ...this.data, show: false };
    this.open.next(this.data);
  }
}
