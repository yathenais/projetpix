# Fonctionnalité Toggle Police Cursive

## 📋 Description
Cette fonctionnalité ajoute un toggle switch dans l'onglet Paramètres permettant d'activer/désactiver une police cursive pour les titres "Quel est ton nom ?" et "Tes activités du jour".

## 🔧 Modifications apportées

### 1. HTML (index.html)
- **Ligne ~132-147** : Ajout d'une nouvelle section "Préférences d'affichage" dans l'onglet paramètres
- **Ligne ~14** : Ajout du lien vers le nouveau fichier CSS `preferences.css`

```html
<div class="settings-section">
    <h3>Préférences d'affichage</h3>
    <div class="display-preferences">
        <div class="preference-item">
            <label for="cursive-font-toggle">Police cursive pour les titres :</label>
            <div class="toggle-container">
                <input type="checkbox" id="cursive-font-toggle" class="toggle-checkbox">
                <label for="cursive-font-toggle" class="toggle-switch">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    </div>
</div>
```

### 2. CSS (css/preferences.css) - NOUVEAU FICHIER
- **Toggle Switch** : Styles pour créer un toggle switch moderne et responsive
- **Police Cursive** : Règles CSS pour appliquer la police cursive aux titres
- **Animations** : Transitions fluides lors du changement de police
- **Amélioration UI** : Styles pour les sections de paramètres

**Polices cursives utilisées :**
1. 'Brush Script MT' (Windows)
2. 'Lucida Handwriting' (Windows)
3. 'Segoe Print' (Windows)
4. 'cursive' (fallback générique)

### 3. JavaScript (js/script.js)
- **Ligne ~29** : Ajout de l'appel `initializePreferences()` dans `initializeSettingsTab()`
- **Ligne ~35-57** : Nouvelles fonctions pour gérer les préférences :
  - `initializePreferences()` : Initialise le toggle et charge les préférences sauvegardées
  - `applyCursiveFont(isEnabled)` : Applique ou retire la classe CSS cursive
- **Ligne ~199** : Ajout de l'appel `initializePreferences()` dans `initApp()`

## 🎯 Fonctionnalités

### ✅ Ce qui fonctionne :
1. **Toggle Switch** : Interface utilisateur moderne dans l'onglet Paramètres
2. **Sauvegarde automatique** : Les préférences sont sauvegardées dans localStorage
3. **Application immédiate** : Les changements sont visibles instantanément
4. **Persistance** : La préférence est restaurée au rechargement de la page
5. **Éléments ciblés** : 
   - Titre "Quel est ton nom ?" (h1 dans #student-select-screen)
   - Titre "Tes activités du jour" (h1 dans #student-activities-screen)
   - Nom de l'élève affiché (#student-name-display)

### 🎨 Design :
- Toggle switch bleu (#3498db) cohérent avec le thème de l'app
- Animation fluide lors du changement d'état
- Police cursive lisible avec ombre portée
- Transitions CSS pour un effet fluide

## 🚀 Comment utiliser :
1. Ouvrir l'application
2. Cliquer sur le bouton de verrouillage (🔒)
3. Entrer le mot de passe (1234 par défaut)
4. Aller dans l'onglet "Paramètres"
5. Utiliser le toggle "Police cursive pour les titres"
6. Retourner aux écrans étudiants pour voir l'effet

## 🧪 Tests créés :
- **test-cursive-toggle.html** : Page de test isolée pour vérifier le toggle
- **test-cursive-logic.js** : Tests unitaires de la logique JavaScript

## 📱 Compatibilité :
- ✅ Chrome/Edge (Segoe Print, Brush Script MT)
- ✅ Firefox (Brush Script MT, cursive fallback)
- ✅ Safari (cursive fallback)
- ✅ Mobile (cursive fallback avec bonne lisibilité)

## 🔍 Points techniques :
- **localStorage** : Clé `cursiveFontEnabled` (boolean string)
- **CSS Class** : `cursive-titles` ajoutée au `<body>`
- **Sélecteurs CSS** : `body.cursive-titles h1, body.cursive-titles .student-name-large`
- **Initialisation** : Appelée dans `initApp()` pour garantir l'application au chargement