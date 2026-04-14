import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { TrainersService } from '../trainers.service';
import { EvaluatorsService } from '../evaluators.service';
import { Trainer } from '../trainer';

@Component({
  selector: 'app-professionals-list',
  templateUrl: './professionals-list.component.html',
  styleUrls: ['./professionals-list.component.css']
})
export class ProfessionalsListComponent implements OnInit {
  totalProAccounts: any[] = [];
  totalProAccountsFiltered: any[] = [];
  isLoading = true;

  activeFilter: string | null = 'trainer'; // affichage par défaut

  typeLabels: { [key: string]: string } = {
    referent: 'Conseiller Projet',
    trainer: 'Formateur',
    editor: 'Éditeur (Marketing)',
    external: 'Observateur Externe',
    evaluator: 'Évaluateur',
    manager: 'Responsable Métier',
    'data-analyst': 'Data Analyst'
  };

  constructor(
    private usersService: UsersService,
    private trainersService: TrainersService,
    private evaluatorsService: EvaluatorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;

    // On récupère les formateurs
    this.trainersService.getTrainers().subscribe(trainers => {
      trainers
        .filter(t => this.isValidTrainer(t))
        .forEach(trainer => {
          this.totalProAccounts.push({ ...trainer, type: 'trainer' });
        });
      this.updateFilteredList();
      this.logDisabledTrainers(this.totalProAccounts)
    });

    // On récupère les évaluateurs
    this.evaluatorsService.getEvaluators().subscribe(evaluators => {
      evaluators.forEach(evaluator => {
        this.totalProAccounts.push({ ...evaluator, type: 'evaluator' });
      });
      this.updateFilteredList();
    });

    // On récupère les autres utilisateurs
    this.usersService.getUsers().subscribe({
      next: (users: any[]) => {
        users.forEach(user => {
          const roles = Array.isArray(user.role) ? user.role : [user.role];
          roles.forEach((role: string) => {
            this.totalProAccounts.push({ ...user, type: role });
          });
        });

        // Déduplication finale par email
        this.totalProAccounts = this.deduplicateByEmail(this.totalProAccounts);

        this.updateFilteredList();
        this.isLoading = false;
      },
      error: (error) => {
        console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Met à jour la liste filtrée selon le filtre actif
   */
  private updateFilteredList(): void {
    if (this.activeFilter) {
      this.totalProAccountsFiltered = this.totalProAccounts.filter(pro => pro.type === this.activeFilter);
    } else {
      this.totalProAccountsFiltered = [...this.totalProAccounts];
    }
  }


  // Filtrage par bouton
  filterByType(type: string): void {
    this.activeFilter = type;
    this.updateFilteredList();
  }

  // Comptage pour les boutons
  countByType(type: string): number {
    return this.totalProAccounts.filter(pro => {
      if (type === 'trainer') {
        return pro.type === 'trainer' && this.isValidTrainer(pro);
      }
      return pro.type === type;
    }).length;
  }

  // Types uniques pour les boutons
  getUniqueTypes(): string[] {
    return [...new Set(this.totalProAccounts.map(pro => pro.type))];
  }

  // Label lisible
  getTypeLabel(type: string): string {
    return this.typeLabels[type] || type;
  }

  // Validation des formateurs
  // isValidTrainer(trainer: any): boolean {
  //   if (!trainer?.email) return false;
  //   const email = trainer.email.toLowerCase();
  //   return email.includes('@') &&
  //     !email.includes('test') &&
  //     !email.includes('exemple') &&
  //     !email.includes('fake') &&
  //     !email.includes('bidon');

  // }
  /**
   * Détermine si un formateur est valide pour l'affichage
   * Un formateur est considéré invalide si :
   * - l'email est absent
   * - l'email ne contient pas '@'
   * - l'email contient des mots-clés indiquant un compte bidon / test
   */
  isValidTrainer(trainer: any): boolean {

    // Sécurité : pas de trainer ou pas d'email → on exclut
    if (!trainer?.email) return false;

    // Normalisation pour éviter les problèmes de casse
    const email = trainer.email.toLowerCase();

    // Liste des mots-clés considérés comme invalides
    const excludedKeywords = ['test', 'exemple', 'fake', 'bidon'];

    // Un email est exclu s'il est mal formé
    // ou s'il contient un mot-clé interdit
    const isExcluded =
      !email.includes('@') ||
      excludedKeywords.some(keyword => email.includes(keyword));

    // Log en console pour audit / reporting des comptes exclus
    if (isExcluded) {
      console.log(
        `Email exclu : ${trainer.email} (UID: ${trainer.uid})`
      );
      return false;
    }


    // Email valide → le formateur est affichable
    return true;
  }


  // Déduplication par email
  private deduplicateByEmail(list: any[]) {
    const seen = new Set<string>();
    return list.filter(item => {
      if (!item.email) return false;
      if (seen.has(item.email)) return false;
      seen.add(item.email);
      return true;
    });
  }


  /**
   * Exporte la liste filtrée des professionnels au format CSV.
   * Cet export est destiné principalement aux usages de type emailing.
   *
   * ⚠️ Important :
   * - Le préfixe '\uFEFF' (BOM UTF-8) est volontairement ajouté
   *   pour garantir une ouverture correcte du fichier dans Excel / Outlook
   *   (gestion des accents dans les prénoms / noms).
   */


  // -----------------------------
  // En-têtes du fichier CSV
  // -----------------------------
  // On ajoute CP et Competences pour l'export, même si elles ne sont pas affichées
  // dans la vue. Cela permet d'avoir un CSV complet pour mailing / reporting.
  downloadCsv(list: any[]) {

    // --------------------------------------------------
    // Vérifie s'il existe AU MOINS une compétence dans la liste
    // 👉 Permet d'afficher ou non la colonne "Competences" dans le CSV
    // --------------------------------------------------
    const hasCompetences = list.some(item =>
      Array.isArray(item.sigle) && item.sigle.length > 0
    );

    // --------------------------------------------------
    // Construction dynamique des en-têtes CSV
    // 👉 La colonne "Competences" est ajoutée UNIQUEMENT si nécessaire
    // --------------------------------------------------
    const headers = [
      'UID',
      'firstName',
      'lastName',
      'Email',
      'Type',
      'CP',
      ...(hasCompetences ? ['Competences'] : []),
      'statut'
    ];

    // --------------------------------------------------
    // Transformation des données en lignes CSV
    // --------------------------------------------------
    const rows = list.map(item => {

      // Colonnes de base (toujours présentes)
      const baseRow = [
        item.id ?? '',
        item.firstName ?? '',
        item.lastName ?? '',
        item.email ?? '',

        // 👉 Transformation du type technique en label lisible
        this.getTypeLabel(item.type),

        // 👉 Transformation tableau CP → string (séparée par des virgules)
        Array.isArray(item.cp) ? item.cp.join(',') : ''
      ];

      // --------------------------------------------------
      // Ajout conditionnel des compétences
      // 👉 Garantit la cohérence avec les headers
      // --------------------------------------------------
      if (hasCompetences) {
        baseRow.push(
          Array.isArray(item.sigle) ? item.sigle.join(',') : ''
        );
      }

      // --------------------------------------------------
      // Transformation du statut boolean → label lisible
      // 👉 true  → "actif"
      // 👉 false → "désactivé"
      // --------------------------------------------------
      baseRow.push(item.status === true ? 'actif' : 'désactivé');

      return baseRow;
    });

    // --------------------------------------------------
    // Construction du contenu CSV
    // --------------------------------------------------
    // '\uFEFF' = BOM UTF-8 → indispensable pour Excel (accents OK)
    const csvContent = '\uFEFF' + [
      headers.join(';'),           // séparateur de colonnes (; pour Excel FR)
      ...rows.map(r => r.join(';'))
    ].join('\n');

    // --------------------------------------------------
    // Création du fichier et téléchargement
    // --------------------------------------------------
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // 👉 Nom du fichier basé sur le filtre actif
    link.setAttribute('download', `professionnels_${this.activeFilter}.csv`);

    // Déclenchement du téléchargement
    link.click();
  }


  logDisabledTrainers(trainers: any[]) {
    console.log('trainers dans logDisabledTrainers', trainers);

    const trainersDisabled = trainers.filter(
      (trainer: any) => trainer.status === false
    );

    console.log('formateurs désactivés', trainersDisabled);
  }


}
