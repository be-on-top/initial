import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { Meta, SafeHtml } from '@angular/platform-browser';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, docData, doc } from '@angular/fire/firestore';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Student } from 'src/app/admin/Students/student';
import { AuthService } from 'src/app/admin/auth.service';
import { SettingsService } from 'src/app/admin/settings.service';
import { StudentsService } from 'src/app/admin/students.service';
import { Trade } from 'src/app/admin/trade';
import { Location } from '@angular/common';
import { CentersService } from 'src/app/admin/centers.service';
import { Centers } from 'src/app/admin/centers';

import * as L from 'leaflet';


@Component({
  selector: 'app-trade-details',
  templateUrl: './trade-details.component.html',
  styleUrls: ['./trade-details.component.css']
})
export class TradeDetailsComponent implements OnInit, AfterViewInit {

  // si on passe effectivement des paramètres au router au lieu de faire un input 
  tradeId: string = ""
  tradeData!: Trade
  firstValuesSum: number = 0

  // il va falloir forcément user et userData pour la gestion des quizz
  studentId?: string
  studentData?: Student
  hasStartedEvaluation: boolean = false
  isEvaluationCompleted: boolean = false
  userRole: string = ""
  // pour charger l'image associée si image
  imageUrl: string = ''; // Pour stocker l'URL de l'image
  imageUrlReduced: string = '';

  offline: boolean = false

  // pour les données structurées
  structuredData: SafeHtml = ''; // Initialisation de structuredData

  tradeCenters: any

  private map: L.Map | undefined;

  isMapVisible = false;

  tradeDataDenominationRGAA?: any

  // ne vise qu'à retarder avec css l'affichage de tout le contenu
  isPageLoaded: boolean = false;


  constructor(
    private service: SettingsService,
    private ac: ActivatedRoute,
    private auth: Auth,
    private authService: AuthService,
    private studentService: StudentsService,
    private firestore: Firestore,
    public sanitizer: DomSanitizer,
    private location: Location,
    private titleService: Title,
    private metaService: Meta,
    private centerService: CentersService,
    private router: Router
  ) {
    this.offline = !navigator.onLine
  }

  ngOnInit(): void {
    // this.tradeId = this.ac.snapshot.params["id"]
    this.ac.paramMap.subscribe(params => {
      this.tradeId = params.get('id') ?? ''
      // Faire quelque chose avec this.tradeId ici si online
      if (!this.offline) {
        // 1 récupération du doc en ligne
        this.service.getSigle(this.tradeId).subscribe(data => {
          console.log("metier récupéré via le paramètre de route", data)
          this.tradeData = data


          this.tradeDataDenominationRGAA = this.processDenomination(data.denomination)
          // pour personnaliser le metatag
          const textForDescription = this.transform(this.tradeData.description)
          this.addTag(`Evaluez vos compétences et démarrez une formation personnalisée de ${this.tradeData.denomination}. ${textForDescription}`)
          // Mettre à jour le titre de la page
          this.titleService.setTitle(`Formation ${this.tradeData.denomination}: compétences métier et emploi`)

          // Définir l'URL canonique
          this.setCanonicalURL(`https://be-on-top.io/formation/${this.tradeId}/${this.tradeData.denomination}`);
          // Pour extraire et additionner les premières valeurs des tableaux associés aux clés spécifiques dans l'objet tradeData.durations, vous pouvez utiliser TypeScript avec Angular de la manière suivante :  
          const keysToExtractFrom = Object.keys(this.tradeData.durations)
          this.firstValuesSum = keysToExtractFrom.reduce((sum, key) => {
            const valuesArray = this.tradeData.durations[key]
            if (valuesArray && valuesArray.length > 0) {
              sum += valuesArray[0]
            }
            return sum;
          }, 0)

          // données structurées
          this.structuredData = this.generateStructuredData(this.tradeData);
          // this.fetchCenters();


          // console.log("Sum of first values:", this.firstValuesSum)
        })

        // 2 récupérer l'image en ligne

        // Charge les URLs des deux versions de l'image
        this.service.loadImage(this.tradeId).then(({ originalUrl, resizedUrl }) => {
          this.imageUrl = originalUrl;
          this.imageUrlReduced = resizedUrl;
          this.updateOpenGraphImage()
        }).catch((error) => {
          if (error.code === 'storage/object-not-found') {
            console.log('Aucune image n\'a encore été ajoutée.');
          } else {
            console.error('Erreur lors du chargement de l\'image', error);
          }
        });



      } else if (this.offline) {

        alert("offline")
        // 1 pour ouvrir la base indexedDB et récupérer le doc sauverdé :
        const openRequest = window.indexedDB.open('my-database');
        // Pour gérer les évènements à l'ouverture de la base
        openRequest.onsuccess = (event) => {
          const db = openRequest.result;
          const transaction = db.transaction('sigles', 'readonly');
          const objectStore = transaction.objectStore('sigles');
          const getOneRequest = objectStore.get(this.tradeId);

          // alert(this.tradesData)

          // Traite les données récupérées ici depuis base de données indexée my-database
          getOneRequest.onsuccess = (event) => {
            console.log("métier récupéré depuis indexedDB")
            this.tradeData = getOneRequest.result
            // Pour extraire et additionner les premières valeurs des tableaux associés aux clés spécifiques dans l'objet tradeData.durations, vous pouvez utiliser TypeScript avec Angular de la manière suivante :  
            const keysToExtractFrom = Object.keys(this.tradeData.durations)
            this.firstValuesSum = keysToExtractFrom.reduce((sum, key) => {
              const valuesArray = this.tradeData.durations[key]
              if (valuesArray && valuesArray.length > 0) {
                sum += valuesArray[0]
              }
              return sum;
            }, 0)

            // données structurées
            // this.structuredData = this.generateStructuredData(this.tradeData);

            // console.log("Sum of first values:", this.firstValuesSum);

          }

        } // fin de la requête indexedDB

        // pour récupérer l'image locale si image locale
        this.imageUrl = `../../assets/${this.tradeId}.jpeg`





      }


      onAuthStateChanged(this.auth, (user: any) => {
        if (user) {
          this.studentId = user.uid
          this.studentService.getStudentById(user.uid).subscribe((data) => {
            this.studentData = data
            // alert(JSON.stringify(this.studentData!['quizz_' + this.tradeId].scoreCounter))
            this.studentData && this.studentData!['quizz_' + this.tradeId] ? this.hasStartedEvaluation = true : this.hasStartedEvaluation = false;
            console.log('this.hasStartedEvaluation', this.hasStartedEvaluation);
            this.studentData && this.studentData['quizz_' + this.tradeData.sigle] && this.studentData['quizz_' + this.tradeData.sigle].fullResults ? this.isEvaluationCompleted = true : this.isEvaluationCompleted = false;

          })

          // quant à savoir qui est qui et quel est son rôle
          // soit on l'a reçu en paramètre, soit on ne l'a pas et faut faire une vérification dans la collection roles

          if (this.ac.snapshot.params["userRole"]) {
            this.userRole = this.ac.snapshot.params["userRole"]
          } else {
            this.getRole(user.uid).subscribe(data => {
              console.log("data de l'utilisateur depuis header", data);
              // si on a un tableau de rôles, c'est data.role[0]
              this.userRole = data.role
              // console.log("roles depuis header", data.role);

            })

          }
        }
        else {

          this.userRole = "none"

          // alert("pour commencer un quizz, vous identifier ou vous créer un compte !!!!")
        }


      })


      // alert(this.hasStartedEvaluation)

      // this.structuredData = this.generateStructuredData(this.tradeData);


      // fin ac.paramMap.subscribe
    })


    setTimeout(() => {
      this.isPageLoaded = true;
    }, 300); // Petit délai pour que l'effet soit perceptible


  }



  // ngAfterViewChecked(): void {
  //   const mapContainer = document.getElementById('mapId');

  //   if (mapContainer) {
  //     this.loadMapWithCenters();
  //     this.mapInitialized = true; // Empêche les appels répétés
  //   }
  // }

  private mapInitialized = false;

  async ngAfterViewInit(): Promise<void> {
    // Récupère les centres, puis charge la carte
    await this.fetchCenters();

    // Après chargement des centres, initialiser la carte une fois le conteneur DOM prêt
    // Cette partie est désactivée tant qu'on n'a pas procédé à des tests à grande échelle...
    // this.initializeMapWhenReady();
  }







  getRole(id: any) {
    // finalement, compte tenu du fait que les evaluators peuvent potentiellement aussi être des tuteurs (formateurs) roles sera un tableau
    // au niveau de getRole, cela ne change pas grand chose
    let $roleRef = doc(this.firestore, "roles/" + id)
    return docData($roleRef) as Observable<any>;

  }

  backToPrevious() {
    // this.location.back();
    this.router.navigate(['/home']);  // Remplacez '/home' par le chemin correspondant à votre page d'accueil
  }

  isDescriptionCollapsed: boolean = false;
  isCPCollapsed: boolean = true;
  isCentersCollapsed: boolean = false;

  toggleDescriptionCollapse() {
    this.isDescriptionCollapsed = !this.isDescriptionCollapsed;
    this.isDescriptionCollapsed && this.isCPCollapsed && this.isCentersCollapsed ? this.toggleCPCollapse() : ''
    this.isDescriptionCollapsed && this.isCentersCollapsed ? this.toggleCentersCollapse() : ''

  }

  toggleCPCollapse() {
    this.isCPCollapsed = !this.isCPCollapsed;
    // !this.isDescriptionCollapsed?this.isCPCollapsed:''
    // !this.isCPCollapsed && this.isDescriptionCollapsed ? this.toggleDescriptionCollapse() : ''
    // this.isCPCollapsed && this.isCentersCollapsed ? this.toggleCentersCollapse() : ''

  }




  toggleCentersCollapse() {
    this.isCentersCollapsed = !this.isCentersCollapsed;
    // !this.isDescriptionCollapsed?this.isCPCollapsed:''
    this.isCentersCollapsed && this.isDescriptionCollapsed ? this.toggleDescriptionCollapse() : ''
    this.isCentersCollapsed && this.isCPCollapsed ? this.toggleCPCollapse() : ''

    // Affiche la carte si l'onglet est ouvert
    if (this.isCentersCollapsed) {
      // Affiche la carte
      this.isMapVisible = true;

      // Donne un délai pour s'assurer que le DOM est mis à jour avant l'appel de `invalidateSize`
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 100);
    } else {
      // Masque la carte si le collapse est fermé
      this.isMapVisible = false;
    }


  }


  addTag(description: string) {
    this.metaService.updateTag({ name: 'description', content: description })
    // this.metaService.addTag({ name: 'robots', content: 'index,follow' })
    this.metaService.updateTag({ property: 'og:title', content: this.tradeData.denomination })
    this.metaService.updateTag({ property: 'og:description', content: description })
    this.metaService.updateTag({ property: 'og:url', content: window.location.href })
  }

  updateOpenGraphImage() {
    this.metaService.updateTag({ property: 'og:image', content: this.imageUrl });
    // this.metaService.updateTag({ property: 'og:image', content: `../../assets/${this.tradeId}.jpeg` });
    this.updateLinkTags()

  }

  updateLinkTags() {
    const linkTags = [
      { rel: 'image_src', href: this.imageUrl }
    ];

    linkTags.forEach(tag => {
      let element = document.querySelector(`link[rel="${tag.rel}"]`);
      if (element) {
        element.setAttribute('href', tag.href);
      } else {
        element = document.createElement('link');
        element.setAttribute('rel', tag.rel);
        element.setAttribute('href', tag.href);
        document.getElementsByTagName('head')[0].appendChild(element);
      }
    });
  }

  transform(value: any): string {
    const temp = document.createElement('div');
    temp.innerHTML = value;

    return (temp.textContent || temp.innerText || '').slice(0, 120) + '...';
  }




  generateStructuredData(trade: Trade): SafeHtml {
    const data = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": trade.denomination,
      "description": "Formation BE-ON-TOP - fiche métier compétences et objectifs",
      "articleBody": trade.description,
      "image": "https://be-on-top.io/assets/" + trade.sigle + ".jpeg", // Utilisez une URL d'image appropriée
      "author": {
        "@type": "Person",
        "name": "M.Hervé"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BE-ON-TOP",
        "logo": {
          "@type": "ImageObject",
          "url": "https://be-on-top.io/assets/BE-ON-TOP_picto_LOGO.svg"
        }
      },
      // Propriétés supplémentaires
      "identifiant": trade.sigle,
      "Competence": this.tradeData.competences,
      "Durée max de formation en heures": this.firstValuesSum,
    };
    return this.sanitizer.bypassSecurityTrustHtml(`<script type="application/ld+json">${JSON.stringify(data)}</script>`);
  }




  setCanonicalURL(url: string) {
    // Cherche un élément <link> avec l'attribut rel="canonical"
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');

    if (link) {
      console.log("url mise à jour");

      // Si l'élément <link> existe déjà, met à jour son attribut href avec la nouvelle URL canonique
      link.href = url;
    } else {
      // Si l'élément <link> n'existe pas, crée un nouvel élément <link>
      link = document.createElement('link');
      // Définit l'attribut rel à "canonical"
      link.setAttribute('rel', 'canonical');
      // Définit l'attribut href à l'URL canonique fournie
      link.setAttribute('href', url);
      // Ajoute l'élément <link> à la tête du document
      document.head.appendChild(link);

      console.log("url mise à jour");
    }

  }


  private async fetchCenters(): Promise<void> {
    try {
      const centers = await this.centerService.getDocsByParam(this.tradeId);
      console.log('Centres récupérés:', centers);
      this.tradeCenters = centers
      // on désactive tant qu'on n'a pas pu tester à grande échelle...
      // this.addMarkers(centers); // Ajoute les marqueurs après que la carte soit initialisée
    } catch (error) {
      console.error('Erreur lors de la récupération des centres:', error);
    }
  }

  private async addMarkers(centers: any[]): Promise<void> {
    if (!this.map) return;

    for (const center of centers) {
      const localisation = await this.getLocalisation(center.cp);
      if (localisation) {
        const marker = L.marker([Number(localisation.latitude), Number(localisation.longitude)]).addTo(this.map);
        marker.bindTooltip(`<b>CP:</b> ${center.cp}<br><b>Ville:</b> ${center.city}`, {
          permanent: false,
          direction: "top",
          offset: L.point(0, -10)
        });
      }
    }

    // Ajuste la taille de la carte pour éviter tout problème de rendu
    this.map.invalidateSize();
  }


  public onLogin(): void {
    // Log de l'URL actuelle avant de la stocker
    console.log('URL actuelle (avant login):', this.router.url);

    // Stocker l'URL actuelle avant de rediriger
    this.authService.setRedirectUrl(this.router.url);

    // Log pour confirmer que l'URL est bien stockée
    console.log('URL stockée pour redirection après login:', this.authService.getRedirectUrl());

    // Rediriger vers la page de login
    this.router.navigate(['/login']).then(() => {
      console.log('Redirection vers /login effectuée.');
    });
  }


  public onRegister(): void {
    // Stocker l'URL actuelle avant de rediriger
    this.authService.setRedirectUrl(this.router.url);
    // Rediriger vers la page d'enregistrement
    this.router.navigate(['/register']);
  }


  // private async loadMapWithCenters(): Promise<void> {
  //   const defaultLatitude = 46.603354; // Centre de la France
  //   const defaultLongitude = 1.888334;

  //   // Initialise la carte si elle n'existe pas encore
  //   if (!this.map) {
  //     console.log('Chargement de la carte...');
  //     this.map = L.map('mapId').setView([defaultLatitude, defaultLongitude], 6);

  //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  //     }).addTo(this.map);
  //   }

  //   // Ajoute un marqueur pour chaque centre après récupération des coordonnées
  //   for (const center of this.tradeCenters) {
  //     const localisation = await this.getLocalisation(center.cp); // Attend la localisation
  //     if (localisation) {
  //       console.log('Ajout d\'un marqueur pour le centre:', center);
  //       const marker = L.marker([Number(localisation.latitude), Number(localisation.longitude)]).addTo(this.map);

  //       marker.bindTooltip(`<b>CP:</b> ${center.cp}<br><b>Ville:</b> ${center.city}`, {
  //         permanent: false,
  //         direction: "top",
  //         offset: L.point(0, -10)
  //       });
  //     } else {
  //       console.warn('Coordonnées non disponibles pour le centre avec CP:', center.cp);
  //     }
  //   }
  // }

  // Méthode asynchrone pour attendre que le conteneur et les centres soient prêts
  private initializeMapWhenReady(): void {
    const mapContainer = document.getElementById('mapId');

    if (mapContainer && this.tradeCenters && this.tradeCenters.length > 0 && !this.mapInitialized) {
      this.loadMapWithCenters(); // Initialiser la carte avec les centres
      this.mapInitialized = true; // Marquer la carte comme initialisée
    } else {
      // Reessaie après un court délai si le conteneur ou les centres ne sont pas encore prêts
      setTimeout(() => this.initializeMapWhenReady(), 100);
    }
  }

  // Méthode pour charger la carte avec les centres
  private loadMapWithCenters(): void {
    const defaultLatitude = 46.603354; // Centre de la France
    const defaultLongitude = 1.888334;

    // Définir les icônes par défaut de Leaflet avant d'initialiser la carte
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });

    if (!this.map) {
      console.log('Initialisation de la carte...');
      this.map = L.map('mapId').setView([defaultLatitude, defaultLongitude], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      console.log("Carte initialisée avec succès");
    }

    // Ajoute des marqueurs pour chaque centre, si la carte est bien initialisée (fonctionne très bien)
    // if (this.map) {
    //   this.tradeCenters.forEach((center:any) => {
    //     this.getLocalisation(center.cp).then(localisation => {
    //       if (localisation) {
    //         const marker = L.marker([Number(localisation.latitude), Number(localisation.longitude)]).addTo(this.map!);
    //         marker.bindTooltip(`<b>CP:</b> ${center.cp}<br><b>Ville:</b> ${center.city}`, {
    //           permanent: false,
    //           direction: "top",
    //           offset: L.point(0, -10)
    //         });
    //       }
    //     });
    //   });
    // }

    if (this.map) {
      this.tradeCenters.forEach((center: any) => {
        this.getLocalisation(center.cp).then(localisation => {
          if (localisation) {
            const marker = L.marker([Number(localisation.latitude), Number(localisation.longitude)]).addTo(this.map!);

            // Contenu de la pop-up avec le lien cliquable
            const popupContent = `
            <div>
              <b>CP:</b> ${center.cp}<br>
              <b>Ville:</b> ${center.city}<br>
              <a href="/center/${center.id}" style="color: blue; text-decoration: underline;">
                Voir le détail
              </a>
            </div>`;

            // Bind la pop-up au lieu du tooltip
            marker.bindPopup(popupContent);
          }
        });
      });
    }




  }


  // Méthode pour obtenir les coordonnées d'un centre à partir de son code postal
  private async getLocalisation(cp: string): Promise<{ latitude: string; longitude: string } | null> {
    return new Promise((resolve, reject) => {
      this.centerService.getLocalisation(cp).subscribe(
        data => resolve(data),
        // Appelle loadMapWithCenters seulement après avoir récupéré les données
        // this.loadMapWithCenters();
        error => {
          console.error('Erreur lors de la récupération des coordonnées:', error);
          resolve(null); // Renvoie null en cas d'erreur pour continuer l'exécution
        }
      );
    });
  }

  // processDenomination(denomination: string): string {
  //   const acronymRegex = /(\b[A-Z]+\b)\s?\((.*?)\)/g;

  //   return denomination.replace(acronymRegex, (match, acronym, meaning) => {
  //     return `<abbr title="${meaning}">${acronym}</abbr>`;
  //   });
  // }

  processDenomination(denomination: string): string {
    // Expression régulière pour détecter les acronymes en majuscules suivis de la signification entre parenthèses
    const acronymRegex = /(\b[A-Z]+\b)\s?\((.*?)\)/g;
  
    return denomination.replace(acronymRegex, (match, acronym, meaning) => {
      // On remplace l'acronyme par <abbr>, mais on garde les parenthèses et leur contenu visibles
      return `<abbr title="${meaning}">${acronym}</abbr> (${meaning})`;
    });


  }
  

  isLoading: boolean = true

  // onImageLoad
  //   () {
  //   alert("bingo")
  //   // this.isLoading = false;
  // }

  onImageLoad() {
    this.isLoading = false;
    // Ajout de la classe 'loaded' pour le fade-in après le chargement
    const imgElement = document.querySelector('img');
    if (imgElement) {
      imgElement.classList.add('loaded');
    }
  }


}



