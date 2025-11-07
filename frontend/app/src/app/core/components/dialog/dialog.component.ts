import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  OnInit,
  Type,
  ComponentRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogDirective } from '../../directives/dialog.directive';
import { DialogConfig } from '../../interfaces/dialog';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, DialogDirective],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent implements OnInit {
  @Input({ required: true }) config!: DialogConfig;
  
  @ViewChild('dialogContent', { read: ViewContainerRef })
  dialogContent!: ViewContainerRef;
  
  @ViewChild(DialogDirective) dialogDirective!: DialogDirective;

  private componentRef?: ComponentRef<any>;

  ngOnInit(): void {
    this.loadComponent();
  }

  openDialog(): void {
    this.dialogDirective.open();
  }

  closeDialog(): void {
    this.dialogDirective.close();
    if (this.config.onClose) {
      this.config.onClose();
    }
  }

  handleDialogClosed(): void {
    if (this.config.onClose) {
      this.config.onClose();
    }
  }

  private loadComponent(): void {
    if (this.config.contentComponent) {
      this.dialogContent.clear();
      this.componentRef = this.dialogContent.createComponent(
        this.config.contentComponent
      );
    }
  }
}
