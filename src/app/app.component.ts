import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  menuItems: MenuItem[] = [];

ngOnInit() {
  this.menuItems = [
       {
      label: 'Home',
      routerLink: '/main-page'
    },
    {
      label: 'Movies',
      routerLink: '/movies'
    },
    {
      label: 'TV Shows',
      routerLink: '/tv-shows'
    }
  ];
}

  title = 'MovieProject';
}
