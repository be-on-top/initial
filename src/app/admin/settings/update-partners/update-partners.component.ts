import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../settings.service';
import { NgForm, } from '@angular/forms';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-update-partners',
  templateUrl: './update-partners.component.html',
  styleUrls: ['./update-partners.component.css']
})
export class UpdatePartnersComponent implements OnInit {
  partnerId!: string;
  partner: any = {
    name: '',
    description: '',
    url: '',
    logoUrl: ''
  };

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  feedbackMessages: string = '';
  isSuccessMessage: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SettingsService // Remplacer par le nom exact de votre service
  ) {}

  ngOnInit(): void {
    // Récupération de l'ID passé dans l'URL (/admin/updateSettings/:id)
    this.partnerId = this.route.snapshot.paramMap.get('id') || '';

    if (this.partnerId) {
      this.loadPartnerData();
    }
  }

  loadPartnerData(): void {
    // Récupère la liste complète des partenaires (ou un getter individuel si le service en a un)
    this.service.fetchPartners().subscribe((partners: any[]) => {
      const found = partners.find((p: any) => p.id === this.partnerId || p.id == this.partnerId);
      if (found) {
        this.partner = { ...found };
        this.previewUrl = this.partner.logoUrl || null;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updatePartner(form: NgForm): void {
    if (form.valid) {
      const updatedData = {
        id: this.partnerId,
        name: this.partner.name,
        description: this.partner.description,
        url: this.partner.url,
        logoUrl: this.partner.logoUrl || ''
      };

      const submitUpdate = (finalPartner: any) => {
        // Envoi au service pour enregistrer la modification
        // Adapter le nom de la méthode selon la signature exacte dans votre service (ex: updatePartner ou updateSettings)
        this.service.updatePartner(finalPartner).subscribe({
          next: () => {
            this.feedbackMessages = 'Partenaire mis à jour avec succès';
            this.isSuccessMessage = true;
            // Redirection ou retour après mise à jour si souhaité :
            // this.router.navigate(['/admin/settings']);
          },
          error: (err) => {
            console.error('Erreur mise à jour :', err);
          }
        });
      };

      // Si un nouveau fichier image a été sélectionné, on le téléverse d'abord
      if (this.selectedFile) {
        this.service.uploadPartnerWithLogo(updatedData, this.selectedFile).subscribe({
          next: (partnerWithLogo) => submitUpdate(partnerWithLogo),
          error: (err) => console.error('Erreur upload :', err)
        });
      } else {
        submitUpdate(updatedData);
      }
    }
  }
}
