import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-share-button',
  templateUrl: './share-button.component.html',
  styleUrls: ['./share-button.component.css']
})
export class ShareButtonComponent {

  isWebShareSupported: boolean = false;
  @Input() imageUrl: string=''; // Définir une propriété @Input() pour recevoir l'URL de l'image

  constructor() {
    
  }


  ngOnInit(): void {
    // Vérifie si l'API Web Share est supportée par le navigateur
    // La double négation (!!) convertit la valeur en un booléen (true ou false)
    this.isWebShareSupported = !!navigator.share;

  }

  // Méthode pour partager du contenu en utilisant l'API Web Share
  share() {
    // Vérifie si l'API Web Share est disponible
    if (navigator.share) {
      // Appelle l'API Web Share avec les détails du partage
      navigator.share({
        title: 'BE-ON-TOP Application : Page métier', // Titre du contenu à partager
        text: 'Découvrez cette page métier et démarrer rapidement votre formation', // Texte à partager
        url: window.location.href, // URL de la page actuelle
        
      })
      .then(() => {
        // Si le partage réussit, affiche un message dans la console
        console.log('Partage réussi');
      })
      .catch((error) => {
        // Si une erreur se produit lors du partage, affiche l'erreur dans la console
        console.error('Erreur de partage:', error);
      });
    } else {
      // Si l'API Web Share n'est pas supportée, affiche un message dans la console
      console.log('Le partage Web n\'est pas supporté sur ce navigateur.');
    }
  }

  // share() {
  //   if (navigator.share && this.imageUrl) {
  //     fetch(this.imageUrl)
  //       .then(response => {
  //         if (!response.ok) {
  //           throw new Error('Erreur lors du chargement de l\'image');
  //         }
  //         return response.blob();
  //       })
  //       .then(blob => {
  //         const file = new File([blob], 'image.jpg', { type: blob.type });
  //         navigator.share({
  //           files: [file],
  //           title: 'Titre du contenu',
  //           text: 'Description du contenu'
  //         }).then(() => {
  //           console.log('Partage réussi');
  //         }).catch((error) => {
  //           console.error('Erreur de partage :', error);
  //         });
  //       })
  //       .catch(error => {
  //         console.error('Erreur de chargement de l\'image :', error);
  //       });
  //   } else {
  //     console.log('La fonction de partage ou l\'URL de l\'image ne sont pas supportées.');
  //   }
  // }


 

}
