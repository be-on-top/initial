import { Pipe, PipeTransform } from '@angular/core';

// Le décorateur @Pipe permet de définir ce fichier comme un pipe Angular.
// Le nom du pipe est 'duration', et il pourra être utilisé dans les templates Angular avec ce nom.
@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  // La méthode transform est celle qui sera appelée lorsque le pipe est utilisé dans un template.
  // Le paramètre 'value' est la valeur d'entrée (la durée totale en heures, éventuellement fractionnée).
  // Cette méthode retourne une chaîne de caractères formatée en heures et minutes.

  // transform(value: number): string {
  //   if (isNaN(value) || value < 0) {
  //     return 'Invalid input';
  //   }

  //   const hours = Math.floor(value);
  //   const decimalPart = value - hours;
  //   const minutes = Math.round(decimalPart * 100);

  //   if (minutes >= 60) {
  //     const additionalHours = Math.floor(minutes / 60);
  //     const remainingMinutes = minutes % 60;
  //     return `${hours + additionalHours}h${remainingMinutes.toString().padStart(2, '0')}`;
  //   } else {
  //     if (minutes === 0) {
  //       return `${hours}h`;
  //     } else {
  //       return `${hours}h${minutes.toString().padStart(2, '0')}`;
  //     }
  //   }
  // }

  transform(value: number): string {
    if (isNaN(value) || value < 0) {
      return 'Invalid input';
    }

    const hours = Math.floor(value);
    const decimalPart = value - hours;
    const minutes = Math.round(decimalPart * 100);

    if (minutes >= 60) {
      const additionalHours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours + additionalHours}h`;
      } else {
        return `${hours + additionalHours}h${remainingMinutes.toString().padStart(2, '0')}`;
      }
    } else {
      if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h${minutes.toString().padStart(2, '0')}`;
      }
    }
  }



  // transform(value: number): string {
  //   // Vérifie si la valeur est un nombre et qu'elle est positive
  //   if (isNaN(value) || value < 0) {
  //     return 'Invalid input';
  //   }

  //   // Obtient le nombre d'heures en arrondissant à l'entier inférieur
  //   const hours = Math.floor(value);
  //   // Calcule la partie décimale restante après avoir extrait les heures
  //   const decimalPart = value - hours;
  //   // Convertit la partie décimale en minutes
  //   const minutes = Math.round(decimalPart * 60);

  //   // Si les minutes sont exactement 0, retourne uniquement les heures
  //   if (minutes === 0) {
  //     return `${hours}h`;
  //   // Si les minutes sont égales ou supérieures à 60, ajoute une heure supplémentaire et calcule les minutes restantes
  //   } else if (minutes >= 60) {
  //     const additionalHours = Math.floor(minutes / 60); // Calcule les heures supplémentaires à ajouter
  //     const remainingMinutes = minutes % 60; // Calcule les minutes restantes après avoir ajouté les heures supplémentaires
  //     return `${hours + additionalHours}h${remainingMinutes.toString().padStart(2, '0')}`; // Retourne le format heures et minutes ajusté
  //   // Si les minutes sont entre 1 et 59, retourne les heures et minutes telles quelles
  //   } else {
  //     return `${hours}h${minutes.toString().padStart(2, '0')}`;
  //   }
  // }
  

}

