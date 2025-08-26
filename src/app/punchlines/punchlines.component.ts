import { Component } from '@angular/core';

@Component({
  selector: 'app-punchlines',
  templateUrl: './punchlines.component.html',
  styleUrls: ['./punchlines.component.css']
})
export class PunchlinesComponent {

  punchlines: string[] = [
    "Explorez, testez-vous à votre rythme… puis transformez l'essai en formation dès demain.",
    "BE-ON-TOP transforme l'exploration de vos compétences en jeu : testez, explorez, découvrez… en toute liberté la formation qui vous ressemble.",
    "Ici, pas besoin de vous battre pour faire valider un projet de formation : le projet colle à votre profil. Il est cohérent, concret et se défendra tout seul !",
    "On vous propose un parcours métier sur mesure, qui vous ressemble et répond aux besoins du marché du travail. Résultat ? Vous n'aurez pas à justifier pourquoi c'est le choix qui convient.",
    "Ce n'est pas un bilan de compétences façon quiz psychologique ou test de logique hors-sol. Ici, on parle métier. Concret. Réel. Utile.",
    // "BE-ON-TOP transforme l'exploration de vos compétences en jeu : testez, explorez, comparez… et démarrez votre formation sur-mesure dès demain.",
    "Explorez vos aptitudes et découvrez, en quelques clics, une offre de formation calculée sur mesure. Pas de promesse floue, pas d'attente. Vous savez immédiatement ce qu'il vous faut pour progresser… et combien de temps cela vous prendra",
    "Pas besoin de cocher des cases absurdes pour valider votre projet professionnel. C'est un outil d'orientation qui parle vrai, parle métier, parle terrain.",
    "BE-ON-TOP, n'est pas un simple catalogue de formations. C'est un outil pour tester vos compétences, explorer vos envies… et avancer sans pression...",
  ]
  punchline: string = "";
  rating: number = 0


  // punchlines.component.ts
  prenoms = ['Louis', 'Élise', 'Julien', 'Camille', 'Maxime', 'Sophie', 'Antoine', 'Claire', 'Théo', 'Manon'];
  noms = ['Lefebvre', 'Moreau', 'Dubois', 'Laurent', 'Simon', 'Michel', 'Garcia', 'Martinez', 'Roux', 'Fournier'];

  name:string=""


  ngOnInit(): void {
    this.punchline = this.getRandomPunchline();
    this.rating = this.getRandomRating();
    this.name = this.getRandomName()
  }

  getRandomPunchline(): string {
    const index = Math.floor(Math.random() * this.punchlines.length);
    return this.punchlines[index];
  }

  getRandomRating(): number {
    return Math.floor(Math.random() * 2) + 4; // 4 ou 5 étoiles
  }

  getRandomName(): string {
    const prenom = this.prenoms[Math.floor(Math.random() * this.prenoms.length)];
    const nom = this.noms[Math.floor(Math.random() * this.noms.length)];
    return `${prenom} ${nom}`;
  }

}
