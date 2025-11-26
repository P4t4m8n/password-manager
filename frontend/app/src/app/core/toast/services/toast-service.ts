import { Injectable } from '@angular/core';
import { IToastData, toastTypes } from '../interface/toastData';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  data!: IToastData;
  public open = new Subject<IToastData>();

  initiate(data: IToastData) {
    console.log('🚀 ~ ToastService ~ initiate ~ data:', data);

    this.data = { ...data, show: true, progressWidth: '100%' };
    console.log("🚀 ~ ToastService ~ initiate ~ this.data:", this.data)
    this.open.next(this.data);
  }

  hide() {
    this.data = { ...this.data, show: false };
    this.open.next(this.data);
  }
}
