import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarketingDocService } from '../marketing-doc.service';
import { AuthGuardService } from 'src/app/auth-guard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { docData } from '@angular/fire/firestore';

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
    private authService: AuthGuardService,  // 🔹 mon auth existant,
    private route: ActivatedRoute,   // ✅ AJOUT
    private router:Router
  ) { }

  ngOnInit(): void {
    // this.initMode();
    // this.initForm();
    // this.setExistingFile();
    this.checkAdminRights();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // 🔥 MODE EDIT
      this.isEditMode = true;

      const docRef = this.service.getMarketingDocById(id);

      docData(docRef, { idField: 'id' }).subscribe((doc: any) => {
        this.existingDoc = doc;

        // ⚠️ IMPORTANT → reconstruire le form avec les données
        this.initForm();
        this.setExistingFile();
      });

    } else {
      // ✅ MODE CREATE
      this.initMode();
      this.initForm();
    }
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
    .then(() => {
      console.log('✅ CREATE OK');
      this.router.navigate(['/admin/marketing-docs-list']); // 👈 redirection
    })
    .catch(err => console.error('❌ CREATE ERROR', err));
}


  /**
   * Mise à jour d’un document
   */
  private updateDoc(formData: any): void {
    console.log('🔥 updateDoc appelé', formData);

    if (!this.existingDoc?.id) {
      console.error('❌ ID manquant pour la mise à jour');
      return;
    }

    this.service.saveMarketingDoc(formData, this.existingDoc.id)
      .then(() => {
        console.log('✅ UPDATE OK')
        this.router.navigate(['/admin/marketing-docs-list'])
      })
      .catch(err => console.error('❌ UPDATE ERROR', err));
  }

  /**
   * Annulation (reset ou navigation)
   */
  onCancel(): void {
    this.marketForm.reset();
    this.selectedFile = null;
  }
}