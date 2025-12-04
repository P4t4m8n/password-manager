import { ApplicationRef, createComponent, EnvironmentInjector, inject, Type } from '@angular/core';

import { AbstractDialog } from './dialog.abstract';

export abstract class AbstractDialogService<
  ReturnType,
  Component extends AbstractDialog<ReturnType> & object
> {
  appRef = inject(ApplicationRef);
  injector = inject(EnvironmentInjector);
  protected abstract componentType: Type<Component>;

  async openDialog(): Promise<ReturnType> {
    const componentRef = createComponent(this.componentType, {
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

  async openDialogWithProps(props: Partial<Component>): Promise<ReturnType> {
    const componentRef = createComponent(this.componentType, {
      environmentInjector: this.injector,
    });

    Object.assign(componentRef.instance, props);

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
