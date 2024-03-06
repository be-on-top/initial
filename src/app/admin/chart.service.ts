import { Injectable } from '@angular/core';
import { Evaluation } from './evaluation';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }



  getfirstCpForGraph(relatedResult:[]) {
    // if (subscriptions) {
    //   for (const iterator of subscriptions) {
    //     console.log("iterator to getFirstCpForGraph", iterator);

    //     if (this.student && this.student["quizz_" + iterator]['fullResults']) {
    //       console.log('this.student[trade]', this.student["quizz_" + iterator]['fullResults']);
    //       const relatedResult = this.student["quizz_" + iterator]['fullResults']
    //       console.log('relatedResult', relatedResult)

          const simplifiedObject: { [key: string]: number } = relatedResult.reduce((acc: any, entry: any) => {
            for (const key in entry) {
              if (entry.hasOwnProperty(key)) {
                const notation = entry[key]?.notation;
                if (notation !== undefined) {
                  // Appliquer la logique de mapping ici
                  let niveau: number;

                  if (notation < 10) {
                    niveau = 1;
                  } else if (notation <= 15) {
                    niveau = 2;
                  } else {
                    niveau = 3;
                  }

                  // Assigner le niveau au lieu de la notation
                  acc[key] = niveau;
                }
              }
            }
            return acc;
          }, {});

          console.log('Simplified Object:', simplifiedObject);
        }


  getSecundCpForGraph(evaluations:Record<string, Evaluation> = {}) {

    // Créer un objet pour mapper les compétences aux niveaux
    const niveauMapping: { [key: string]: string | undefined } = {};


    // Parcourir les évaluations pour remplir le mapping
    for (const evaluation of Object.values(evaluations)) {
      // Extraire la clé de compétence (CP1, CP2, etc.)
      const competenceKey = evaluation.competence;

      // Vérifier si competenceKey est défini et n'est pas vide
      if (competenceKey) {
        // const competence: any = competenceKey.split('_')[1];
        const competence: any = competenceKey.substring(competenceKey.lastIndexOf('_') + 1);
        const level = evaluation.level;

        // Utiliser ! pour indiquer à TypeScript que competence n'est pas nulle
        if (competence !== undefined
        ) {

          niveauMapping[competence!] = level;
        }
      }
    }

    // Simplifier l'objet en utilisant le mapping des niveaux
    const simplifiedObject: { [key: string]: number } = {};
    for (const competence in niveauMapping) {
      if (niveauMapping.hasOwnProperty(competence)) {
        // Appliquer la logique de mapping ici (beginner: 1, intermediate: 2, advance: 3, etc.)
        let niveau: number;

        switch (niveauMapping[competence]) {
          case 'beginner':
            niveau = 1;
            break;
          case 'intermediate':
            niveau = 2;
            break;
          case 'advance':
            niveau = 3;
            break;
          default:
            niveau = 0; // Valeur par défaut ou logique supplémentaire si nécessaire
        }

        // Assigner le niveau au lieu de la notation
        simplifiedObject[competence] = niveau;
      }
    }

    console.log('Simplified Object 2:', simplifiedObject);

  }

  getThirdCpForGraph(tutorials:Record<string, Evaluation> = {}) {

    // Créer un objet pour mapper les compétences aux niveaux
    const niveauMapping: { [key: string]: string | undefined } = {};

    // Parcourir les évaluations pour remplir le mapping
    for (const tutorial of Object.values(tutorials)) {
      // Extraire la clé de compétence (CP1, CP2, etc.)
      const competenceKey = tutorial.competence;

      // Vérifier si competenceKey est défini et n'est pas vide
      if (competenceKey) {
        // const competence: any = competenceKey.split('_')[1];
        const competence: any = competenceKey.substring(competenceKey.lastIndexOf('_') + 1);
        const level = tutorial.level;

        // Utiliser ! pour indiquer à TypeScript que competence n'est pas nulle
        if (competence !== undefined
        ) {

          niveauMapping[competence!] = level;
        }
      }
    }


    // Simplifier l'objet en utilisant le mapping des niveaux
    const simplifiedObject: { [key: string]: number } = {};
    for (const competence in niveauMapping) {
      if (niveauMapping.hasOwnProperty(competence)) {
        // Appliquer la logique de mapping ici (beginner: 1, intermediate: 2, advance: 3, etc.)
        let niveau: number;

        switch (niveauMapping[competence]) {
          case 'beginner':
            niveau = 1;
            break;
          case 'intermediate':
            niveau = 2;
            break;
          case 'advance':
            niveau = 3;
            break;
          case 'pro':
            niveau = 4;
            break;
          default:
            niveau = 0; // Valeur par défaut ou logique supplémentaire si nécessaire
        }

        // Assigner le niveau au lieu de la notation
        simplifiedObject[competence] = niveau;
      }
    }

    console.log('Simplified Object 3:', simplifiedObject);

  }


}
