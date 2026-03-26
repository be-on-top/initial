import { Component, OnInit } from '@angular/core';
import { CentersService } from '../admin/centers.service';
// import { CentersService } from '../centers/centers.service';
import { HttpClient } from '@angular/common/http'; // <-- Import nécessaire
import { Title, Meta } from '@angular/platform-browser';
Title



@Component({
  selector: 'app-centers-index',
  templateUrl: './centers-index.component.html',
  styleUrls: ['./centers-index.component.css']
})
export class CentersIndexComponent implements OnInit {

  partnerCenters: any[] = [];
  memberCenters: any[] = [];
  independentCenters: any[] = [];
  subsidiaryCenters: any[] = [];

  query: string = '';

  constructor(
    private centersService: CentersService,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {

    // 1. Metas Manuelles Immédiates
    this.titleService.setTitle('Des Centres de Formation Experts');
    this.metaService.updateTag({ 
      name: 'description', 
      content: "Avec BE-ON-TOP vous bénéficiez d'un réseau de centres de formation experts pour le suivi de vos formations personnalisées et des évaluations pédagogiques." 
    });


    this.centersService.getCenters().subscribe(data => {
      // ÉTAPE TEMPORAIRE : On génère le dump dans la console
      // if (data && data.length > 0) {
      //   console.log("--- COPIEZ LE CONTENU CI-DESSOUS ---");
      //   console.log(JSON.stringify(data)); 
      //   console.log("--- FIN DU DUMP ---");
      // }
      const centers = data || [];
      this.groupCenters(centers);
    });
  }

  private groupCenters(centers: any[]): void {



    this.partnerCenters = [];
    this.memberCenters = [];
    this.independentCenters = [];
    this.subsidiaryCenters = [];

    centers.forEach(center => {
      if (center.partner) {
        this.partnerCenters.push(center);
      } else if (center.subsidiary) {
        this.subsidiaryCenters.push(center);
      } else if (center.independent) {
        this.independentCenters.push(center);
      } else {
        this.memberCenters.push(center);
      }
    });

  }





  filteredCenters(centers: any[]): any[] {
    if (!this.query) {
      return centers;
    }
    const q = this.query.toLowerCase();
    return centers.filter(center =>
      center.name.toLowerCase().includes(q) ||
      (center.city && center.city.toLowerCase().includes(q)) ||
      (center.cp && center.cp.includes(q))
    );
  }


}
