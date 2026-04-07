// import { CommonModule, DOCUMENT } from '@angular/common';
import { DOCUMENT} from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';


@Component({
  selector: 'app-benefits',
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.css']
})
export class BenefitsComponent implements OnInit, AfterViewInit, OnDestroy {

  bootstrap: any;
  faqArray: { question: string, answer: string }[] = [];
  chatHistory: { from: 'user' | 'bot', text: string }[] = [];
  result: string = '';

  private canonicalTag: HTMLLinkElement | null = null;

  constructor(
    private metaService: Meta,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document // Injection pour la canonique
  ) { }

  ngOnInit(): void {
    this.setPureCanonical();// Verrouillage de l'URL
    this.addTag();
  }

 
  ngAfterViewInit() {
    // On vérifie si bootstrap est défini globalement sur window
    const bstrap = (window as any).bootstrap;

    if (bstrap) {
      this.initCarousel(bstrap);
    } else {
      // Si bootstrap n'est pas encore là, on attend un petit peu
      setTimeout(() => {
        const retryBstrap = (window as any).bootstrap;
        if (retryBstrap) this.initCarousel(retryBstrap);
      }, 500);
    }

    // if (this.faqArray.length === 0) {
    //   this.prepareFaq();
    // }
  }

  private initCarousel(bstrap: any) {
    const myCarousel = document.querySelector('#demo');
    if (myCarousel) {
      new bstrap.Carousel(myCarousel, {
        interval: 3000,
        ride: 'carousel',
        touch: true
      });
    }
  }



  addTag() {
    this.titleService.setTitle(`Évaluez vos compétences et boostez votre carrière | BE-ON-TOP`);
    this.metaService.updateTag({ name: 'description', content: 'Evaluez vos connaissances facilement grâce à nos questionnaires métiers. Intégrez une formation calculée sur-mesure. Faites vous connaître des recruteurs et agences partenaires.' });
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
  // prepareFaq() {
  //   const items = document.querySelectorAll('.accordion-item');
  //   this.faqArray = [];

  //   items.forEach(item => {
  //     const question = item.querySelector('.accordion-button')?.textContent?.trim();
  //     const answer = item.querySelector('.accordion-body')?.textContent?.trim();
  //     if (question && answer) {
  //       this.faqArray.push({ question, answer });
  //     }
  //   });

  //   console.log("Tableau FAQ prêt pour GPT :", this.faqArray);
  // }



  // synonyms: Record<string, string[]> = {
  //   "demandeur": ["chercheur", "candidat", "inscrit", "personne"],
  //   "emploi": ["travail", "job", "poste", "fonction", "opportunité", "métier", "profession", "activité"],
  //   "formation": ["cours", "apprentissage", "programme", "stage", "session", "enseignement", "parcours", "e-learning"],
  //   "finançable": ["subventionné", "pris en charge", "payé", "aide", "financement", "cpf", "subvention"],
  //   "certifiante": ["certificat", "diplômante", "attestation", "titre", "qualification"],
  //   "inscription": ["comment", "enregistrement", "adhésion", "inscrire", "s'inscrire", "candidature", "dossier"],
  //   "prérequis": ["conditions", "exigences", "niveau", "précondition", "obligation"],
  //   "durée": ["combien", "temps", "longueur", "période", "heures", "jours", "semaines"],
  //   "coût": ["prix", "tarif", "frais", "budget", "paiement"],
  //   "objectif": ["but", "finalité", "cible", "résultat", "but recherché"],
  //   "compétence": ["aptitude", "capacité", "savoir-faire", "qualification", "expérience"],
  //   "questionnaire": ["positionnement", "évaluation", "qcm", "test", "quiz", "diagnostic"],
  //   "financement": ["cpf", "prise en charge", "payer", "coût", "aide"],
  //   "espace": ["profil", "compte"],
  //   "résultat": ["score", "évaluation", "bilan"],
  //   "centre": ["où", "endroit", "lieu"],
  //   "date": ["quand", "session"]
  // };

  synonyms: Record<string, string[]> = {
    "demandeur": ["chercheur", "candidat", "inscrit", "personne", "participant", "bénéficiaire"],
    "emploi": ["travail", "job", "poste", "fonction", "opportunité", "métier", "profession", "activité", "recrutement"],
    "formation": ["cours", "apprentissage", "programme", "stage", "session", "enseignement", "parcours", "e-learning", "module"],
    "finançable": ["subventionné", "pris en charge", "payé", "aide", "financement", "cpf", "subvention", "éligible"],
    "certifiante": ["certificat", "diplômante", "attestation", "titre", "qualification", "certification"],
    "inscription": ["comment", "enregistrement", "adhésion", "inscrire", "s'inscrire", "candidature", "dossier", "inscrit"],
    "prérequis": ["conditions", "exigences", "niveau", "précondition", "obligation", "requis"],
    "durée": ["combien", "temps", "longueur", "période", "heures", "jours", "semaines", "planning"],
    "coût": ["prix", "tarif", "frais", "budget", "paiement", "montant"],
    "objectif": ["but", "finalité", "cible", "résultat", "but recherché", "objectif pédagogique"],
    "compétence": ["aptitude", "capacité", "savoir-faire", "qualification", "expérience", "connaissance"],
    "questionnaire": ["positionnement", "évaluation", "qcm", "test", "quiz", "diagnostic", "autoévaluation"],
    "financement": ["cpf", "prise en charge", "payer", "coût", "aide", "financer"],
    "espace": ["profil", "compte", "espace personnel"],
    "résultat": ["score", "évaluation", "bilan", "résultats"],
    "centre": ["où", "endroit", "lieu", "localisation"],
    "date": ["quand", "session", "calendrier"]
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


  /**
     * FORCE L'URL CANONIQUE PURE
     * Cette méthode sert de "bouclier" contre le Duplicate Content.
     * Elle garantit que Google n'indexe QUE l'URL officielle, même si l'utilisateur
     * arrive avec des paramètres de tracking (UTM, Facebook ID, Gclid, etc.).
     */
  setPureCanonical() {
    // 1. On définit l'URL "parfaite" (sans aucun paramètre après le ?)
    const pureUrl = 'https://be-on-top.io/benefits';

    // 2. On vérifie si une balise <link rel="canonical"> existe déjà dans le <head>
    // pour éviter d'en créer des dizaines à chaque navigation.
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");

    // 3. Si elle n'existe pas (première visite ou après un nettoyage OnDestroy)
    if (!link) {
      // On crée dynamiquement l'élément <link>
      link = this.document.createElement('link');
      // On lui donne son identité : c'est une balise "canonical"
      link.setAttribute('rel', 'canonical');
      // On l'injecte physiquement dans la partie <head> de la page
      this.document.head.appendChild(link);
    }

    // 4. On force l'attribut "href" avec notre URL propre.
    // Si une vieille URL traînait, elle est écrasée par celle-ci.
    link.setAttribute('href', pureUrl);

    // 5. On stocke cette balise dans une variable de classe (this.canonicalTag)
    // C'est CRUCIAL pour que le ngOnDestroy puisse la supprimer en quittant la page.
    this.canonicalTag = link;

    // 6. Petit log de contrôle pour vérifier que le bouclier est actif en console
    console.log(`[SEO-SHIELD] Canonical verrouillée sur : ${pureUrl}`);
  }



  ngOnDestroy(): void {
    try {
      if (this.canonicalTag) {
        this.document.head.removeChild(this.canonicalTag);
      }
      this.metaService.removeTag("name='description'");
      this.metaService.removeTag("name='robots'");
      this.metaService.removeTag("property='og:title'");
      this.metaService.removeTag("property='og:description'");
      console.log('[SEO-CLEAN] Page Benefits nettoyée.');
    } catch (e) {
      console.warn('Erreur nettoyage Benefits');
    }
  }



}
