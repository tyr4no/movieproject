import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;
  private userId: number | null = null;

  constructor() {}

  login(id: number, user: any) {
    this.loggedIn = true;
    this.userId = id;
      localStorage.setItem('userId', id.toString());

      localStorage.setItem('loggedIn', 'true');
    
    localStorage.setItem('user', JSON.stringify(user));

    // 👈 store full user info
  }
  getLoggedInUser(): any {
    const userJson = sessionStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  logout() {
    this.loggedIn = false;
    this.userId = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('user'); // 👈 clear stored user
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('loggedIn') === 'true';
  }

  getUserId(): number | null {
    const id = sessionStorage.getItem('userId');
    return id ? Number(id) : null;
  }
}
