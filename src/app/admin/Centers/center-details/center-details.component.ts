import { Component, OnInit } from '@angular/core';
import { Centers } from '../../centers';
import { CentersService } from '../../centers.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-center-details',
  templateUrl: './center-details.component.html',
  styleUrls: ['./center-details.component.css']
})
export class CenterDetailsComponent {

  centerId: any;
  center?: Centers

  // longitude:string |undefined=""
  // latitude:string | undefined =""
  localisation: { latitude: string, longitude: string } | null = null;

  constructor(private service: CentersService, private ac: ActivatedRoute, private router: Router) {
    this.centerId = this.ac.snapshot.params["id"];
    this.service.getCenter(this.centerId).subscribe(data => {
      console.log("data de getCenter", data);
      this.center = data
      this.getLocalisation(this.center.cp)
      return this.center
    })

  }

  getLocalisation(cp: string) {

    this.service.getLocalisation(cp).subscribe((data: { latitude: string, longitude: string } | null) => {
      console.log('data', data);
      this.localisation = data
      console.log('longitude', this.localisation?.longitude)
      console.log('latitude', this.localisation?.latitude)
    }, 
    error => {
      console.error('Erreur lors de la récupération des coordonnées:', error);
      this.localisation = null;
    })


  }





}
