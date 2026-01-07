import { Component, Input } from '@angular/core';
import { IconOpenExternal } from "../../icons/icon-open-external/icon-open-external";

@Component({
  selector: 'app-external-link',
  imports: [IconOpenExternal],
  templateUrl: './external-link.html',
  styleUrl: './external-link.css',
})
export class ExternalLink {
  @Input({ required: true }) link!: string;
}
