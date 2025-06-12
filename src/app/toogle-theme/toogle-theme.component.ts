import { Component, EventEmitter, Output } from '@angular/core';
import { ToggleThemeService } from '../toggle-theme.service';

@Component({
  selector: 'app-toogle-theme',
  templateUrl: './toogle-theme.component.html',
  styleUrl: './toogle-theme.component.css',
})
export class ToggleThemeComponent {
  currentTheme: string | null = '';

  constructor(private themeService: ToggleThemeService) {
    this.themeService.applyPreferredTheme();
    this.themeService.onThemeChange$.subscribe((theme) => {
      this.currentTheme = theme;
    });
  }

  ngOnInit() {
    this.currentTheme = localStorage.getItem('Theme');
  }

 
  getActiveIcon(): string {
    const actualTheme = this.currentTheme;
    if (!actualTheme) {
      this.currentTheme=this.themeService.getSystemPreference();
    }


    return actualTheme === 'dark'
      ? 'bi-moon-fill text-light'
      : 'bi-brightness-high-fill text-dark';
  }

  changeTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.themeService.setCurrentTheme(newTheme);
    localStorage.setItem('Theme', newTheme);
    this.currentTheme = newTheme;
  }
}
