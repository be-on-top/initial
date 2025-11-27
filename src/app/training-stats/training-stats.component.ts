import { Component } from '@angular/core';
import { SettingsService } from '../admin/settings.service';
import { StudentsService } from '../admin/students.service';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';


  interface TradeStats {
  total: number;
  unemployed: number;
  students: number;
  cdd: number;
  cdi: number;
}

@Component({
  selector: 'app-training-stats',
  templateUrl: './training-stats.component.html',
  styleUrls: ['./training-stats.component.css']
})
export class TrainingStatsComponent {

  trades: string[] = [];
  allStudents: any[] = [];
  allSocialForms: any[] = [];
  // statsByTrade: any[] = [];



statsByTrade: Record<string, TradeStats> = {};


  constructor(
    private tradeService: SettingsService,
    private studentService: StudentsService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.loadTrades();
    this.getStudents();
    this.loadSocialForms();
  }

  /** Charger tous les trades/formations */
  loadTrades() {
    this.tradeService.getTrades().subscribe(data => {
      this.trades = data.map(t => t.sigle);
      console.log("Trades chargés :", this.trades);
      this.computeStatsByTradeIfReady();
    });
  }

  /** Charger tous les étudiants valides (QCM + SocialForm) */
  getStudents() {
    this.studentService.getStudents().subscribe(students => {
      this.allStudents = students.filter(s => s.isSocialFormSent);
      console.log("Students chargés :", this.allStudents.length);
      this.computeStatsByTradeIfReady();
    });
  }

  /** Charger toute la collection SocialForm */
  loadSocialForms() {
    const collectionRef = collection(this.firestore, 'SocialForm');
    collectionData(collectionRef, { idField: 'id' }).subscribe((forms: any[]) => {
      this.allSocialForms = forms;
      console.log("SocialForms chargés :", this.allSocialForms.length);
      this.computeStatsByTradeIfReady();
    });
  }

  /** Détecteur de statut CDD/CDI/DE */
  getWorkStatus(sf: any): "CDD" | "CDI" | "DE" | "UNKNOWN" {
    if (!sf) return "UNKNOWN";
    if (sf.cddDuration) return "CDD";
    if (sf.sentCompanyEmployee !== undefined ||
        sf.lookingForSupport !== undefined ||
        sf.cdiRequiredDuration !== undefined) return "CDI";
    if (sf.isPoleEmploi === true) return "DE";
    return "UNKNOWN";
  }

  /** Calculer les stats par trade quand toutes les données sont chargées */
computeStatsByTradeIfReady() {
  if (!this.trades.length || !this.allStudents.length || !this.allSocialForms.length) return;

  this.statsByTrade = {}; // on réinitialise proprement

  this.trades.forEach(trade => {

    // Étudiants inscrits dans ce trade
    const studentsInTrade = this.allStudents.filter(s =>
      Array.isArray(s.subscriptions) && s.subscriptions.includes(trade)
    );

    // Stats de base
    const stats = {
      total: studentsInTrade.length,
      unemployed: 0,
      students: 0,
      cdd: 0,
      cdi: 0
    };

    // Pour chaque étudiant inscrit → aller chercher le socialForm correspondant
    studentsInTrade.forEach(student => {
      const sf = this.allSocialForms.find(f => f.id === student.id);
      if (!sf) return;

      if (sf.isPoleEmploi) stats.unemployed++;
      if (sf.isStudent) stats.students++;
      if (sf.cddDuration) stats.cdd++;

      // un CDI = un de ces champs renseignés
      if (
        sf.sentCompanyEmployee !== undefined ||
        sf.lookingForSupport !== undefined ||
        sf.cdiRequiredDuration !== undefined
      ) {
        stats.cdi++;
      }
    });

    // On sauvegarde dans le dictionnaire
    this.statsByTrade[trade] = stats;
  });
}


}
