import { Component } from '@angular/core';

@Component({
  selector: 'app-market-app',
  templateUrl: './market-app.component.html',
  styleUrls: ['./market-app.component.css']
})
export class MarketAppComponent {

  paragraphs: string[] = [
    "...en réunissant organismes de formation, entreprises, spécialistes de l'intérim et partenaires de l'accompagnement",
    "...en privilégiant smartphones, tablettes et interactivité pédagogique entre apprenants, formateurs, tuteurs.",
    "...en confiant à des experts, en phase avec les entreprise, la conception d'outils d'évaluation, compétence par compétence"
  ];

  currentIndex: number = 0; // Index actuel du paragraphe marqué
  // interval: any; // Stockage de l'intervalle

  ngOnInit(): void {
    // Initialise le carrousel
    // this.startCarousel();
  }

  // startCarousel() {
  //   // Démarrer l'intervalle de changement de paragraphe
  //   this.interval = setInterval(() => {
  //     this.currentIndex = (this.currentIndex + 1) % this.paragraphs.length;
  //   }, 5500); // Change tous les 2 secondes
  // }

  ngAfterViewInit(): void {
    // Attache un écouteur d'événements au carrousel Bootstrap
    const carouselElement = document.getElementById('demo');

    if (carouselElement) {
      carouselElement.addEventListener('slide.bs.carousel', (event: any) => {
        // Met à jour l'index en fonction du slide actif
        this.currentIndex = event.to;
      });
    }
  }

  // ngOnDestroy(): void {
  //   // Nettoie l'intervalle pour éviter les fuites de mémoire
  //   if (this.interval) {
  //     clearInterval(this.interval);
  //   }
  // }

}
