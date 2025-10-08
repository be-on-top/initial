import { query } from '@angular/animations';
import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef, } from '@angular/core';
import { Auth, onAuthStateChanged, user } from '@angular/fire/auth';
import { DocumentSnapshot, Firestore, addDoc, collection, doc, docData, getDocs, setDoc, where } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { getDoc } from 'firebase/firestore';
import { Observable, from, map, of, tap } from 'rxjs';
import { StudentsService } from 'src/app/admin/students.service';
import { Student } from '../admin/Students/student';
import { SettingsService } from '../admin/settings.service';
import { CentersService } from '../admin/centers.service';
import { Centers } from '../admin/centers';
import { TextToSpeechService } from '../admin/text-to-speech.service';
import { ConsentService } from '../consent.service';


@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})


export class StudentFormComponent implements OnInit, OnChanges, AfterViewInit {
  // authId?: any;
  // userData?: any;
  userData: any = {};
  uid: string = ""
  // @Input() firstName: string;
  // @Input() lastName: string;
  // @Input() email: string;
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  // champsDesactives: boolean = true;
  handicap: boolean = false;
  isValidID: boolean = true;
  // demandeFinancement?: string = '';
  requestFinancing: boolean | undefined;
  employmentPromise: boolean | null = null;
  sentCompanyEmployee: boolean | null = null
  // MoyenDeTransport: boolean | undefined;
  // MoyenDeTransport: boolean | undefined;
  // selectedOrientation?: string = '';
  // isRenewalIDinProgress: boolean = false;
  // isPoleEmploi: boolean = false;
  idPoleEmploi: string = "";
  // frenchNationality: boolean =true;
  socialData: any = {};


  @Input() studentData: any;
  isReadOnly: boolean = false;

  // tradesData?: any
  tradesEvaluated: Array<any> = [];
  priorTrade: string = ''

  // on ne peut pas savoir si un quizz est terminé sans interroger tous les quizz, 
  // ce qu'on ne veut pas côté template, donc on crée un bolean
  isOneQuizzAchieved: boolean = false;

  relatedCenters: any = []

  isLoading: boolean = false;  // Initialiser l'indicateur de chargement
  errorMessage: string = '';   // Pour stocker le message d'erreur

  dataFiltered: Centers[] = []

  centerChoiced?: Centers

  reset: boolean = false

  // @Output() socialDataChange = new EventEmitter<any>();

  @Output() centerChange = new EventEmitter<string>(); // On émet seulement le center

  @ViewChild('submitBtn') submitButton!: ElementRef;
  @ViewChild('myForm') myForm!: NgForm; // Récupération du formulaire
  private audioPlayed = false; // Pour éviter de rejouer plusieurs fois



  constructor(
    private router: Router,
    private service: StudentsService,
    private auth: Auth,
    private firestore: Firestore,
    private settingsService: SettingsService,
    private centersService: CentersService,
    private textToSpeechService: TextToSpeechService,
    private consentService: ConsentService) { }


  async ngOnInit() {

    onAuthStateChanged(this.auth, (user: any) => {
      if (user) {
        this.uid = user.uid

        this.isDocumentInStudentsCollection(user.uid).subscribe(isStudent => {
          console.log("un étudiant est authentifié !!!!!", isStudent)
          if (isStudent) {
            this.retrieveStudentProperties(user.uid)
            // Appel de la fonction pour le message d'introduction à l'ouverture
            // this.speakMessage("N'oubliez pas de valider et soumettre votre formulaire à la fin de cette étape pour être contacté par un conseiller projet.");
            // Appel à julie j pour message d'introduction
            // this.playLocalAudio()
            // remplacé par appel text-to-speech
            this.playText("N'oubliez pas de valider votre formulaire, à la fin de cette étape, pour être contacté par un conseiller projet")

          }
          // else {
          //   this.processNonStudentData(this.studentData)
          // }
        })
      }
      else {
        console.log("Personne n'est authentifié actuellement !");
      }
    })

    // pour récupérer les métiers (sigles) enregistrés en base une fois studentData mis à jour :
    // this.settingsService.getTrades().subscribe(data => {
    //   this.tradesData = data;
    //   console.log("this.tradesData", this.tradesData)
    // })


    // window.speechSynthesis.addEventListener("voiceschanged", () => {
    //   console.log(window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('fr')));
    // });


  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentData'] && this.studentData) {
      const studentData = this.studentData;
      console.log('studentData', studentData);

      if (studentData.id) {
        this.processNonStudentData(studentData);
      } else {
        console.log('ID not available in studentData');
      }
    }
  }

  ngAfterViewInit() {
    // this.getCenterName()
  }


  async onSubmit(form: NgForm) {
    console.log("form value", form.value);

    const socialFormData = { center: this.socialData.center, priorTrade: this.priorTrade, ...form.value };

    // Validation
    if (!this.socialData.center) {
      alert("Veuillez sélectionner un centre avant de soumettre le formulaire.");
      return;
    }

    if (form.invalid) {
      alert("Veuillez remplir tous les champs obligatoires : adresse, code postal et téléphone.");
      return;
    }

    // Nettoyage des données avant envoi
    Object.keys(socialFormData).forEach(key => socialFormData[key] === undefined && delete socialFormData[key]);

    try {
      // Enregistrement des données dans Firestore
      let enrollRef = collection(this.firestore, "SocialForm");
      await setDoc(doc(enrollRef, this.uid), socialFormData);

      // Mise à jour de l'étudiant
      let studentRef = collection(this.firestore, "students");
      await setDoc(doc(studentRef, this.uid), { isSocialFormSent: true }, { merge: true });

      // Avant la redirection effectuée, on déclenche l'événement
      this.trackSocialFormSent();

      // ✅ Déclenchement de la redirection
      setTimeout(() => {
        this.router.navigate(['/account'], { queryParams: { id: this.userData.id } });
      }, 300); // 300ms suffisent pour assurer le flush réseau du pixel

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données: ', error);
    }
  }

  trackSocialFormSent() {
    try {
      console.log('👀 Tentative de track Lead');
      (window as any).fbq('track', 'Lead', {}, { eventID: 'test-lead-debug' });

      console.log('✅ fbq track Lead envoyé');
    } catch (e) {
      console.warn('❌ Erreur fbq', e);
    }
  }


  async onInputChange(fieldName: string, value: any) {
    try {
      let enrollRef = collection(this.firestore, "SocialForm");
      // Enregistrement des données dans la collection "SocialForm"
      await setDoc(doc(enrollRef, this.uid), { [fieldName]: value }, { merge: true });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données: ', error);
    }
  }

  isDocumentInStudentsCollection(documentId: string): Observable<boolean> {
    const docRef = doc(this.firestore, 'students', documentId);

    return from(getDoc(docRef)).pipe(
      map(snapshot => snapshot.exists())
    )
  }

  retrieveStudentProperties(user: string) {
    console.log('user properties from user authentified!!!!!', user);

    // on récupère la data de l'utilisateur
    this.service.getStudentById(user).subscribe(data => {
      console.log("userData from students 0...", data);
      this.userData = data
      // pour éjecter le innerStudent
      if (this.userData.innerStudent) {
        alert('Accès refusé : cette page n\'est pas destinée à votre profil utilisateur.');
        this.router.navigate(['/home']); // redirige vers la page d’accueil
      }
      this.processStudentData();
    })
    // on récupère la data de la collection SocialForm
    const docRef = doc(this.firestore, 'SocialForm', user);

    docData(docRef).subscribe((stData: any) => {
      stData ? this.socialData = stData : ''
      // stData?alert(stData):''


      // Pour s'assurer que dateOfBirth est au bon format (YYYY-MM-DD) !!!
      if (this.socialData.dateOfBirth) {
        // alert(this.socialData.dateOfBirth)
        this.socialData.dateOfBirth = this.formatDate(this.socialData.dateOfBirth);
        this.userData.dateOfBirth = this.formatDate(this.socialData.dateOfBirth);
      }


      // si choix de la formation déjà enregistré
      if (this.socialData.priorTrade) {
        // alert("il a déjà un centre favoris)
        this.priorTrade = this.socialData.priorTrade
        // Récupération des centres contenant le sigle priorTrade sélectionné
        this.centersService.getCenters().subscribe({
          next: (data) => {
            console.log('Data récupérée dans checkIfSelected:', data);

            // Filtrage des centres basés sur le sigle
            // this.dataFiltered = data.filter(center => center.sigles.includes(this.socialData.priorTrade));
            // ✅ Filtrage : sigle correspondant + status actif
            this.dataFiltered = data.filter(center =>
              center.status === true &&
              center.sigles.includes(this.socialData.priorTrade)
            )
            console.log("Données filtrées !!!!!!!!!!!!! :", this.dataFiltered);

            // Arrêter le chargement dès que les données sont chargées
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erreur lors de la récupération des centres:', err);
            this.isLoading = false;  // Arrêter le chargement en cas d'erreur
          }
        })
      }

    })

  }





  emitCenter() {
    console.log('Émission de socialData.center :', this.socialData.center);
    this.centerChange.emit(this.socialData.center); // Envoyer uniquement `center`
  }



  // Méthode utilitaire pour garantir le bon format
  formatDate(date: any): string {
    if (!date) return ''; // Gérer les valeurs nulles ou vides
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date; // Si déjà formaté correctement
    }
    const parsedDate = new Date(date); // Conversion depuis d'autres formats (ex. Timestamp)
    return parsedDate.toISOString().split('T')[0]; // Retourne YYYY-MM-DD
  }

  processNonStudentData(studentDataRetrived: Student) {
    console.log('user properties from parent StudentData', studentDataRetrived);

    if (studentDataRetrived && studentDataRetrived.id) {
      const docRef = doc(this.firestore, 'SocialForm', studentDataRetrived.id);
      docData(docRef).subscribe((data: any) => {
        this.socialData = data;

        // pour faire remonter au parent l'id du centre choisi,  ça fonctionne bien si besoin !!!!
        this.emitCenter()

        // additionnel ????
        // alert(this.socialData.dateOfBirth)
        if (this.socialData.dateOfBirth) {
          this.socialData.dateOfBirth = this.formatDate(this.socialData.dateOfBirth);
        }


      });
      this.userData = studentDataRetrived
      this.isReadOnly = true
    } else {
      console.error('ID not available in studentDataRetrived');
    }
  }

  processStudentData(): void {

    // additionnel
    // if (this.userData.dateOfBirth) {
    //   this.userData.dateOfBirth = this.formatDate(this.userData.dateOfBirth);
    // }

    // Logique pour obtenir tradesEvaluated + accessoirement documents
    // this.tradesEvaluated = [];
    // for (const key in this.userData) {
    //   if (key.includes('quizz')) {
    //     this.tradesEvaluated.push(key.replace('quizz_', ''));
    //     console.log('this.tradesEvaluated', this.tradesEvaluated);
    //   }
    // }

    // tri plus selectif. fonctionne bien 
    // for (const key in this.userData) {
    //   if (key.includes('quizz')) {
    //     const trade = key.replace('quizz_', '');
    //     this.tradesEvaluated.push(trade); // Ajout direct comme dans la méthode initiale

    //     // Filtrage inspiré de isOneQuizzAchieved
    //     const associatedData = this.userData[key];
    //     if (!associatedData || !associatedData.fullResults) {
    //       // Retirer les éléments sans fullResult
    //       this.tradesEvaluated = this.tradesEvaluated.filter(t => t !== trade);
    //     }
    //   }
    // }    
    // console.log('this.tradesEvaluated (après filtrage inspiré de isOneQuizzAchieved):', this.tradesEvaluated);

    for (const key in this.userData) {
      if (key.includes('quizz')) {
        const associatedData = this.userData[key];
        if (associatedData && associatedData.fullResults) { // Vérifiez avant d'ajouter
          this.tradesEvaluated.push(key.replace('quizz_', ''));
        }
      }
    }



    // Logique pour récupérer isOneQuizzAchieved
    // const achievedArray: any[] = [];
    // for (const item of this.tradesEvaluated) {
    //   if (this.userData[item].fullResults) {
    //     achievedArray.push(item);
    //     this.isOneQuizzAchieved = true;
    //   }
    // }

    // logique pour gérer les selects si un seul quizz terminé
    this.tradesEvaluated.length === 1 ? (this.dataFiltered = this.tradesEvaluated, this.checkIfSelected(this.tradesEvaluated[0])) : ''
    console.log('dataFiltered si unique quizz', this.dataFiltered);

    // logique pour gérer l'affichage si choix déjà enregistrés

    this.priorTrade !== '' ? this.dataFiltered = this.tradesEvaluated : ''



  }



  // checkIfSelected(sigle: any) {
  //   console.log(sigle);
  //   this.priorTrade = sigle



  //   // c'est l'endroit pour récupérer la liste des centres qui contiennent sigle dans leur tableau sigles
  //   // puis boucler dessus pour extraire le cp de chacun
  //   this.centersService.getCenters().subscribe(data => {
  //     console.log('data dans checkIfSelected', data);

  //     this.dataFiltered = data.filter(reducedData => {
  //       // tous les console log sont corrects !!!
  //       console.log("sigle de comparaison", sigle);

  //       console.log("reducedDat!!!!!", reducedData.sigles);
  //       console.log(reducedData.sigles.includes(sigle));
  //       return reducedData.sigles.includes(sigle)
  //     });

  //     console.log(this.dataFiltered);





  //     // attention : c'est la différence avec prior-form, on ne veut pas afficher les 20 premières questions dans le dénombre
  //     // for (let n of dataFiltered) {
  //     //   // console.log("n.number", n.number);
  //     //   this.registryNumbers.push(n.number)
  //     //   // Triez les numéros dans l'ordre croissant
  //     //   this.registryNumbers.sort((a, b) => a - b);
  //     //   this.numbers = this.numbers.filter(element => element != n.number)
  //     //   // console.log("result", this.numbers);
  //     // }

  //   })
  // }

  // checkIfSelected(sigle: string) {
  //   console.log("Sigle sélectionné :", sigle);
  //   this.priorTrade = sigle;

  //   // Récupération des centres contenant le sigle sélectionné
  //   this.centersService.getCenters().subscribe(data => {
  //     console.log('Data récupérée dans checkIfSelected:', data);

  //     // Filtrage des centres basés sur le sigle
  //     this.dataFiltered = data.filter(center => {
  //       console.log("Centre retourné :", center);
  //       console.log("Sigles du centre :", center.sigles);
  //       return center.sigles.includes(sigle);
  //     });

  //     console.log("Données filtrées :", this.dataFiltered);
  //   });
  // }

  checkIfSelected(sigle: string) {
    console.log("Sigle sélectionné dans checkIfSelected :", sigle);
    this.priorTrade = sigle;
    // On peut maintenant utiliser priorTrade pour mettre à jour socialForm
    // en appelant onInputChange ici au lieu de l'appeler fin de méthode
    // cela met à jour la liste normalement... 
    // mais n'efface pas  pour autant l'enregistrement du choix de center
    // ce qui n'est pas cohérent dans l'absolu
    // au minima, faudrait revoir côté template l'affichage avec une alerte :
    // ou effacer le choix initial pour tout réinitialiser...
    this.onInputChange('priorTrade', this.priorTrade)
    console.log('modification ok formation prioritaire');
    // et si le checkIfSelected n'est déclenché QUE à l'évènement onChange, réinitialiser l'affichage

    // ATTENTION pour réinitialiser
    // faudra faire un delete ici de socialData.center !!!!!

    // Début du chargement
    this.isLoading = true;

    // Récupération des centres contenant le sigle sélectionné pour les afficher
    // on pourrait en faire une méthode à part : displayRelatedCenters
    this.centersService.getCenters().subscribe({
      next: (data) => {
        console.log('Data récupérée dans checkIfSelected:', data);

        // Filtrage des centres basés sur le sigle
        this.dataFiltered = data.filter(center => center.sigles.includes(sigle));
        console.log("Données filtrées :", this.dataFiltered);

        // Arrêter le chargement dès que les données sont chargées
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des centres:', err);
        this.isLoading = false;  // Arrêter le chargement en cas d'erreur
      }
    })

  }


  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  onSubmitChoice(form: NgForm) {
    this.searchCenter(form.value.center.cp, form.value.center.name)
  }

  async searchCenter(cp: string, name: string) {
    const centerId = await this.centersService.getCenterIdByCpAndName(cp, name);
    if (centerId) {
      console.log('ID du centre trouvé:', centerId)
    }
    else {
      console.log('Aucun centre trouvé pour ces critères.')
    }

  }


  onCenterSelected(event: Event) {
    // Caster l'événement pour indiquer qu'il s'agit d'un <select>
    console.log('reste inchangé', this.priorTrade);

    const target = event.target as HTMLSelectElement;
    // alert(target.value)
    const centerData = target.value;
    console.log('ID:', centerData)
    // On peut maintenant utiliser cet ID pour d'autres actions
    this.onInputChange('center', centerData)
    console.log('reste inchangé 2', this.priorTrade);

  }

  // Méthode pour récupérer la dénomination du métier côté composant
  denominationMap: Map<string, Observable<string | null>> = new Map();



  getDenomination(trade: string): Observable<string | null> {
    if (!this.denominationMap.has(trade)) {
      // Appel au service pour obtenir la dénomination et transformation
      const denomination$ = this.settingsService.getDenomination(trade).pipe(
        map(denomination => {
          if (denomination) {
            // Supprimer tout ce qui suit la première parenthèse ouvrante " ("
            const index = denomination.indexOf(' (');
            return index !== -1 ? denomination.substring(0, index) : denomination;
          }
          return denomination;
        })
      );

      this.denominationMap.set(trade, denomination$);
    }
    return this.denominationMap.get(trade) || of(null);
  }

  // Méthode pour obtenir le texte selon la taille de l'écran
  getResponsiveText(city: string, mainCity?: string): string {
    const screenWidth = window.innerWidth;

    // Si l'écran est inférieur à 430px et que mainCity existe
    if (screenWidth <= 430 && mainCity && city !== mainCity) {
      return `Proche ${mainCity}`; // Affiche uniquement la mainCity
    }

    // Affiche city et mainCity si elles sont différentes
    return mainCity && city !== mainCity ? `${city} (Proche ${mainCity})` : city;
  }


  // private centerNameCache = new Map<string, Observable<string | undefined>>();
  // getCenterName(id: string): Observable<string | undefined> {
  //   // Si le nom du centre est déjà dans le cache, retourne l'Observable en cache
  //   if (this.centerNameCache.has(id)) {
  //     return this.centerNameCache.get(id)!;
  //   }

  //   // Sinon, interroge Firestore pour obtenir le nom du centre
  //   const centerName$ = this.centersService.getCenterName(id).pipe(
  //     map(name => name || 'Nom non trouvé')
  //   );

  //   // Ajoute l'Observable au cache
  //   this.centerNameCache.set(id, centerName$);

  //   return centerName$;
  // }

  // ATTENTION modification très critique
  private centerNameCache = new Map<string, Observable<string | undefined>>();

  // getCenterName(id: string): Observable<string | undefined> {
  //   // Si déjà en cache → retourne directement
  //   if (this.centerNameCache.has(id)) {
  //     return this.centerNameCache.get(id)!;
  //   }

  //   // Sinon, on récupère les données du centre complet
  //   const center$ = this.centersService.getCenterById(id).pipe(
  //     map(center => {
  //       if (!center) return 'Nom non trouvé';

  //       // ⚠️ Vérifie le status et alerte si inactif
  //       if (center.status === false) {
  //         console.warn(`⚠️ Centre "${center.name}" (id: ${id}) est inactif.`);
  //         // Tu peux aussi ici déclencher un toast / snackbar / message utilisateur
  //       }

  //       return center.name;
  //     })
  //   );

  //   // Mise en cache
  //   this.centerNameCache.set(id, center$);

  //   return center$;
  // }


  getCenterName(id: string): Observable<string | undefined> {
    // Si déjà en cache, renvoie directement
    if (this.centerNameCache.has(id)) {
      return this.centerNameCache.get(id)!;
    }

    // Observable principal du nom (ta logique initiale)
    const centerName$ = this.centersService.getCenterName(id).pipe(
      tap(() => {
        // 👇 Ici, on interroge Firestore une seule fois pour vérifier le status
        const docRef = doc(this.firestore, `centers/${id}`);
        getDoc(docRef).then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && data['status'] === false) {
              console.warn(`⚠️ Centre "${data['name']}" est inactif.`);
              // 👉 Ici faudrait aussi déclencher un toast / snackbar si besoin
              alert(`⚠️ Attention : le centre "${data['name']} ${data['cp']}" choisi par le candidat est désactivé. Si vous ne l'avez pas déjà inscrit en formation il vous faut absolument activer la fonction : Réinitialiser les choix du candidat`);
            }
          }
        }).catch((err) => console.error("Erreur lors de la vérification du status :", err));
      }),
      map(name => name || 'Nom non trouvé')
    );

    // Mise en cache
    this.centerNameCache.set(id, centerName$);
    return centerName$;
  }








  // print () {
  //   const contenu = document.getElementById('printForm')?.innerHTML || '';
  // // const originalContent = document.body.innerHTML;

  // document.body.innerHTML = contenu;
  // window.print();
  // // document.body.innerHTML = originalContent;
  // }



  print() {
    // Rendre tous les collapses visibles pour l'impression
    const collapses = document.querySelectorAll('.collapse');
    collapses.forEach((collapse) => collapse.classList.add('show'));

    // Lancer l'impression
    window.print();

    // Restaurer l'état initial après impression
    setTimeout(() => {
      collapses.forEach((collapse) => collapse.classList.remove('show'));
    }, 0);
  }


  scrollToSubmitButton() {
    if (this.submitButton) {
      this.submitButton.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }


  // Fonction pour déclencher la synthèse vocale
  // speakMessage(message: string) {
  //   const speech = new SpeechSynthesisUtterance(message);
  //   speech.lang = 'fr-FR'; // Langue française
  //   window.speechSynthesis.speak(speech);
  // }

  // Fonction pour personnaliser la voix


  checkFields() {
    if (!this.myForm) return;

    const { postalCode, address, phone } = this.myForm.value;

    // if (postalCode && address && phone && !this.audioPlayed) {
    //   this.audioPlayed = true; // On empêche de rejouer
    //   setTimeout(() => {
    //     this.playLocalMessage("employment.mp3");      
    //   }, 500); // Petit délai pour s'assurer que l'utilisateur est bien sorti du champ
    // }

    if (postalCode && address && phone) {
      this.playText("Merci d\'avoir fourni tous les renseignements relatifs à votre identité. Si vous êtes salarié, envoyé par votre entreprise, il faudra le préciser dans la section mon historique emploi")
    }

  }

  // speakMessage(message: string) {
  //   const synth = window.speechSynthesis;

  //   const setVoice = () => {
  //     const voices = synth.getVoices();
  //     const paulVoice = voices.find(voice => voice.name === 'Microsoft Julie - French (France)');

  //     const speech = new SpeechSynthesisUtterance(message);
  //     speech.voice = paulVoice || voices[0]; // Si Julie n'est pas trouvée, prendre une autre voix
  //     speech.lang = 'fr-FR';

  //     speech.rate = 1.3; // Vitesse (1 = normal, <1 = plus lent, >1 = plus rapide)
  //     speech.pitch = 1.2; // Hauteur (1 = normal, <1 = grave, >1 = aigu)
  //     speech.volume = 1; // Volume (0 = muet, 1 = max)

  //     synth.speak(speech);
  //   };

  //   if (synth.getVoices().length > 0) {
  //     setVoice();
  //   } else {
  //     synth.addEventListener("voiceschanged", setVoice);
  //   }
  // }



  // playLocalAudio() {
  //   const audio = new Audio("/assets/audio/introStudentForm.mp3");
  //   audio.play();
  // }

  // Méthode pour jouer un MP3 local en lui passant le nom d'un fichier
  // playLocalMessage(fileName: string) {
  //   const audio = new Audio(`/assets/audio/${fileName}`);
  //   audio.play();
  // } public playText(): void {
  //   const text = 'N\'oubliez pas de terminer et soumettre votre formulaire pour être contacté par un conseiller projet.';

  //   this.textToSpeechService.synthesizeSpeech(text).subscribe(
  //     (response) => {
  //       const audioContent = response.audioContent;
  //       const audio = new Audio('data:audio/mp3;base64,' + audioContent);
  //       audio.play();
  //     },
  //     (error) => {
  //       console.error('Erreur lors de la synthèse vocale:', error);
  //     }
  //   );
  // }



  public playText(text: string): void {
    // const text = 'N\'oubliez pas de terminer et soumettre votre formulaire pour être contacté par un conseiller projet.';

    if (!this.isReadOnly) {

      this.textToSpeechService.synthesizeSpeech(text).subscribe(
        (response) => {
          const audioContent = response.audioContent;
          const audio = new Audio('data:audio/mp3;base64,' + audioContent);
          audio.play();
        },
        (error) => {
          console.error('Erreur lors de la synthèse vocale:', error);
        }
      );
    }

  }


}




