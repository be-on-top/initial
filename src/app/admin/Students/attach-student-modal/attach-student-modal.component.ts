import { Component, EventEmitter, Output } from '@angular/core';
import { StudentsService } from '../../students.service';

@Component({
  selector: 'app-attach-student-modal',
  templateUrl: './attach-student-modal.component.html'
})
export class AttachStudentModalComponent {

  @Output() candidateAttached = new EventEmitter<void>();

  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private studentService: StudentsService) {}

  // 🎯 Ajout des deux paramètres attendus par le template
  async onSubmit(email: string, inputElement: HTMLInputElement): Promise<void> {
    if (!email || !email.trim()) {
      this.errorMessage = 'Veuillez saisir une adresse e-mail.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      await this.studentService.attachStudentByEmail(email);
      
      this.successMessage = `Le candidat (${email}) vous a été rattaché avec succès.`;
      inputElement.value = ''; // Réinitialise le champ d'entrée HTML
      this.candidateAttached.emit();

    } catch (err: any) {
      this.errorMessage = err.message || 'Une erreur est survenue.';
    } finally {
      this.loading = false;
    }
  }
}