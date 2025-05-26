import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;
  private userId: number | null = null;

  constructor() {}

  login(id: number) {
    this.loggedIn = true;
    this.userId = id;
    sessionStorage.setItem('userId', id.toString());
    sessionStorage.setItem('loggedIn', 'true');
  }

  logout() {
    this.loggedIn = false;
    this.userId = null;
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('loggedIn');
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('loggedIn') === 'true';
  }

  getUserId(): number | null {
    const id = sessionStorage.getItem('userId');
    return id ? Number(id) : null;
  }
}
