import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CentersService } from '../../centers.service';
import { Centers } from '../../centers';

@Component({
  selector: 'app-centers-list',
  templateUrl: './centers-list.component.html',
  styleUrls: ['./centers-list.component.css']
})
export class CentersListComponent {

  userRouterLinks: any;

  // ✅ Option 1 : initialiser comme tableau vide (jamais undefined)
  allCenters: Centers[] = [];

  searchText: string = '';

  // filtre : '' = tous, sinon 'partner'|'subsidiary'|'member'|'independent'
  selectedType: '' | 'partner' | 'subsidiary' | 'member' | 'independent' = '';

  centerTypes = [
    { value: '', label: 'Tous les centres' },
    { value: 'partner', label: 'Partenaires du réseau' },
    { value: 'subsidiary', label: 'Filiales du réseau' },
    { value: 'member', label: 'Adhérents du réseau' },
    { value: 'independent', label: 'Centres hors réseau' }
  ];

  filteredCenters: Centers[] = [];

  constructor(
    private router: Router,
    private service: CentersService,
    private activatedRoute: ActivatedRoute
  ) {
    this.userRouterLinks = this.activatedRoute.snapshot.data;
  }

  ngOnInit(): void {
    this.getCenters();
    // this.updateCentersWithId() // ponctuel si nécessaire
  }

  getCenters() {
    this.service.getCenters().subscribe(data => {
      console.log("data de getCenters()", data);
      this.allCenters = data;
      this.applyFilter(); // initialiser la vue
    });
  }

  deleteCenter(centerId: string) {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce centre ?');
    if (!confirmed) return;

    this.service.deleteCenter(centerId).then(() => {
      console.log('Centre supprimé avec succès');
      this.router.navigate(['/admin/centers']);
    }).catch(error => {
      console.error('Erreur lors de la suppression du centre:', error);
    });
  }

  disableCenter(centerId: string) {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir désactiver ce centre ?');
    if (!confirmed) return;

    this.service.disableCenter(centerId).then(() => {
      console.log('✅ Centre désactivé avec succès');
      alert('Le centre a bien été désactivé.');
      this.router.navigate(['/admin/centers']);
    }).catch(error => {
      console.error('❌ Erreur lors de la désactivation du centre :', error);
      alert('Une erreur est survenue lors de la désactivation du centre.');
    });
  }

  enableCenter(centerId: string) {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir réactiver ce centre ?');
    if (!confirmed) return;

    this.service.enableCenter(centerId).then(() => {
      console.log('✅ Centre réactivé avec succès');
      alert('Le centre a bien été réactivé.');
      this.router.navigate(['/admin/centers']);
    }).catch(error => {
      console.error('❌ Erreur lors de la réactivation du centre :', error);
      alert('Une erreur est survenue lors de la réactivation du centre.');
    });
  }

  onSearchTextEntered(searchValue: string) {
    this.searchText = searchValue;
    console.log(this.searchText);
  }

  async updateCentersWithId() {
    try {
      await this.service.addIdToExistingCenters();
      console.log('Mise à jour des centres réussie.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des centres:', error);
    }
  }

  applyFilter(): void {
    if (!this.selectedType) {
      this.filteredCenters = this.allCenters.slice();
      return;
    }

    // Sécurité : traite undefined comme false
    this.filteredCenters = this.allCenters.filter(
      (center: Centers) => !!(center as any)[this.selectedType]
    );
  }


/**
 * Exporte la liste des centres (filtrés ou complets) au format CSV
 * et déclenche automatiquement le téléchargement du fichier.
 * 
 * Le CSV généré est encodé en UTF-8 avec un BOM pour compatibilité Excel.
 */
exportCentersToCSV(): void {

  // On récupère la liste à exporter :
  // - soit la liste filtrée (search / type)
  // - soit la liste complète si aucun filtre n'est actif
  const centers = this.filteredCenters.length ? this.filteredCenters : this.allCenters;

  // Si aucune donnée n'est disponible, on arrête l'export
  if (!centers || centers.length === 0) {
    alert('Aucune donnée à exporter.');
    return;
  }

  // Liste des colonnes à inclure dans le fichier CSV
  // (doit correspondre aux propriétés de l’interface Centers)
  const headers = [
    'id',
    'name',
    'cp',
    'city',
    'address',
    'created',
    'status',
    'sigles',
    'mainCity',
    'tel',
    'partner',
    'subsidiary',
    'member',
    'independent',
    'comment'
  ];

  // Tableau qui contiendra toutes les lignes du CSV
  const csvRows = [];

  // Ligne d’en-tête : les noms de colonnes séparés par un point-virgule
  csvRows.push(headers.join(';'));

  // Parcours de chaque centre pour construire les lignes de données
  for (const center of centers) {

    // Chaque "row" (ligne) correspond à un tableau de valeurs formatées
    const row = headers.map(h => {
      let value = (center as any)[h]; // On récupère la valeur correspondant à la colonne

      // --- FORMATAGE DES DONNÉES ---

      // Si la valeur est un tableau (ex: sigles: string[]), on la convertit en chaîne
      if (Array.isArray(value)) value = value.join(', ');

      // Si la valeur est une Date JavaScript
      if (value instanceof Date) {
        const d = new Date(value);
        value = d.toLocaleDateString('fr-FR');

      // Si la valeur est un timestamp en millisecondes (nombre long)
      } else if (typeof value === 'number' && value > 1000000000000) {
        // Exemple : 1733659900153 → correspond à une date (en ms depuis 1970)
        const d = new Date(value);
        value = d.toLocaleDateString('fr-FR');

      // Si la valeur est un objet Firestore Timestamp (avec une propriété seconds)
      } else if (value && value.seconds) {
        // Firestore stocke les dates en secondes → conversion en ms
        const d = new Date(value.seconds * 1000);
        value = d.toLocaleDateString('fr-FR');
      }

      // Conversion des booléens en valeurs lisibles
      if (typeof value === 'boolean') value = value ? 'oui' : 'non';

      // Valeurs nulles ou undefined → chaîne vide (évite "undefined" dans le CSV)
      if (value === undefined || value === null) value = '';

      // On entoure la valeur de guillemets et on échappe les guillemets internes
      // Exemple : "Aéroport "Nice"" → "Aéroport ""Nice"""
      return `"${String(value).replace(/"/g, '""')}"`;
    });

    // On ajoute la ligne complète (séparée par des points-virgules)
    csvRows.push(row.join(';'));
  }

  // Fusion de toutes les lignes avec des sauts de ligne
  const csvContent = csvRows.join('\n');

  // Ajout du BOM UTF-8 (Byte Order Mark)
  // ➜ Permet à Excel d’interpréter correctement les accents (é, è, à...)
  const csvWithBom = '\uFEFF' + csvContent;

  // Création d’un Blob (objet fichier) contenant le texte CSV
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });

  // Génération d’une URL temporaire pointant vers le fichier
  const url = URL.createObjectURL(blob);

  // Création d’un lien HTML invisible pour forcer le téléchargement
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'centres.csv'); // Nom du fichier téléchargé

  // Le lien est ajouté puis cliqué automatiquement
  document.body.appendChild(link);
  link.click();

  // Enfin, on nettoie le DOM en retirant le lien
  document.body.removeChild(link);
}





}
