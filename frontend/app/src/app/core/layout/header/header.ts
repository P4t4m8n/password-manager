import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BackButton } from '../../components/back-button/back-button';
import { ExtendedTitleCasePipePipe } from '../../pipes/extended-title-case-pipe-pipe';

@Component({
  selector: 'app-header',
  imports: [BackButton, ExtendedTitleCasePipePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  #router = inject(Router);

  @Input() title?: string;
  @Input() locationPath?: string;

  get currentRoute(): string {
    return this.title ? this.title : this.#router.url.split('/')[1] ?? 'Default Title';
  }
}
