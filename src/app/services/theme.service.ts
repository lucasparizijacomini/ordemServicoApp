import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  constructor() {
    this.loadInitialTheme();
  }

  toggleTheme(): boolean {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    return this.isDarkMode;
  }

  getThemeStatus(): boolean {
    return this.isDarkMode;
  }

  private loadInitialTheme() {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      this.isDarkMode = JSON.parse(saved);
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme(this.isDarkMode);
  }

  private applyTheme(dark: boolean) {
    if (dark) {
      document.body.classList.add('ion-palette-dark');
    } else {
      document.body.classList.remove('ion-palette-dark');
    }
  }
}
