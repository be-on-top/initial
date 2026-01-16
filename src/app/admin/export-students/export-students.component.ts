import { Component } from '@angular/core';
import { StudentsExportService } from '../students-export.service';

@Component({
  selector: 'app-export-students',
  templateUrl: './export-students.component.html'
})
export class ExportStudentsComponent {

  exporting = false;
  error: string | null = null;

  constructor(private exportService: StudentsExportService) {}

  export(): void {
    this.exporting = true;
    this.error = null;

    this.exportService.exportStudentsToCSV().subscribe({
      next: () => {
        this.exporting = false;
      },
      error: () => {
        this.exporting = false;
        this.error = 'Une erreur est survenue lors de l\'export.';
      }
    });
  }
}
