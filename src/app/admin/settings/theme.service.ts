import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultPrimaryColor = '#007bff'; // Couleur primaire par défaut
  private primaryColor: string = this.defaultPrimaryColor;

  constructor() {
    this.loadTheme();
  }

  setPrimaryColor(color: string): void {
    this.primaryColor = color;
    this.applyTheme();
  }

  getPrimaryColor(): string {
    return this.primaryColor;
  }

  private applyTheme(): void {
    // Modifier la propriété CSS personnalisée pour la couleur primaire
    document.documentElement.style.setProperty('--primary-color', this.primaryColor);
    this.saveTheme();
  }

  private saveTheme(): void {
    // Stocker la couleur primaire dans le localStorage
    localStorage.setItem('primaryColor', this.primaryColor);
  }

  private loadTheme(): void {
    // Charger la couleur primaire sauvegardée
    const savedPrimaryColor = localStorage.getItem('primaryColor');

    if (savedPrimaryColor) {
      this.primaryColor = savedPrimaryColor;
    }

    this.applyTheme();
  }

  resetTheme(): void {
    // Réinitialiser à la couleur primaire par défaut
    this.primaryColor = this.defaultPrimaryColor;
    this.applyTheme();
  }
}
