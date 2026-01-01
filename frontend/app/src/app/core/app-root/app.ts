import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from '../toast/components/toast/toast';
import { ThemeService } from '../services/theme-service';
import { MainLayout } from "../layout/main/main-root/main-layout";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, MainLayout],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  #themeSerivce = inject(ThemeService);
}
