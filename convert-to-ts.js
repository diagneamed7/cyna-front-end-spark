const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fonction pour vérifier si un fichier est un fichier React
function isReactFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return (
      content.includes('import React') || 
      content.includes('from "react"') ||
      content.includes('from \'react\'') ||
      content.includes('React.') ||
      content.includes('<div') ||
      content.includes('<span') ||
      content.includes('React.')
    );
  } catch (error) {
    return false;
  }
}

// Fonction pour convertir un fichier .js en .ts ou .tsx
function convertFile(filePath) {
  if (!filePath.endsWith('.js')) return;
  
  try {
    // Vérifier si c'est un fichier JSX ou JS
    const isReactComponent = isReactFile(filePath);
    const newExtension = isReactComponent ? '.tsx' : '.ts';
    const newPath = filePath.replace('.js', newExtension);
    
    // Copier le contenu du fichier
    fs.copyFileSync(filePath, newPath);
    console.log(`Converti: ${filePath} -> ${newPath}`);
    
    // Optionnel: supprimer l'ancien fichier
    // Décommenter la ligne suivante pour supprimer automatiquement les fichiers .js d'origine
    // fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Erreur lors de la conversion de ${filePath}:`, error);
  }
}

// Fonction pour parcourir un répertoire récursivement
function processDirectory(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory() && !itemPath.includes('node_modules')) {
      processDirectory(itemPath);
    } else if (stats.isFile() && itemPath.endsWith('.js')) {
      convertFile(itemPath);
    }
  }
}

// Exécuter la conversion pour le répertoire src
processDirectory(path.join(__dirname, 'src'));
console.log('Conversion terminée !');
console.log('Veuillez corriger les erreurs de type manuellement dans les fichiers convertis.'); 