import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-benefits',
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.css']
})
export class BenefitsComponent implements OnInit, AfterViewInit {


  bootstrap: any;
  constructor(private metaService: Meta, private titleService: Title, private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.addTag()
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      const carouselElement = document.getElementById('demo');
      if (carouselElement) {
        const carouselInstance = new this.bootstrap.Carousel(carouselElement, {
          interval: 2000,
          ride: 'carousel',
          touch: true
        });
    
        // Simuler un événement utilisateur
        carouselElement.dispatchEvent(new Event('mouseenter'));
        carouselElement.dispatchEvent(new Event('mouseleave'));
    
        carouselInstance.cycle();
      }
    }, 500);
    
  }
  
  



  addTag() {
    this.titleService.setTitle(`Mieux qu'un bilan de compétences, évaluez vos compétences professionnelles avec BE-ON-TOP.io`)
    this.metaService.updateTag({ name: 'description', content: 'Les questionnaires d\'évaluation en ligne, dits d\'évaluation initiale sont conçus par des experts métiers, professionnels de terrain, en connaissance des compétences professionnelles, savoir-faire professionnels, savoir-être professionnels, aptitudes et qualités requises par les recruteurs et entreprises' })
    this.metaService.addTag({ name: 'robots', content: 'index, follow' })
    this.metaService.updateTag({ property: 'og:title', content: 'Informations Utilisateurs : Formations et compétences professionnelles évaluées sur BE-ON-top.io par des professionnels de la formation' })
    this.metaService.updateTag({ property: 'og:description', content: 'Les questionnaires d\'évaluation en ligne, dits d\'évaluation initiale sont conçus par des experts métiers, professionnels de terrain, en connaissance des compétences professionnelles, savoir-faire professionnels, savoir-être professionnels, aptitudes et qualités requises par les recruteurs et entreprises' })
  }

}
