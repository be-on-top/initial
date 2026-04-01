import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarketingDocService } from '../marketing-doc.service';
import { AuthGuardService } from 'src/app/auth-guard.service';

/**
 * Interface pour typer un document marketing
 */
interface MarketDoc {
  id?: string;
  title: string;
  comment?: string;
  fileUrl?: string;
}

@Component({
  selector: 'app-market-doc-form',
  templateUrl: './market-doc-form.component.html'
})
export class MarketDocFormComponent implements OnInit {

  /**
   * Si présent → mode édition
   * Si null → mode création
   */
  @Input() existingDoc: MarketDoc | null = null;

  /** Formulaire principal */
  marketForm!: FormGroup;

  /** Fichier sélectionné pour upload */
  selectedFile: File | null = null;

  /** Flag pour savoir si on édite ou crée */
  isEditMode = false;

  /** URL du fichier existant (en édition) */
  existingFileUrl: string = '';

  /** Qui est authentifié */
  isUserAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private service: MarketingDocService,
    private authService: AuthGuardService  // 🔹 mon auth existant
  ) { }

  ngOnInit(): void {
    this.initMode();
    this.initForm();
    this.setExistingFile();
    this.checkAdminRights();
  }

  private checkAdminRights(): void {
    this.isUserAdmin = !!this.authService.user;

    if (!this.isUserAdmin) {
      alert('Vous devez être connecté pour effectuer cette action.');
    }
  }


  /**
   * Détermine si on est en mode édition
   */
  private initMode(): void {
    this.isEditMode = !!this.existingDoc;
  }

  /**
   * Initialise le formulaire avec ou sans données existantes
   */
  private initForm(): void {
    this.marketForm = this.fb.group({
      title: [
        this.existingDoc?.title || '',
        Validators.required
      ],
      comment: [
        this.existingDoc?.comment || ''
      ]
    });
  }

  /**
   * Récupère l'URL du fichier existant (si édition)
   */
  private setExistingFile(): void {
    if (this.isEditMode && this.existingDoc?.fileUrl) {
      this.existingFileUrl = this.existingDoc.fileUrl;
    }
  }

  /**
   * Gestion de la sélection de fichier
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    if (!this.isUserAdmin) return;  // bloque les non-admins
    if (this.marketForm.invalid) return;

    const formData = {
      ...this.marketForm.value,
      file: this.selectedFile
    };

    if (this.isEditMode) {
      this.updateDoc(formData);
    } else {
      this.createDoc(formData);
    }
  }

  /**
   * Création d’un document
   */
  private createDoc(formData: any): void {
    console.log('🔥 createDoc appelé', formData);

    this.service.saveMarketingDoc(formData)
      .then(() => console.log('✅ SAVE OK'))
      .catch(err => console.error('❌ SAVE ERROR', err));

  }

  /**
   * Mise à jour d’un document
   */
  private updateDoc(formData: any): void {
    console.log('Mise à jour document marketing', formData);
    // TODO: appeler service.updateDoc(this.existingDoc?.id, formData)
  }

  /**
   * Annulation (reset ou navigation)
   */
  onCancel(): void {
    this.marketForm.reset();
    this.selectedFile = null;
  }
}