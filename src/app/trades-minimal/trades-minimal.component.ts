import { Component, Inject, OnDestroy, OnInit } from '@angular/core'; // + Inject, OnDestroy
import { SettingsService } from '../admin/settings.service';
import { SlugService } from '../slug.service';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common'; // + Import
import { map } from 'rxjs';

@Component({
  selector: 'app-trades-minimal',
  templateUrl: './trades-minimal.component.html',
  styleUrls: ['./trades-minimal.component.css']
})
export class TradesMinimalComponent implements OnInit, OnDestroy { // + Implements OnDestroy

  query: string = '';
  ungroupedTrades: any[] = [];
  groupedTrades: { key: string, value: any[] }[] = [];
  tradesData: any[] = [];
  isLoading: boolean = true;

  private canonicalTag: HTMLLinkElement | null = null; // Référence pour le bouclier

  constructor(
    @Inject(DOCUMENT) private document: Document, // Injection
    public slugService: SlugService,
    private settingsService: SettingsService,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    // --- SEO ---
    this.titleService.setTitle("Catalogue de nos formations métiers | BE-ON-TOP");
    this.metaService.updateTag({
      name: 'description',
      content: "Explorez notre catalogue de formations métiers pour évaluer vos compétences et démarrer au plus vite une formation sur-mesure qui vous ressemble."
    });

    // Verrouillage de l'URL (Écrase la précédente sans "trou noir")
    this.setPureCanonical();

    // --- DATA ---
    //   this.settingsService.getTrades().subscribe({
    //     next: (data) => {
    //       this.tradesData = data || [];
    //       this.groupTrades();
    //       this.isLoading = false;
    //     },
    //     error: (err) => {
    //       console.error("Erreur lors de la récupération :", err);
    //       this.isLoading = false;
    //     }
    //   });
    // }
    this.settingsService.getTrades().pipe(
      map(data => (data || []).filter(trade => trade.status === true))
    ).subscribe({
      next: (filteredData) => {
        this.tradesData = filteredData;
        this.groupTrades();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur lors de la récupération :", err);
        this.isLoading = false;
      }
    });
  }

  // MÉTHODE BOUCLIER (Identique à celle des centres)
  private setPureCanonical() {
    const pureUrl = 'https://be-on-top.io/trainingsIndex'; // Remplacez par votre route réelle
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', pureUrl);
    this.canonicalTag = link;
  }

  // NETTOYAGE SÉCURISÉ
  ngOnDestroy(): void {
    try {
      // On ne remove PAS la canonique pour les raisons SEO évoquées (continuité)
      // Mais on nettoie la description pour éviter les mélanges dans Google
      this.metaService.removeTag("name='description'");
      console.log('[SEO-CLEAN] Catalogue métiers nettoyé.');
    } catch (e) {
      console.warn('Erreur lors du nettoyage SEO catalogue');
    }
  }

  private groupTrades() {
    const groupedMap = new Map<string, any[]>();
    this.ungroupedTrades = [];

    this.tradesData.forEach(trade => {
      if (trade.parentCategory && trade.parentCategory.trim() !== '') {
        if (!groupedMap.has(trade.parentCategory)) {
          groupedMap.set(trade.parentCategory, []);
        }
        groupedMap.get(trade.parentCategory)?.push(trade);
      } else {
        this.ungroupedTrades.push(trade);
      }
    });

    this.groupedTrades = Array.from(groupedMap.entries()).map(([key, value]) => ({ key, value }));
  }

  copyUrl(url: string): void {
    const fullUrl = window.location.origin + '/formation/' + url;
    navigator.clipboard.writeText(fullUrl)
      .then(() => console.log('URL copiée :', fullUrl))
      .catch(err => console.error('Erreur de copie :', err));
  }
}