import { onRequest } from "firebase-functions/v2/https";  // Importation de la fonction https.onRequest
import * as admin from "firebase-admin";  // Firebase Admin SDK pour accéder aux services Firebase
import axios from "axios";  // Axios pour faire des requêtes HTTP

// Initialisation de Firebase Admin SDK
admin.initializeApp();

const API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
const API_KEY = "AIzaSyC1JZ5h0pXszJkM-1PbUZXiXI6z436rOLI"; // Remplacez par votre vraie clé API

// Définition de la fonction Cloud Function
export const synthesizeSpeech = onRequest(async (req, res): Promise<void> => {
    try {
        const { text } = req.body; // Récupère le texte envoyé par le client

        // Vérifie que le texte est bien fourni
        if (!text) {
            res.status(400).json({ error: "Le texte est requis" }); // Réponse d'erreur si texte absent
            return;  // Retourner ici pour sortir de la fonction
        }

        // Prépare la requête à l'API Google Text-to-Speech
        const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
            input: {text},
            voice: {
                languageCode: "fr-FR",
                name: "fr-FR-Wavenet-D"
            },
            audioConfig: {
                audioEncoding: "MP3",
                speakingRate: 0.9,
                pitch: 4.0
            }
        });

        // Retourne la réponse à la requête
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Text-to-Speech:", error);
        res.status(500).json({ error: "Erreur lors de la synthèse vocale" });
    }
});

