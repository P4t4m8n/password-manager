import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import { MasterPasswordDialog } from '../components/master-password-dialog/master-password-dialog';

@Injectable({
  providedIn: 'root',
})
export class MasterPasswordDialogService {
  appRef = inject(ApplicationRef);
  injector = inject(EnvironmentInjector);
  async openMasterPasswordDialog(): Promise<string | null> {
    const componentRef = createComponent(MasterPasswordDialog, {
      environmentInjector: this.injector,
    });

    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    const result = await componentRef.instance.open();

    document.body.removeChild(domElem);
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();

    return result;
  }
}
