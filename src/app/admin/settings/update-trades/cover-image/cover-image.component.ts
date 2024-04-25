import { Component, Input } from '@angular/core';
// import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'src/app/admin/settings.service';

@Component({
  selector: 'app-cover-image',
  templateUrl: './cover-image.component.html',
  styleUrls: ['./cover-image.component.css']
})
export class CoverImageComponent {
  @Input() tradeId: string = ""
  // tradeId: string = ''; // S'assurer que cette variable est initialisée avec la valeur appropriée
  imageUrl: string = ''; // Pour stocker l'URL de l'image
  imageFile: File | null = null; // Pour stocker la nouvelle image à télécharger
  imageSelected = false; // Pour conditionner l'affichage du message d'erreur
  imageUrlReduced: string = '';
  // resizedImageUrl:string = '';

  constructor(
    private service: SettingsService,
    private ac: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.tradeId = this.ac.snapshot.params['id'];

    // Charge les URLs des deux versions de l'image
    this.service.loadImage(this.tradeId).then(({ originalUrl, resizedUrl }) => {
      this.imageUrl = originalUrl;
      this.imageUrlReduced = resizedUrl;
    }).catch((error) => {
      if (error.code === 'storage/object-not-found') {
        console.log('Aucune image n\'a encore été ajoutée.');
      } else {
        console.error('Erreur lors du chargement de l\'image', error);
      }
    });

  }

  // comme pour les questionnaires, j'intercepte l'image pour évaluer le poids
  detectFiles(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Vérifie le poids du fichier par rapport au poids maximal autorisé (en octets)
      const maxSizeInBytes = 10 * 1024 * 1024; // Par exemple, 10 Mo
      if (file.size <= maxSizeInBytes) {
        this.imageFile = file;
        this.imageSelected = true; // Si une image est sélectionnée
      } else {
        // Le fichier est trop volumineux, affiche un message d'erreur
        console.error("Le fichier est trop volumineux. La taille maximale autorisée est de 10 Mo.");
        this.imageFile = null;
      }
    }
  }

  // ...

  updateImage() {
    if (this.imageFile) {
      this.service.updateTradeImage(this.tradeId, this.imageFile)
        .then((urls: string[]) => {
          // Mise à jour de l'URL de l'image dans le composant
          this.imageUrl = urls[0];
          this.imageUrlReduced = urls[1]
          console.log('Image mise à jour avec succès.');
        })
        .catch((error) => {
          if (error.code === 'storage/object-not-found') {
            // L'image n'existe pas, gérer le cas ici sans générer de sortie de console indésirable
            console.log('Aucune image n\'a encore été ajoutée.');
          } else {
            // Gérer d'autres erreurs ici
            console.error('Erreur lors du chargement de l\'image', error);
          }
        })
    }
  }
}
