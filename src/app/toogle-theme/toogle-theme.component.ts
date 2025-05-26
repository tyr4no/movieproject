import { Component, EventEmitter, Output } from '@angular/core';
import { ToggleThemeService } from '../toggle-theme.service';

@Component({
  selector: 'app-toogle-theme',
  templateUrl: './toogle-theme.component.html',
  styleUrl: './toogle-theme.component.css',
})
export class ToggleThemeComponent {
  currentTheme: string | null = '';
  @Output() theme = new EventEmitter<string>();

  constructor(private themeService: ToggleThemeService) {
    this.themeService.applyPreferredTheme();
    this.themeService.onThemeChange$.subscribe((theme) => {
      this.currentTheme = theme;
    });
  }

  ngOnInit() {
    this.currentTheme =
      localStorage.getItem('Theme');
    this.emitTheme();
  }

  emitTheme() {
    this.theme.emit(this.currentTheme as string);
  }

  getActiveIcon(): string {
    const actualTheme =
      this.currentTheme === 'system'
        ? this.themeService.getSystemPreference()
        : this.currentTheme;

    return actualTheme === 'dark'
      ? 'bi-moon-fill text-light'
      : 'bi-brightness-high-fill text-dark';
  }

  changeTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.themeService.setCurrentTheme(newTheme);
    localStorage.setItem('Theme', newTheme);
    this.currentTheme = newTheme;
    this.emitTheme();
  }
}
