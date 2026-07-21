import { NgForm } from '@angular/forms';
import { NewsService } from '../news.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { News } from '../news';

@Component({
  selector: 'app-admin-news-edit',
  templateUrl: './admin-news-edit.component.html',
  styleUrls: ['./admin-news-edit.component.css']
})
export class AdminNewsEditComponent implements OnInit {

  // 🧩 Modèle utilisé par le formulaire (création / édition)
  news: News = {
    title: '',
    content: '',
    heroImage: '',
    status: 'draft'
  };

  // 📌 ID de la news (présent uniquement en mode édition)
  id: string | null = null;

  // ⏳ Flag de chargement (désactive le bouton / UX)
  loading = false;

  constructor(
    private route: ActivatedRoute,   // 🔗 accès aux paramètres de route (/edit/:id)
    private newsService: NewsService, // 🔥 service Firestore + Storage
    private router: Router            // 🧭 navigation après action
  ) { }

  ngOnInit() {
    // 🔍 Récupération de l'ID depuis l'URL
    this.id = this.route.snapshot.paramMap.get('id');

    // ✏️ Si ID présent → mode édition → on charge la news existante
    if (this.id) {
      this.newsService.getOne(this.id).subscribe(n => {
        if (n) this.news = n; // hydrate le form avec les données
      });
    }
  }

  // 💾 Sauvegarde (create ou update)
  async save(form: NgForm) {

    // 🚫 Stop si formulaire invalide
    if (form.invalid) return;

    // 🛑 VERROU DE SÉCURITÉ : On limite à une seule image maximum dans le corps de l'article
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.news.content, 'text/html');
    const imagesInContent = doc.querySelectorAll('img');

    if (imagesInContent.length > 1) {
      alert("⚠️ Sécurité : Vous ne pouvez pas ajouter plus d'une seule image à l'intérieur du texte de l'article.");
      return; // On coupe court, rien n'est envoyé à Firebase !

    }

    this.loading = true;

    if (this.id) {
      // ✏️ UPDATE
      await this.newsService.update(this.id, this.news);
    } else {
      // ➕ CREATE
      await this.newsService.create(this.news);
    }

    this.loading = false;

    // 🔙 Retour à la liste admin
    this.router.navigate(['/admin/news']);
  }

  // 🖼️ Upload image vers Firebase Storage
  // onFileSelected(event: any) {

  //   const file: File = event.target.files[0];
  //   if (!file) return;

  //   this.loading = true;

  //   // 📤 Upload → récupération URL publique
  //   this.newsService.uploadImage(file).then(url => {

  //     // 🔗 On stocke l'URL dans le modèle (sera sauvegardé en Firestore)
  //     this.news.heroImage = url;

  //     this.loading = false;
  //   });
  // }

  // 🖼️ Upload image de Héros vers Firebase Storage (Optimisée & Convertie)
// 🖼️ 1. AUTOMATISATION ET AJUSTEMENT DU HÉROS
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.loading = true;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200; // Largeur idéale pour une bannière responsive
        const canvas = document.createElement('canvas');
        let scale = 1;

        if (img.width > maxWidth) {
          scale = maxWidth / img.width;
        }

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 🪄 LE COMPROMIS HÉROS : Qualité poussée à 0.93 (avec perte optimisée)
        // Pour une grande photo de couverture, cela élimine les "vagues" de compression 
        // autour des détails sans faire exploser le poids du fichier sur mobile.
        canvas.toBlob((blob) => {
          if (!blob) {
            this.loading = false;
            return;
          }

          const optimizedFile = new File([blob], 'hero-' + Date.now() + '.webp', { type: 'image/webp' });

          this.newsService.uploadImage(optimizedFile).then(url => {
            this.news.heroImage = url;
            this.loading = false;
          }).catch(err => {
            alert("Erreur lors de l'upload de la bannière");
            this.loading = false;
          });
          
        }, 'image/webp', 0.95); // 🎯 Ajusté ici à 0.93 au lieu de 0.9
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }


  onFilePicker = (callback: any, value: any, meta: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/webp'; // 🔥 filtre OS

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      // 🔥 sécurité réelle (pas juste extension)
      if (file.type !== 'image/webp') {
        alert('Seules les images WEBP sont autorisées');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        callback(reader.result, { title: file.name });
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }

editorConfig = {
    // 🛠️ Ajout du plugin 'link'
    plugins: 'lists image emoticons link',
    
    // 🛠️ ÉTAPE 1 : On désactive complètement le menu du haut
    menubar: false, 

    // 🛠️ Barre d'outils avec 'link unlink'
    toolbar: 'undo redo | blocks | bold italic | link unlink | blockquote | emoticons | image | hr | bullist numlist',

    block_formats: 'Paragraphe=p; Titre 2=h2',
    images_file_types: 'webp',
    file_picker_types: 'image',

    // 🔒 SÉCURITÉ : On autorise 'blockquote' ET la balise 'a' avec ses attributs
    forced_root_block: 'p',
    valid_elements: 'p,br,strong,em,span,h2,h3,ul,ol,li,hr,blockquote,img[src|alt|width|height|loading],a[href|target|rel|title]',

    // 🔗 AUTOMATISATION DES LIENS EXTERNES
    link_assume_external_targets: 'https',
    // Dès qu'un lien ouvre dans une nouvelle fenêtre (target="_blank"), TinyMCE ajoute rel="nofollow relnoopener"
    link_rel_policies: [
      { target: '_blank', rel: 'nofollow' }
    ],

    // 🔒 VERROUILLAGE DES IMAGES
    image_dimensions: false, 
    image_caption: false,    
    inline_styles: false,    

    // 1️⃣ GÈRE LE GLISSER-DÉPOSER (Votre code exact)
    images_upload_handler: (blobInfo: any) => {
      return new Promise<string>(async (resolve, reject) => {
        try {
          this.loading = true;
          const file = blobInfo.blob();
          const storageUrl = await this.newsService.uploadImage(file);
          resolve(storageUrl); 
        } catch (error) {
          reject("Échec de l'upload de l'image");
        } finally {
          this.loading = false;
        }
      });
    },

    // 2️⃣ GÈRE LE BOUTON IMAGE (Votre code exact)
    file_picker_callback: (callback: any, value: any, meta: any) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/webp, image/png, image/jpeg'; 

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const img = new Image();
          img.onload = () => {
            const maxWidth = 650; 
            const canvas = document.createElement('canvas');
            let scale = 1;

            if (img.width > maxWidth) {
              scale = maxWidth / img.width;
            }

            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
              if (!blob) return;
              
              const originalName = file.name.replace(/\.[^/.]+$/, "");
              const resizedFile = new File([blob], originalName + '-' + Date.now() + '.webp', { type: 'image/webp' });

              try {
                this.loading = true;
                const storageUrl = await this.newsService.uploadImage(resizedFile);
                callback(storageUrl, { title: file.name }); 
              } catch (error) {
                alert("Erreur lors de l'envoi de l'image");
              } finally {
                this.loading = false;
              }
            }, 'image/webp', 1.0); 
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }
  };


}