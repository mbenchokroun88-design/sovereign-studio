## Objectif

Ajouter un système de mockups 3D **en pur CSS/React** (sans dépendance externe) qui transforme automatiquement une ou plusieurs images en rendu type "magazine ouvert en perspective", "roll-up debout", "affiche encadrée" ou "badge/flyer/banner". Inspiré du style unblast.com (perspective douce, ombres réalistes, fond minimal), mais **animé** : le visiteur fait défiler 3-4 vues différentes du même support, avec transitions fluides.

Aucun fichier PSD, aucun service payant. Tu fournis 1 à 4 images par média et le site génère le rendu.

## Ce que tu pourras faire dans l'admin

Sur chaque média d'un projet, en plus des champs existants (slot, URL, libellé) :

- **Case à cocher** "Afficher en mockup 3D"
- **Sélecteur de template** : `Magazine A4 ouvert` · `Roll-up` · `Affiche` · `Badge` · `Flyer` · `Banner` · `Carte`
- **Champ "Vues additionnelles"** : tu peux coller jusqu'à 3 URLs supplémentaires (Drive ou upload) pour les autres angles (ex. couverture / double page intérieure / dos / détail). Si tu ne mets qu'une image, le mockup affiche la même sur tous les angles avec variations d'éclairage.

Pas de migration lourde côté projet : tout est stocké dans le JSON `media` existant (on ajoute simplement `mockup`, `mockupTemplate`, `mockupViews[]` au type `MediaItem`).

## Ce que verra le visiteur

Dans la page projet, quand un média a "mockup" activé :

- Le rendu de la grille média devient une **scène 3D** au lieu d'une vignette plate.
- Au clic (ou auto-rotation lente toutes les 4s) : le mockup tourne légèrement et passe à la vue suivante avec un fondu + glissement. Flèches gauche/droite pour naviguer manuellement. Indicateur de pagination (1/4) discret en bas.
- En plein écran (clic sur Maximize) : version XL du mockup avec contrôles, fond dégradé subtil, ombre portée animée. Touches clavier ←/→.

### Templates visuels (rendus CSS)

| Template | Effet |
|---|---|
| Magazine A4 ouvert | Double page en perspective ~25°, pli central légèrement courbé via `transform: rotateY()` + gradient sur la reliure, ombre portée douce, léger flottement. 4 vues : couverture fermée → ouverture → double page → dos. |
| Roll-up | Bannière verticale 85×200cm, debout, légère inclinaison, base métallique stylisée, ombre au sol elliptique floutée. 3 vues : face → 3/4 gauche → 3/4 droite. |
| Affiche | Cadre fin ou bord vif sur mur texturé (gradient subtil + grain CSS), légère perspective murale. 3 vues : face → angle → zoom détail. |
| Badge / Flyer / Banner / Carte | Petits supports flottants avec ombre portée nette et reflet discret. Rotation continue lente sur Y au survol. |

Toutes les animations utilisent `transform` + `transition` (GPU), durée 700-900ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`. Aucune lib externe.

## Architecture technique

1. **Type étendu** (`src/lib/store/projects.tsx`) :
   ```ts
   interface MediaItem {
     // ... champs existants
     mockup?: boolean;
     mockupTemplate?: 'magazine' | 'rollup' | 'poster' | 'badge' | 'flyer' | 'banner' | 'card';
     mockupViews?: string[]; // URLs additionnelles
   }
   ```
   Rétro-compatible : si `mockup` est absent, comportement actuel.

2. **Nouveau composant** `src/components/site/Mockup3D.tsx` :
   - Props : `template`, `views: string[]`, `caption?`, `auto?: boolean`
   - Switch interne qui rend le bon sous-composant : `MagazineMockup`, `RollupMockup`, `PosterMockup`, `SmallSupportMockup`.
   - Hook interne `useViewRotator(viewsCount, auto)` qui gère index courant + auto-rotation pause-au-hover.

3. **Sous-composants** (un fichier par template, dans `src/components/site/mockups/`) :
   - `MagazineMockup.tsx` — scène avec `perspective: 2400px`, deux pages côte à côte, pli central, ombre.
   - `RollupMockup.tsx` — bannière + pied + ombre au sol.
   - `PosterMockup.tsx` — cadre + mur texturé.
   - `SmallSupportMockup.tsx` — sert badge/flyer/banner/carte avec ratios différents.

4. **Intégration grille** (`src/components/site/MediaViewer.tsx`) :
   - Dans `MediaThumb` : si `item.mockup`, rendre `<Mockup3D ... auto />` au lieu de l'image plate.
   - Dans `MediaFull` (vue plein écran) : si `item.mockup`, rendre `<Mockup3D ... />` taille XL avec contrôles.

5. **Admin** (`src/routes/admin.tsx`) :
   - Sur chaque ligne média, sous les champs existants, ajouter un bloc repliable "Mockup 3D" avec : checkbox, select template, 3 inputs URL pour vues additionnelles.
   - Sauvegarde dans le JSON `media` existant — aucune migration Supabase nécessaire.

6. **Styles** (`src/styles.css`) : ajouter quelques utilitaires `.mockup-stage`, `.mockup-shadow`, keyframes `mockup-float` (lévitation 4s ease-in-out infinite).

## Hors scope (à proposer plus tard si tu veux)

- Extraction automatique des pages d'un PDF pour alimenter les vues du magazine.
- Mockups photoréalistes via API tierce (Dynamic Mockups, Placeit).
- Génération d'une image PNG du mockup pour partage social (OG image).

## Validation

Après implémentation : créer un projet de test avec 1 image dans chaque template, vérifier en grille + plein écran sur desktop et mobile, valider la fluidité (60fps) via le preview.
