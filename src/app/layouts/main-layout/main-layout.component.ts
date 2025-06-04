import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../auth.service';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  menuItems: MenuItem[] = [];
  currentRoute: string = '';
  userId: number | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        this.updateMenuActiveState();
      }
    });
  }

  ngOnInit() {
    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      this.userId = +loggedInUserId;
    }

    this.menuItems = [
      {
        label: 'Home',
        routerLink: '/home',
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
        separator: true,
      },
    ];

    this.updateMenuActiveState();
  }

  updateMenuActiveState() {
    this.menuItems.forEach((item) => {
      if (item.routerLink) {
        item.styleClass =
          this.currentRoute === item.routerLink ? 'active-nav-item' : '';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
