import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Centers } from '../../centers';
import { CentersService } from '../../centers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import * as L from 'leaflet';
import { SettingsService } from '../../settings.service';
import { Trade } from '../../trade';

@Component({
  selector: 'app-center-details',
  templateUrl: './center-details.component.html',
  styleUrls: ['./center-details.component.css']
})
export class CenterDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  centerId: any;
  center?: Centers;

  localisation: { latitude: string, longitude: string } | null = null;
  map: L.Map | undefined;

  userRouterLinks: any

  activeTrades:string[]=[]

  // flag  pour s'assurer que centerDetails est bien le composant actif
  private isActive: boolean = false;

  constructor(
    private service: CentersService, 
    private ac: ActivatedRoute, 
    private router: Router, 
    private location: Location,
    private tradeService:SettingsService
  ) {
    this.centerId = this.ac.snapshot.params["id"];
    this.userRouterLinks = this.ac.snapshot.data;
    // this.service.getCenter(this.centerId).subscribe(data => {
    //   console.log("data de getCenter", data);
    //   this.center = data;
    //   this.getLocalisation(this.center.cp);
    // });
  }

  ngOnInit(): void {
    this.isActive = true;

    // pour récupérer la liste des métiers publiés
    this.tradeService.getTradesWithStatusTrue().subscribe(data => {
      data
      data.forEach(element => {
        this.activeTrades.push(element.sigle)
        
      });
      console.log('activeTrades', this.activeTrades );
      
    })
  }

  ngAfterViewInit(): void {
    // Configurer les icônes avant de charger la carte
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });

    this.service.getCenter(this.centerId).subscribe(data => {
      console.log("data de getCenter", data);
      this.center = data;
      this.getLocalisation(this.center.cp);
    });

    // loadMap() ne devrait pas être appelée deux fois ? !
    // if (this.localisation) {
    //   this.loadMap(); // Charger la carte après l'initialisation de la vue
    // }
  }

  // getLocalisation(cp: string) {
  //   this.service.getLocalisation(cp).subscribe((data: { latitude: string, longitude: string } | null) => {
  //     console.log('data', data);
  //     this.localisation = data;
  //     if (this.localisation) {
  //       this.loadMap(); // Charge la carte avec les coordonnées récupérées
  //     }
  //   }, error => {
  //     console.error('Erreur lors de la récupération des coordonnées:', error);
  //     this.localisation = null;
  //   });
  // }

  // pour surveiller le flag et s'assurer que centerDetails est bien le composant actif
  getLocalisation(cp: string) {
    this.service.getLocalisation(cp).subscribe((data: { latitude: string, longitude: string } | null) => {
      console.log('data', data);
      this.localisation = data;
      if (this.localisation && this.isActive) {
        this.loadMap(); // Charge la carte uniquement si le composant est actif
      }
    }, error => {
      console.error('Erreur lors de la récupération des coordonnées:', error);
      this.localisation = null;
    });
  }

  // private loadMap(): void {
  //   if (!this.localisation) {
  //     console.error('Les coordonnées de localisation ne sont pas disponibles.');
  //     return;
  //   }

  //   this.map = L.map('map').setView(
  //     [Number(this.localisation.latitude), Number(this.localisation.longitude)],
  //     13 // Niveau de zoom initial
  //   );

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //   }).addTo(this.map);

  //   L.marker([Number(this.localisation.latitude), Number(this.localisation.longitude)])
  //     .addTo(this.map)
  //     .bindPopup('Localisation')
  //     .openPopup();
  // }


  // private loadMap(): void {
  //   if (!this.localisation ) {
  //     console.error('Les coordonnées de localisation ne sont pas disponibles.');
  //     return;
  //   }

  //   this.map = L.map('map').setView(
  //     [Number(this.localisation.latitude), Number(this.localisation.longitude)],
  //     12 // Zoom plus large pour une meilleure vue globale
  //   );

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //   }).addTo(this.map);

  //   const icon = L.icon({
  //     iconUrl: 'assets/leaflet/marker-icon.png',
  //     shadowUrl: 'assets/leaflet/marker-shadow.png',
  //     iconSize: [25, 41],
  //     iconAnchor: [12, 41],
  //     popupAnchor: [1, -34],
  //     shadowSize: [41, 41]
  //   });

  //   L.marker([Number(this.localisation.latitude), Number(this.localisation.longitude)], { icon })
  //     .addTo(this.map)
  //     .bindPopup('Localisation')
  //     .openPopup();
  // }

  // toujours pour vérifier si l'instance de map n'a pas déjà été créée

  private loadMap(): void {
    if (!this.localisation) {
      console.error('Les coordonnées de localisation ne sont pas disponibles.');
      return;
    }

    // Vérifie si la carte est déjà initialisée
    if (this.map) {
      this.map.setView(
        [Number(this.localisation.latitude), Number(this.localisation.longitude)],
        this.map.getZoom()
      ); // Met à jour seulement la vue
      return;
    }

    // Crée la carte uniquement si elle n'a pas été initialisée
    this.map = L.map('map').setView(
      [Number(this.localisation.latitude), Number(this.localisation.longitude)],
      12
    );

    // Ajoute les tuiles et le marqueur
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([Number(this.localisation.latitude), Number(this.localisation.longitude)], { icon })
      .addTo(this.map)
      .bindPopup('Localisation')
      .openPopup();
  }



  backToPrevious() {
    this.location.back();
    // this.router.navigate(['/home']);  // Remplacez '/home' par le chemin correspondant à votre page d'accueil
  }


  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }


}
