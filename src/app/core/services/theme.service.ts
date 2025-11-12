import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  private currentThemeSubject: BehaviorSubject<Theme>;
  public currentTheme$: Observable<Theme>;

  constructor() {
    const savedTheme = this.getSavedTheme();
    this.currentThemeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    this.applyTheme(savedTheme);
  }

  /**
   * Get saved theme from localStorage or default to 'light'
   */
  private getSavedTheme(): Theme {
    const saved = localStorage.getItem(this.THEME_KEY);
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
    this.currentThemeSubject.next(theme);
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentThemeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    return this.currentThemeSubject.value === 'dark';
  }
}

