import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-benefits',
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.css']
})
export class BenefitsComponent implements OnInit, AfterViewInit {

  bootstrap: any;
  faqArray: { question: string, answer: string }[] = [];

  constructor(private metaService: Meta, private titleService: Title, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.addTag();
  }

  ngAfterViewInit() {
    const myCarousel = document.querySelector('#demo');
    if (myCarousel) {
      const carousel = new bootstrap.Carousel(myCarousel, {
        interval: 3000,
        ride: 'carousel',
        touch: true
      });
      setTimeout(() => carousel.cycle(), 0);
    }
  }

  addTag() {
    this.titleService.setTitle(`Mieux qu'un bilan de compétences, évaluez vos compétences professionnelles avec BE-ON-TOP.io`);
    this.metaService.updateTag({ name: 'description', content: 'Les questionnaires d\'évaluation en ligne, dits d\'évaluation initiale sont conçus par des experts métiers...' });
    this.metaService.addTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ property: 'og:title', content: 'Informations Utilisateurs : Formations et compétences professionnelles évaluées sur BE-ON-top.io' });
    this.metaService.updateTag({ property: 'og:description', content: 'Les questionnaires d\'évaluation en ligne, dits d\'évaluation initiale sont conçus par des experts métiers...' });
  }

  // Remplit le tableau FAQ à partir des collapses existantes
  prepareFaq() {
    const items = document.querySelectorAll('.accordion-item');
    this.faqArray = [];

    items.forEach(item => {
      const question = item.querySelector('.accordion-button')?.textContent?.trim();
      const answer = item.querySelector('.accordion-body')?.textContent?.trim();
      if (question && answer) {
        this.faqArray.push({ question, answer });
      }
    });

    console.log("Tableau FAQ prêt pour GPT :", this.faqArray);
  }

  result: string = '';

  // Dans votre BenefitsComponent
  synonyms: Record<string, string[]> = {
    "demandeur": ["chercheur", "candidat"],
    "emploi": ["travail", "job", "poste"],
    "formation": ["cours", "apprentissage"],
    "finançable": ["subventionné", "pris en charge", "payé"],
    "certifiante": ["certificat", "diplômante"]
  };

  // Vérifie si un mot correspond ou est synonyme
  isMatch(word: string, text: string): boolean {
    word = word.toLowerCase();
    text = text.toLowerCase();

    if (text.includes(word)) return true;

    if (this.synonyms[word]) {
      if (this.synonyms[word].some(s => text.includes(s))) return true;
    }

    for (const key of Object.keys(this.synonyms)) {
      if (this.synonyms[key].includes(word) && text.includes(key)) return true;
    }

    return false;
  }

  // Fonction principale pour rechercher dans la FAQ
  searchFaqFuzzy(userQuestion: string): string {
    if (!userQuestion) return "Veuillez poser une question.";

    const words = userQuestion.toLowerCase().split(/\s+/);
    const scores: { q: { question: string, answer: string }, score: number }[] = [];

    this.faqArray.forEach(q => {
      const qText = q.question.toLowerCase();
      let score = 0;

      words.forEach(word => {
        if (this.isMatch(word, qText)) score += 1;
      });

      if (score > 0) scores.push({ q, score });
    });

    if (scores.length === 0) return "Désolé, aucune réponse trouvée dans la FAQ.";

    // Trie par score décroissant
    scores.sort((a, b) => b.score - a.score);

    // Concatène toutes les questions ayant le meilleur score
    const bestScore = scores[0].score;
    const bestMatches = scores.filter(s => s.score === bestScore);

    return bestMatches
      .map(s => `A la question : ${s.q.question}\n Rréponse : ${s.q.answer}`)
      .join("<br>"); // double saut de ligne entre les réponses
  }

}
