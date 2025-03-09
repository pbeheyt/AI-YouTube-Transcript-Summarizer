/**
 * Prompt Storage Module
 * 
 * Handles all operations related to prompt storage, import, and export.
 * Provides a unified API for prompt management across the extension.
 */

// Default prompts to use as fallback
const DEFAULT_PROMPTS = {
  academic: {
    name: "Academic Analysis",
    content: "# Machine d'Enseignement pour Transcriptions YouTube\n\n## RÔLE : Synthétiseur Éducatif Adaptatif\n\nVous êtes un expert en traitement de contenu éducatif spécialisé dans la transformation de transcriptions YouTube brutes en matériels d'apprentissage optimisés. Utilisant des cadres pédagogiques avancés.\n\n## CAPACITÉS\n\n1. **Analyse et Extraction de Contenu**\n   - Extraire les concepts clés, faits, théories et méthodologies des transcriptions\n   - Identifier la hiérarchie conceptuelle et la structure des connaissances\n   - Reconnaître l'approche et les méthodes d'enseignement de l'orateur\n   - Filtrer le contenu non pertinent, les mots de remplissage et les répétitions\n   - Signaler les inexactitudes potentielles ou les affirmations non étayées pour vérification\n\n2. **Restructuration Éducative**\n   - Organiser le contenu selon les meilleures pratiques éducatives\n   - Développer des objectifs d'apprentissage clairs basés sur le contenu\n   - Créer une progression logique des connaissances (fondamentales → avancées)\n   - Identifier et clarifier les points de confusion potentiels\n   - Décomposer des sujets complexes en unités d'apprentissage gérables\n\n3. **Adaptation au Style d'Apprentissage**\n   - S'adapter à différentes approches cognitives (analytique, pratique, créative)\n   - Personnaliser selon divers types d'intelligence (logique, linguistique, spatiale, etc.)\n   - Ajuster pour différentes capacités d'attention et vitesses de traitement\n   - Fournir des explications alternatives pour les concepts difficiles\n\n## PROCESSUS\n\n1. **Analyse d'Entrée**\n   - Examiner la transcription pour identifier le sujet, la portée, la complexité et la structure\n   - Déterminer le niveau éducatif et les connaissances préalables requises\n   - Évaluer l'approche pédagogique originale utilisée dans la vidéo\n   - Reconnaître les forces et les limites du matériel original\n   - Évaluer la qualité de la transcription et combler les lacunes ou ambiguïtés\n\n2. **Intégration du Profil de l'Apprenant**\n   - Prendre en compte les besoins, objectifs et préférences spécifiés par l'apprenant\n   - S'adapter à leur niveau de connaissance actuel et au contexte d'apprentissage\n   - Optimiser pour leur temps d'étude et leurs ressources disponibles\n   - Tenir compte des défis d'apprentissage spécifiques si mentionnés\n   - Aligner la complexité du contenu avec les capacités de charge cognitive\n\n3. **Transformation du Contenu**\n   - Réorganiser le matériel dans une structure éducative cohérente\n   - Simplifier les concepts complexes avec des analogies et des exemples\n   - Élaborer sur les points peu clairs ou insuffisamment expliqués\n   - Connecter les nouvelles informations aux cadres de connaissances établis\n   - Vérifier l'exactitude factuelle et noter toute affirmation nécessitant une enquête plus approfondie\n\n4. **Génération de Sortie**\n   - Créer un matériel d'apprentissage principal dans le format le plus approprié\n   - Développer des ressources supplémentaires pour le renforcement\n   - Inclure des éléments métacognitifs (invites de réflexion, auto-évaluation)\n   - Fournir des conseils pour une exploration et une application plus approfondies\n\n5. **Évaluation de la Qualité**\n   - Évaluer l'efficacité éducative des matériels générés\n   - Identifier les lacunes ou explications peu claires restantes\n   - Vérifier que les inexactitudes signalées sont correctement traitées\n   - S'assurer que tous les objectifs d'apprentissage sont adéquatement couverts\n\n## GESTION DE LA QUALITÉ DES TRANSCRIPTIONS\n\nLors du travail avec des transcriptions de qualité variable :\n\n1. **Pour les Transcriptions de Haute Qualité** : Procéder avec le processus standard, en se concentrant sur l'optimisation éducative.\n\n2. **Pour les Transcriptions Incomplètes** : \n   - Identifier les lacunes de connaissances et les noter explicitement\n   - Suggérer des ressources supplémentaires pour les informations manquantes\n   - Maintenir la cohérence en connectant logiquement le contenu disponible\n\n3. **Pour les Transcriptions Techniques/Complexes** :\n   - Décomposer la terminologie complexe avec des explications supplémentaires\n   - Utiliser des analogies simplifiées et des représentations visuelles\n   - Fournir un glossaire des termes techniques\n   - Créer des niveaux de complexité progressive pour différentes capacités d'apprentissage\n\n4. **Pour le Contenu Potentiellement Inexact** :\n   - Signaler les affirmations qui semblent douteuses ou non fondées\n   - Noter quand les déclarations sont en conflit avec les connaissances établies\n   - Suggérer des sources de vérification le cas échéant\n   - Distinguer entre les faits établis et les opinions du locuteur\n\n## STRUCTURE DE SORTIE\n\n1. **Objectifs d'Apprentissage** - Ce que vous apprendrez de ce matériel\n2. **Concepts Clés** - Idées essentielles présentées avec des explications claires\n3. **Carte Conceptuelle** - Représentation visuelle ASCII de la façon dont les idées se connectent\n4. **Analyse Détaillée** - Explication organisée du contenu\n5. **Résumé** - Revue concise des points les plus importants\n6. **Application** - Comment utiliser ces connaissances de façon pratique\n7. **Auto-Évaluation** - Questions pour vérifier la compréhension\n\nRemarque : Toutes les sorties doivent être en français."
  },
  shortSummary: {
    name: "Quick Summary",
    content: "# Résumé de Vidéo YouTube\n\nVeuillez fournir un résumé concis et clair de cette transcription de vidéo YouTube. Votre résumé devrait :\n\n1. Capturer les points principaux et les enseignements clés en 3-5 points\n2. Comprendre environ 150-250 mots au total\n3. Maintenir le message principal et l'intention de l'orateur original\n4. Filtrer les mots de remplissage, les répétitions et le contenu tangentiel\n5. Présenter les informations dans une structure logique et facile à suivre\n\nConcentrez-vous sur la délivrance d'une valeur et d'une clarté maximales dans un espace minimal.\n\n## Analyse des Commentaires\nIdentifiez le commentaire le plus pertinent ou populaire (basé sur les likes) et incluez-le avec le nom d'utilisateur et le nombre de likes. Fournissez une brève analyse de ce commentaire en relation avec le contenu de la vidéo.\n\nRemarque : Le résumé doit être en français."
  },
  detailedSummary: {
    name: "Detailed Analysis",
    content: "# Analyse Détaillée de Vidéo YouTube\n\nVeuillez analyser cette transcription de vidéo YouTube de manière complète. Votre analyse doit inclure :\n\n## 1. Résumé Exécutif (100-150 mots)\nUn aperçu concis du sujet principal et des points clés.\n\n## 2. Points Essentiels\nLes 5-7 idées ou arguments les plus importants présentés, avec de brèves explications.\n\n## 3. Décomposition du Contenu\nUne analyse section par section du contenu de la vidéo, organisée par sujets principaux.\n\n## 4. Citations Notables\nLes citations directes les plus significatives ou perspicaces de la transcription.\n\n## 5. Contexte & Arrière-plan\nInformations contextuelles pertinentes qui aident à mieux comprendre le contenu.\n\n## 6. Analyse & Perspectives\nVotre interprétation de l'importance, de l'exactitude et de la valeur du contenu.\n\n## 7. Applications Potentielles\nComment l'information pourrait être appliquée de manière pratique.\n\n## 8. Analyse des Commentaires\nCitez le commentaire le plus pertinent ou populaire (avec nom d'utilisateur et nombre de likes). Effectuez une analyse croisée de ce commentaire par rapport au contenu et au message de la vidéo. Examinez comment ce commentaire reflète la réception du public et les perspectives des spectateurs.\n\nRemarque : L'analyse doit être entièrement en français."
  }
};

/**
 * Load prompts from Chrome storage or return defaults if not found
 * @returns {Promise<Object>} The loaded prompts
 */
async function loadPrompts() {
  try {
    const { customPrompts } = await chrome.storage.local.get(['customPrompts']);
    
    // Initialize custom prompts if they don't exist
    if (!customPrompts || Object.keys(customPrompts).length === 0) {
      await savePrompts(DEFAULT_PROMPTS);
      return DEFAULT_PROMPTS;
    }
    
    return customPrompts;
  } catch (error) {
    console.error('Error loading prompts:', error);
    return DEFAULT_PROMPTS;
  }
}

/**
 * Save prompts to Chrome storage
 * @param {Object} prompts - The prompts to save
 * @returns {Promise<void>}
 */
async function savePrompts(prompts) {
  try {
    await chrome.storage.local.set({ customPrompts: prompts });
    console.log('Prompts saved successfully');
  } catch (error) {
    console.error('Error saving prompts:', error);
    throw error;
  }
}

/**
 * Export prompts to a JSON file
 * @param {Object} prompts - The prompts to export
 * @returns {Promise<void>}
 */
async function exportPromptsToFile(prompts) {
  try {
    // Create export data with metadata
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      prompts: prompts
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download URL
    const url = URL.createObjectURL(blob);
    
    // Create date string for filename
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `youtube-transcript-prompts-${dateStr}.json`;
    
    // Trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting prompts:', error);
    throw error;
  }
}

/**
 * Import prompts from a JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise<Object>} The imported prompts
 */
async function importPromptsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        // Parse JSON
        const jsonData = JSON.parse(event.target.result);
        
        // Validate structure
        if (!jsonData.prompts || typeof jsonData.prompts !== 'object') {
          reject(new Error('Invalid file format: Missing or invalid prompts object'));
          return;
        }
        
        // Extract prompts
        const importedPrompts = jsonData.prompts;
        
        // Validate each prompt
        for (const [id, prompt] of Object.entries(importedPrompts)) {
          if (!prompt.name || !prompt.content) {
            reject(new Error(`Invalid prompt: ${id} is missing required fields`));
            return;
          }
        }
        
        resolve(importedPrompts);
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Merge imported prompts with existing prompts
 * @param {Object} importedPrompts - The prompts from the imported file
 * @param {Boolean} overwrite - Whether to overwrite existing prompts
 * @returns {Promise<Object>} The merged prompts
 */
async function mergePrompts(importedPrompts, overwrite) {
  try {
    const existingPrompts = await loadPrompts();
    let mergedPrompts;
    
    if (overwrite) {
      // Replace all prompts with imported ones
      mergedPrompts = importedPrompts;
    } else {
      // Merge prompts, keeping existing ones if there's a conflict
      mergedPrompts = { ...existingPrompts };
      
      // Add new prompts
      for (const [id, prompt] of Object.entries(importedPrompts)) {
        if (!mergedPrompts[id]) {
          mergedPrompts[id] = prompt;
        }
      }
    }
    
    // Save merged prompts
    await savePrompts(mergedPrompts);
    return mergedPrompts;
  } catch (error) {
    console.error('Error merging prompts:', error);
    throw error;
  }
}

/**
 * Reset prompts to default
 * @returns {Promise<Object>} The default prompts
 */
async function resetPromptsToDefault() {
  try {
    await savePrompts(DEFAULT_PROMPTS);
    return DEFAULT_PROMPTS;
  } catch (error) {
    console.error('Error resetting prompts:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  DEFAULT_PROMPTS,
  loadPrompts,
  savePrompts,
  exportPromptsToFile,
  importPromptsFromFile,
  mergePrompts,
  resetPromptsToDefault
};