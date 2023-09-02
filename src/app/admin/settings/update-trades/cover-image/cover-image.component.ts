import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'src/app/admin/settings.service';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
  listAll
} from '@angular/fire/storage';

@Component({
  selector: 'app-cover-image',
  templateUrl: './cover-image.component.html',
  styleUrls: ['./cover-image.component.css']
})
export class CoverImageComponent {
  tradeId: string = ''; // Assurez-vous que cette variable est initialisée avec la valeur appropriée
  imageUrl: string = ''; // Pour stocker l'URL de l'image
  imageFile: File | null = null; // Pour stocker la nouvelle image à télécharger

  constructor(
    private service: SettingsService,
    private ac: ActivatedRoute,
    private router: Router,
    private storage: Storage
  ) {}

  ngOnInit(): void {
    this.tradeId = this.ac.snapshot.params['id'];

    // Chargez l'URL de l'image existante si elle existe
    this.loadImage();
  }

// ...

loadImage() {
  const imageRef = ref(this.storage, 'images/trades/' + this.tradeId + '.jpeg');
  const rootRef = ref(this.storage); // Référence racine de Firebase Storage

  // Vérifiez d'abord si l'objet existe
  listAll(rootRef)
    .then((result) => {
      const itemRef = result.items.find((item) => item.name === imageRef.name);
      if (itemRef) {
        // L'image existe, obtenez l'URL
        getDownloadURL(itemRef)
          .then((url) => {
            this.imageUrl = url;
          })
          .catch((error) => {
            console.error("Erreur lors du chargement de l'image", error);
          });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la vérification de l'existence de l'objet", error);
    });
}

// ...


  detectFiles(event: any) {
    this.imageFile = event.target.files[0];
  }

// ...

// ...

updateImage() {
  if (this.imageFile) {
    const imageRef = ref(
      this.storage,
      'images/trades/' + this.tradeId + '.jpeg'
    );

    // Créez une référence racine
    const rootRef = ref(this.storage);

    // Vérifiez d'abord si l'objet existe
    listAll(rootRef)
      .then((result) => {
        const itemRef = result.items.find((item) => item.name === imageRef.name);
        if (itemRef) {
          // L'ancienne image existe, supprimez-la
          deleteObject(imageRef)
            .then(() => {
              // Téléchargez la nouvelle image
              const blobImage = this.imageFile as Blob;
              uploadBytes(imageRef, blobImage)
                .then(() => {
                  // Mettez à jour l'URL de l'image
                  getDownloadURL(imageRef)
                    .then((url) => {
                      this.imageUrl = url;
                      console.log("Image mise à jour avec succès.");
                    })
                    .catch((error) => {
                      console.error("Erreur lors de la récupération de l'URL de l'image mise à jour", error);
                    });
                })
                .catch((error) => {
                  console.error("Erreur lors du téléchargement de la nouvelle image", error);
                });
            })
            .catch((error) => {
              console.error("Erreur lors de la suppression de l'ancienne image", error);
            });
        } else {
          // L'ancienne image n'existe pas, téléchargez simplement la nouvelle image
          const blobImage = this.imageFile as Blob;
          uploadBytes(imageRef, blobImage)
            .then(() => {
              // Mettez à jour l'URL de l'image
              getDownloadURL(imageRef)
                .then((url) => {
                  this.imageUrl = url;
                  console.log("Image mise à jour avec succès.");
                })
                .catch((error) => {
                  console.error("Erreur lors de la récupération de l'URL de l'image mise à jour", error);
                });
            })
            .catch((error) => {
              console.error("Erreur lors du téléchargement de la nouvelle image", error);
            });
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la vérification de l'existence de l'objet", error);
      });
  } else {
    console.error("Aucune nouvelle image sélectionnée.");
  }
}

// ...


// ...

}
