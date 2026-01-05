import { Component, OnInit } from '@angular/core';
import { CentersService } from '../admin/centers.service';
// import { CentersService } from '../centers/centers.service';



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

  constructor(private centersService: CentersService) { }

  ngOnInit(): void {
    this.centersService.getCenters().subscribe(data => {
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
