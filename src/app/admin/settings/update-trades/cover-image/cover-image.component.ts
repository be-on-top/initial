import { Component, Input } from '@angular/core';
// import { NgForm } from '@angular/forms';
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
  @Input()tradeId:string=""
  // tradeId: string = ''; // S'assurer que cette variable est initialisée avec la valeur appropriée
  imageUrl: string = ''; // Pour stocker l'URL de l'image
  imageFile: File | null = null; // Pour stocker la nouvelle image à télécharger
  imageSelected = false; // Pour conditionner l'affichage du message d'erreur

  constructor(
    private service: SettingsService,
    private ac: ActivatedRoute,
    private router: Router,
    private storage: Storage
  ) {}

  ngOnInit(): void {
    this.tradeId = this.ac.snapshot.params['id'];

    // Charge l'URL de l'image existante si elle existe
    this.loadImage();
  }

// ...

loadImage() {
  const imageRef = ref(this.storage, 'images/trades/' + this.tradeId + '.jpeg');
  const rootRef = ref(this.storage); // Référence racine de Firebase Storage

  // // Vérifie d'abord si l'objet existe
  // listAll(rootRef)
  //   .then((result) => {
  //     const itemRef = result.items.find((item) => item.name === imageRef.name);
  //     if (itemRef) {
  //       // L'image existe, obtenir l'URL
  //       getDownloadURL(itemRef)
  //         .then((url) => {
  //           this.imageUrl = url;
  //         })
  //         .catch((error) => {
  //           console.error("Erreur lors du chargement de l'image", error);
  //         });
  //     }
  //   })
  //   .catch((error) => {
  //     console.error("Erreur lors de la vérification de l'existence de l'objet", error);
  //   });

  getDownloadURL(imageRef).then(
    (url) => {
      // L'image existe, mettez à jour l'URL
      this.imageUrl = url;
    }).catch(
    (error) => {
      // L'image n'existe pas, gérez les erreurs ici
      console.error('Erreur lors du chargement de l\'image', error);
    }
  );


}

// ...

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
    const imageRef = ref(
      this.storage,
      'images/trades/' + this.tradeId + '.jpeg'
    );

    // Crée une référence racine
    const rootRef = ref(this.storage);

    // Vérifiez d'abord si l'objet existe
    listAll(rootRef)
      .then((result) => {
        const itemRef = result.items.find((item) => item.name === imageRef.name);
        if (itemRef) {
          // L'ancienne image existe, la supprimer
          deleteObject(imageRef)
            .then(() => {
              // Télécharger la nouvelle image
              const blobImage = this.imageFile as Blob;
              uploadBytes(imageRef, blobImage)
                .then(() => {
                  // Mettre à jour l'URL de l'image
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
          // L'ancienne image n'existe pas, télécharger simplement la nouvelle image
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

}
