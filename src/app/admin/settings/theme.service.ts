import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultPrimaryColor = '#007bff'; // Couleur primaire par défaut
  private primaryColor: string = this.defaultPrimaryColor;

  constructor(private firestore: Firestore) {
    this.loadTheme();
  }

  setPrimaryColor(color: string): void {
    this.primaryColor = color;
    // si on sauvegarde dans firestore
    this.saveThemeToFirestore()

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

  // private loadTheme(): void {
  //   // Charger la couleur primaire sauvegardée
  //   const savedPrimaryColor = localStorage.getItem('primaryColor');

  //   if (savedPrimaryColor) {
  //     this.primaryColor = savedPrimaryColor;
  //   }

  //   this.applyTheme();
  // }

  // Si on charge la couleur depuis Firestore
  private async loadTheme(): Promise<void> {
    const themeRef = doc(this.firestore, 'settings/colors'); // Référence au document
    const themeSnap = await getDoc(themeRef); // Récupération du document

    if (themeSnap.exists()) {
      alert('ok')
      this.primaryColor = themeSnap.data()['primaryColor' ]|| this.defaultPrimaryColor; // Chargement de la couleur ou défaut
      this.applyTheme(); // Application de la couleur chargée
    } else {
      this.primaryColor = this.defaultPrimaryColor;
      this.applyTheme(); // Application de la couleur par défaut
    }
    
  }

  resetTheme(): void {
    // Réinitialiser à la couleur primaire par défaut
    this.primaryColor = this.defaultPrimaryColor;
    this.applyTheme();
  }

  // Sauvegarde la couleur dans Firestore
  // async saveThemeToFirestore() {

  //     const $settingsRef = collection(this.firestore, "settings");
  //     const $primaryDocRef = doc($settingsRef, 'theme')
  //     setDoc($primaryDocRef, this.primaryColor)


  // }


  // Sauvegarde la couleur dans Firestore
  private async saveThemeToFirestore(): Promise<void> {
    // Référence au document
    // const themeRef = doc(this.firestore, 'settings/colors'); 
    const $settingsRef = collection(this.firestore, "settings");
    const $primaryDocRef = doc($settingsRef, 'colors')
    await setDoc($primaryDocRef, { primaryColor: this.primaryColor }); // Sauvegarde de la couleur
  }

  


}
