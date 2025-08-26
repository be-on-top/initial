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


    if (this.faqArray.length === 0) {
      this.prepareFaq(); // prépare FAQ si ce n'est pas déjà fait
    }
    // this.showSearch = true;
  }


  addTag() {
    this.titleService.setTitle(`Mieux qu'un bilan de compétences, évaluez vos compétences professionnelles avec BE-ON-TOP.io`);
    this.metaService.updateTag({ name: 'description', content: 'Les questionnaires d\'évaluation en ligne, dits d\'évaluation initiale sont conçus par des experts métiers...' });
    this.metaService.addTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ property: 'og:title', content: 'Informations Utilisateurs : Formations et compétences professionnelles évaluées sur BE-ON-top.io' });
    this.metaService.updateTag({ property: 'og:description', content: 'Les questionnaires d\'évaluation en ligne, dits d\'évaluation initiale sont conçus par des experts métiers...' });
  }

  // showSearch = false;

  // activateSearch() {
  //   if (this.faqArray.length === 0) {
  //     this.prepareFaq(); // prépare FAQ si ce n'est pas déjà fait
  //   }
  //   // this.showSearch = true;
  // }


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

  synonyms: Record<string, string[]> = {
    "demandeur": ["chercheur", "candidat"],
    "emploi": ["travail", "job", "poste", "fonction", "opportunité"],
    "formation": ["cours", "apprentissage", "programme", "stage"],
    "finançable": ["subventionné", "pris en charge", "payé", "aide", "coût"],
    "certifiante": ["certificat", "diplômante", "attestation"],
    "inscription": ["enregistrement", "adhésion", "enrollement"],
    "prérequis": ["conditions", "exigences", "niveau"],
    "durée": ["temps", "longueur", "période"],
    "coût": ["prix", "tarif", "frais"],
    "objectif": ["but", "finalité", "cible"],
    "compétence": ["aptitude", "capacité", "savoir-faire"],
    "questionnaire": ["positionnement", "évaluation", "qcm", "test"]
  };

  // Fuzzy léger via distance de Levenshtein
  levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Stemming simple (tronquer suffixes communs)
  // stem(word: string): string {
  //   return word.replace(/(ée|er|ant|ment|tion|s)$/i, '');
  // }
  stem(word: string): string {
    word = word.toLowerCase().replace(/[^\w\s]/g, '');

    if (word.length <= 4) return word; // mots très courts, pas de stem

    // pluriels réguliers
    if (word.endsWith('s') && !word.endsWith('ss')) {
      if (word.endsWith('es') && word.length > 4) {
        word = word.slice(0, -2);
      } else {
        word = word.slice(0, -1);
      }
    }

    // pluriels spéciaux (ex: cheval → chevaux)
    if (word.endsWith('aux') && word.length > 4) {
      word = word.slice(0, -3) + 'al';
    }

    // féminins → masculin simple
    const femSuffixes = ['ée', 'ive', 'euse', 'ette'];
    for (const suf of femSuffixes) {
      if (word.endsWith(suf) && word.length > suf.length + 2) {
        word = word.slice(0, -suf.length);
        break;
      }
    }

    // suffixes fréquents
    const suffixes = ['tion', 'ment', 'age', 'ance', 'ence', 'er', 'é'];
    for (const suf of suffixes) {
      if (word.endsWith(suf) && word.length > suf.length + 2) {
        word = word.slice(0, -suf.length);
        break;
      }
    }

    return word;
  }


  // Vérifie si un mot correspond, est synonyme ou proche (fuzzy)
  isMatch(word: string, text: string): boolean {
    const stemWord = this.stem(word.toLowerCase());
    const wordsInText = text.toLowerCase().split(/\s+/).map(w => this.stem(w));

    // correspondance exacte ou stem
    if (wordsInText.some(t => t === stemWord)) return true;

    // correspondance avec synonymes stemmés
    for (const key of Object.keys(this.synonyms)) {
      const stemKey = this.stem(key);
      const stemSyns = this.synonyms[key].map(s => this.stem(s));

      // mot = clé ou synonyme
      if (stemWord === stemKey || stemSyns.includes(stemWord)) {
        if (wordsInText.includes(stemKey) || wordsInText.some(w => stemSyns.includes(w))) return true;
      }

      // mot = un synonyme, texte contient la clé
      if (stemSyns.includes(stemWord) && wordsInText.includes(stemKey)) return true;
    }

    // correspondance approximative (fuzzy)
    const threshold = 2;
    if (wordsInText.some(t => this.levenshtein(t, stemWord) <= threshold)) return true;

    return false;
  }



  // Fonction déclenchée par le bouton
  searchFaq(userQuestion: string) {
    if (!userQuestion) {
      this.result = "Veuillez poser une question.";
      return;
    }

    // Votre moteur de recherche existant
    this.result = this.searchFaqFuzzy(userQuestion);

    // Scroll vers le résultat (accessible, non intrusif)
    setTimeout(() => {
      const resultEl = document.getElementById('faqResult');
      resultEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  // Exemple du moteur fuzzy existant
  searchFaqFuzzy(userQuestion: string): string {
    if (!userQuestion) return "Veuillez poser une question.";

    const words = userQuestion.toLowerCase().split(/\s+/);
    const scores: { q: { question: string, answer: string }, score: number }[] = [];

    this.faqArray.forEach(q => {
      const qText = q.question.toLowerCase();
      const aText = q.answer.toLowerCase();
      let score = 0;

      words.forEach(word => {
        if (this.isMatch(word, qText)) score += 1;
        if (this.isMatch(word, aText)) score += 1;
      });

      if (score > 0) scores.push({ q, score });
    });

    if (scores.length === 0) return "Désolé, aucune réponse trouvée dans la FAQ.";

    scores.sort((a, b) => b.score - a.score);
    const bestScore = scores[0].score;
    const bestMatches = scores.filter(s => s.score === bestScore);

    return bestMatches
      .map(s => `A la question : ${s.q.question}<br>${s.q.answer}`)
      .join("<br><br>");
  }

  chatHistory: { from: 'user' | 'bot', text: string }[] = [];

  sendMessage(question: string) {
    if (!question.trim()) return;

    // Ajoute la question de l'utilisateur
    this.chatHistory.push({ from: 'user', text: question });

    // Obtenir la réponse de la FAQ
    const answer = this.searchFaqFuzzy(question);

    // Ajoute la réponse de la FAQ
    this.chatHistory.push({ from: 'bot', text: answer });

    // Scroll vers le bas
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      chatContainer?.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }, 0);
  }



}
