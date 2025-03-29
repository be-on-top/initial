import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";

// Initialisation de Firebase Admin SDK
admin.initializeApp();

const API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
const API_KEY = "AIzaSyC1JZ5h0pXszJkM-1PbUZXiXI6z436rOLI";

// Définition de la fonction Cloud Function
export const synthesizeSpeech = onRequest(async (req, res) => {
  try {
    const {text} = req.body;

    if (!text) {
      res.status(400).json({error: "Le texte est requis"});
      return;
    }

    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      input: {text},
      voice: {
        languageCode: "fr-FR",
        name: "fr-FR-Wavenet-D",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.9,
        pitch: 4.0,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Erreur Text-to-Speech:", error);
    res.status(500).json({error: "Erreur lors de la synthèse vocale"});
  }
});
