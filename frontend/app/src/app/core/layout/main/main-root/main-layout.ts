import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SideMenu } from '../../side-menu/components/side-menu/side-menu';
import { SwipeMenuDirective } from '../../side-menu/directives/swipe-menu-directive';
import { Header } from "../../header/header";

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SideMenu, SwipeMenuDirective],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {}
