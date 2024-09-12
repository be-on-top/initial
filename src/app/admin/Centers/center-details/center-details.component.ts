import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Centers } from '../../centers';
import { CentersService } from '../../centers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-center-details',
  templateUrl: './center-details.component.html',
  styleUrls: ['./center-details.component.css']
})
export class CenterDetailsComponent implements AfterViewInit {

  centerId: any;
  center?: Centers;

  localisation: { latitude: string, longitude: string } | null = null;
  map: L.Map | undefined;

  userRouterLinks:any

  constructor(private service: CentersService, private ac: ActivatedRoute, private router: Router, private location:Location) {
    this.centerId = this.ac.snapshot.params["id"];
    this.userRouterLinks = this.ac.snapshot.data;
    this.service.getCenter(this.centerId).subscribe(data => {
      console.log("data de getCenter", data);
      this.center = data;
      this.getLocalisation(this.center.cp);
    });
  }

  ngAfterViewInit(): void {
    // Configurer les icônes avant de charger la carte
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });

    if (this.localisation) {
      this.loadMap(); // Charger la carte après l'initialisation de la vue
    }
  }

  getLocalisation(cp: string) {
    this.service.getLocalisation(cp).subscribe((data: { latitude: string, longitude: string } | null) => {
      console.log('data', data);
      this.localisation = data;
      if (this.localisation) {
        this.loadMap(); // Charge la carte avec les coordonnées récupérées
      }
    }, error => {
      console.error('Erreur lors de la récupération des coordonnées:', error);
      this.localisation = null;
    });
  }

  private loadMap(): void {
    if (!this.localisation) {
      console.error('Les coordonnées de localisation ne sont pas disponibles.');
      return;
    }

    this.map = L.map('map').setView(
      [Number(this.localisation.latitude), Number(this.localisation.longitude)],
      13 // Niveau de zoom initial
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    L.marker([Number(this.localisation.latitude), Number(this.localisation.longitude)])
      .addTo(this.map)
      .bindPopup('Centre Localisation')
      .openPopup();
  }

  backToPrevious() {
    this.location.back();
    // this.router.navigate(['/home']);  // Remplacez '/home' par le chemin correspondant à votre page d'accueil
  }
}
