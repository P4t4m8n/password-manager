import {
  ApplicationRef,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  inject,
  Type,
} from '@angular/core';

import { AbstractDialog } from './dialog.abstract';

export abstract class AbstractDialogService<
  ReturnType,
  Component extends AbstractDialog<ReturnType> & object
> {
  #appRef = inject(ApplicationRef);
  #injector = inject(EnvironmentInjector);

  protected abstract componentType: Type<Component>;

  async openDialog(
    props?: Partial<Component>,
    containerRef?: ElementRef | null
  ): Promise<ReturnType> {
    const componentRef = createComponent(this.componentType, {
      environmentInjector: this.#injector,
    });

    if (props) {
      Object.assign(componentRef.instance, props);
    }

    this.#appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    const container =
      containerRef?.nativeElement ?? this.#appRef.components[0].location.nativeElement;
    container.appendChild(domElem);

    const result = await componentRef.instance.open();

    container.removeChild(domElem);
    this.#appRef.detachView(componentRef.hostView);
    componentRef.destroy();

    return result;
  }
}
