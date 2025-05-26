import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  menuItems: MenuItem[] = [];
  constructor(private authService: AuthService, private router: Router) {}
ngOnInit() {
  this.menuItems = [
    {
      label: 'Home',
      routerLink: '/main-page',
      icon: 'bi bi-house-door',
    },
    {
      label: 'Movies',
      routerLink: '/movies',
      icon: 'bi bi-film',
    },
    {
      label: 'TV Shows',
      routerLink: '/tv-shows',
      icon: 'bi bi-tv',
    },
    {
      separator: true
    },
    // {
    //   label: 'Logout',
    //   icon: 'bi bi-box-arrow-right',
    //   command: () => this.logout()
    // }
  ];
}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
