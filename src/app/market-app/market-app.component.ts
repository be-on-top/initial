import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-market-app',
  templateUrl: './market-app.component.html',
  styleUrls: ['./market-app.component.css']
})
export class MarketAppComponent {

  paragraphs: string[] = [
    "...en réunissant organismes de formation, entreprises, spécialistes de l'intérim et partenaires de l'accompagnement",
    "...en privilégiant smartphones, tablettes et interactivité entre apprenants, formateurs et conseillers",
    "...en confiant à des experts, la conception d'outils d'évaluation, en phase avec les entreprises",
    "...en restituant, par métier et compétences, les durées préconisées selon le niveau chacun"
  ];

  constructor(private metaService: Meta, private titleService: Title) { }


  currentIndex: number = 0; // Index actuel du paragraphe marqué
  // interval: any; // Stockage de l'intervalle

  ngOnInit(): void {
    // Initialise le carrousel
    // this.startCarousel();
    this.addTag();
  }

  // startCarousel() {
  //   // Démarrer l'intervalle de changement de paragraphe
  //   this.interval = setInterval(() => {
  //     this.currentIndex = (this.currentIndex + 1) % this.paragraphs.length;
  //   }, 5500); // Change tous les 2 secondes
  // }
  ngAfterViewInit(): void {
    const myCarousel = document.querySelector('#demo');

    if (myCarousel) {
      const carousel = new bootstrap.Carousel(myCarousel, {
        interval: 7000,
        ride: 'carousel'
      });

      setTimeout(() => {
        carousel.cycle();
      }, 1000); // 🔹 Redémarre après 1s pour assurer le lancement sur mobile

      myCarousel.addEventListener('slide.bs.carousel', (event: any) => {
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


  addTag() {
    this.titleService.setTitle(`Mieux qu'un bilan de compétences, évaluez les compétences professionnelles de vos candidats apprenants avec BE-ON-TOP.io`);
    this.metaService.updateTag({ name: 'description', content: 'Mieux qu\'un bilan de compétences, nos questionnaires permettent d\'évaluer un niveau d\'entrée en formation pour une formation personnalisée qui fera le focus sur les compétences et connaissances permettant à chacun d\'être pleinement opérationnel et trouver rapidement du travail...' });
    this.metaService.addTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ property: 'og:title', content: 'Informations Prescripteurs : Formations et compétences professionnelles évaluées sur BE-ON-top.io' });
    this.metaService.updateTag({ property: 'og:description', content: 'Mieux qu\'un bilan de compétence, des questionnaires conçus par des experts métiers...' });

  }

}
