# Audit de l'interface actuelle - FitTracker

**Date** : 10/05/2024
**Objectif** : Identifier les écrans concernés par l'affichage des données et les problèmes de clarté à résoudre.

---

## Écrans concernés

### 1. `workout.tsx`
**Description** : Écran principal pour enregistrer une séance.
**Fonctionnalités actuelles** :
- Ajout/suppression d'exercices et de séries.
- Saisie des poids et répétitions.
- Boutons pour démarrer/terminer une séance.

**Problèmes identifiés** :
- Les séries sont affichées sous forme de cartes individuelles, ce qui peut être encombrant.
- Manque de contexte visuel (ex: comparaison avec les séances précédentes).
- Pas de mise en évidence des records personnels.

**Exemple actuel** :
```
Série 1 : Poids (kg) | Reps
Série 2 : Poids (kg) | Reps
...
```

**Améliorations proposées** :
- Utiliser un tableau ou une liste compacte pour les séries.
- Ajouter des indicateurs visuels (flèches, couleurs) pour montrer la progression.
- Mettre en évidence les records personnels.

---

### 2. `(tabs)/index.tsx`
**Description** : Écran d'accueil avec résumé des séances et records.
**Fonctionnalités actuelles** :
- Affichage de la dernière séance (durée, volume, exercices clés).
- Graphique de progression (mini-bars).
- Records récents sous forme de cartes horizontales.

**Problèmes identifiés** :
- Les records sont affichés sans contexte visuel (ex: graphique de tendance).
- Le graphique de progression est basique et peu informatif.
- Manque de comparaisons claires entre les séances.

**Améliorations proposées** :
- Ajouter des graphiques ou indicateurs de tendance pour les records.
- Améliorer la lisibilité des données de progression.
- Ajouter des comparaisons visuelles (ex: "+5kg depuis la dernière séance").

---

## Problèmes spécifiques

### 1. Affichage des séries
- **Problème** : Les séries sont affichées de manière encombrante.
- **Solution** : Utiliser un tableau ou une liste compacte.

### 2. Manque de contexte
- **Problème** : Aucune comparaison avec les séances précédentes.
- **Solution** : Ajouter des indicateurs visuels (flèches, couleurs).

### 3. Graphiques de progression
- **Problème** : Les graphiques sont basiques et peu informatifs.
- **Solution** : Utiliser des librairies comme `react-native-chart-kit` pour des graphiques plus détaillés.

### 4. Saisie des données
- **Problème** : La saisie des poids et répétitions pourrait être plus intuitive.
- **Solution** : Ajouter des boutons +/-, une saisie rapide, et des valeurs par défaut.

---

## Plan d'action

### Étape 1 : Audit de l'interface actuelle ✅
- **Objectif** : Identifier les écrans concernés et les problèmes.
- **Livrable** : Ce document (`AUDIT_INTERFACE.md`).

### Étape 2 : Refonte de l'affichage des séries
- **Objectif** : Améliorer la lisibilité des séries pour un exercice.
- **Sous-étapes** :
  1. Créer un composant `ExerciseCard.tsx` pour afficher les séries.
  2. Intégrer le composant dans `workout.tsx`.
  3. Ajouter des comparaisons visuelles (flèches, couleurs).
- **Livrable** : Un composant réutilisable et une meilleure lisibilité.

### Étape 3 : Ajout de graphiques de progression
- **Objectif** : Permettre à l'utilisateur de visualiser ses progrès.
- **Sous-étapes** :
  1. Choisir une librairie de graphiques (`react-native-chart-kit`).
  2. Créer un composant `ProgressChart.tsx`.
  3. Intégrer le graphique dans l'écran d'exercice.
- **Livrable** : Un graphique de progression fonctionnel.

### Étape 4 : Amélioration de la saisie des données
- **Objectif** : Simplifier l'entrée des séries.
- **Sous-étapes** :
  1. Ajouter des boutons +/-
  2. Ajouter un mode "Saisie rapide".
- **Livrable** : Une saisie plus intuitive.

### Étape 5 : Feedback visuel et animations
- **Objectif** : Ajouter des animations pour améliorer l'expérience.
- **Sous-étapes** :
  1. Animer l'enregistrement d'une série.
  2. Animer les transitions entre écrans.
- **Livrable** : Des animations fluides.

### Étape 6 : Tests et ajustements
- **Objectif** : Valider les changements.
- **Sous-étapes** :
  1. Tester chaque composant.
  2. Recueillir des feedbacks.
- **Livrable** : Une liste de bugs ou d'ajustements.

### Étape 7 : Déploiement et itération
- **Objectif** : Déployer et continuer à améliorer.
- **Sous-étapes** :
  1. Déployer une version bêta.
  2. Itérer en fonction des retours.
- **Livrable** : Une application améliorée.

---

## Priorités

1. **Priorité haute** :
   - Refonte de l'affichage des séries (`ExerciseCard`).
   - Amélioration de la saisie des données.

2. **Priorité moyenne** :
   - Ajout de graphiques de progression.

3. **Priorité basse** :
   - Animations et feedback visuel.

---

## Prochaines étapes

- [ ] Valider ce document et ajuster si nécessaire.
- [ ] Commencer par l'étape 2 : Refonte de l'affichage des séries.

---

**Auteur** : Mistral Vibe
**Date** : 10/05/2024
