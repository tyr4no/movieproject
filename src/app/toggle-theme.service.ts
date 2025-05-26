import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToggleThemeService {
  private currentTheme: string = 'dark';
  private themeChangeSubject = new Subject<string>();
 
  onThemeChange$ = this.themeChangeSubject.asObservable();

  constructor() {}

  getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  applyPreferredTheme() {
    const storedTheme = localStorage.getItem('Theme');
    if (storedTheme!== 'dark' && storedTheme !== 'light') {
      const systemTheme = this.getSystemPreference();
      this.setCurrentTheme(systemTheme);
    } else {
      this.setCurrentTheme(storedTheme);
    }
  }
  getCurrentTheme() {
    return this.currentTheme;
  }
  setCurrentTheme(theme: string): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme); // 🖤 Apply theme
    this.themeChangeSubject.next(theme);
  }
}
