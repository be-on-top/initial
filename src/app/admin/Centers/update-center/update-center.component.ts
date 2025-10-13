import { Component, OnInit } from '@angular/core';
import { Centers } from '../../centers';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CentersService } from '../../centers.service';
import { SettingsService } from '../../settings.service';


@Component({
  selector: 'update-edit-center',
  templateUrl: './update-center.component.html',
  styleUrls: ['./update-center.component.css']
})
export class UpdateCenterComponent implements OnInit {
  centerId!: string;
  center: Partial<Centers> = {};
  successMessage: string = '';
  errorMessage: string = '';

  // essai pour connecter la collection sigles au doc de centers
  sigleIds: string[] = []

  // pour les différents "types" de centre dont les valeurs sont des boléens on le rappel
  centerTypes = [
    { value: 'partner', label: 'Centre partenaire' },
    { value: 'subsidiary', label: 'Filiale' },
    { value: 'member', label: 'Adhérent' },
    { value: 'independent', label: 'Indépendant' }
  ];

  centerType?: string = ''

  constructor(
    private ac: ActivatedRoute,
    private router: Router,
    private service: CentersService,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.centerId = this.ac.snapshot.paramMap.get('id')!;
    this.service.getCenter(this.centerId).subscribe({
      next: (center) => {
        this.center = center;
        // ce qu'il en est du type du centre
        if (this.center.partner) this.centerType = 'partner';
        else if (this.center.subsidiary) this.centerType = 'subsidiary';
        else if (this.center.member) this.centerType = 'member';
        else if (this.center.independent) this.centerType = 'independent';

      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });

    console.log('this.center', this.center);

    this.fetchSigleIds()

  }

  // updateCenter(form: NgForm): void {
  //   if (form.valid && this.center) {
  //     const updatedCenter = { ...this.center, ...form.value };
  //     console.log('updatedCenter', updatedCenter);

  //     this.service.updateCenter(this.centerId, updatedCenter).subscribe({
  //       next: (response) => {
  //         this.successMessage = 'Centre mis à jour avec succès.';
  //         this.errorMessage = '';
  //       },
  //       error: (error) => {
  //         this.errorMessage = error.message;
  //         this.successMessage = '';
  //       }
  //     });
  //   } else {
  //     this.errorMessage = 'Veuillez remplir correctement le formulaire avant de soumettre.';
  //   }
  // }

  // optimisation 
  updateCenter(form: NgForm): void {
    if (form.valid && this.center) {
      const updatedCenter = { ...this.center, ...form.value };


      // 🔹 Réaffecter les booléens en fonction du type sélectionné
      ['partner', 'subsidiary', 'member', 'independent'].forEach(type => {
        updatedCenter[type] = (updatedCenter.centerType === type);
      });

      // 🔹 Supprimer centerType (si Firestore ne le stocke pas)
      delete updatedCenter.centerType;


      // 🔹 Supprimer les champs undefined pour éviter les erreurs Firestore
      const cleanedCenter = Object.fromEntries(
        Object.entries(updatedCenter).filter(([_, v]) => v !== undefined)
      );

      console.log('cleanedCenter', cleanedCenter);

      this.service.updateCenter(this.centerId, cleanedCenter).subscribe({
        next: () => {
          this.successMessage = 'Centre mis à jour avec succès.';
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.successMessage = '';
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir correctement le formulaire avant de soumettre.';
    }
  }



  fetchSigleIds() {
    this.settingsService.getSigleIds()
      .then((sigleIds) => {
        this.sigleIds = sigleIds
        // alert(sigleIds);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des IDs de documents :', error);
      });
  }

}
