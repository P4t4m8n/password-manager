import { Component, Input } from '@angular/core';
import { BackButton } from '../../components/back-button/back-button';

@Component({
  selector: 'app-header',
  imports: [BackButton],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() title: string = 'Default Title';
  @Input() locationPath?: string;
}
