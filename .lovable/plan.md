

# Ignite+ — Plan MVP Web (B2B Leadership Habit Tracker)

## 1. Architecture des pages & routes

| Route | Page | Contenu |
|-------|------|---------|
| `/` | Landing | Hero avec one-liner, 3 bullet outcomes, CTA "Démarrer la démo", aperçu visuel du dashboard |
| `/login` | Login (simulé) | Sélecteur de rôle demo (Admin / Manager / Participant) — pas d'auth réelle |
| `/app` | Dashboard | KPIs du défi en cours (taux de participation, streak moyen, niveau moyen), leaderboard top 5, progression personnelle |
| `/app/challenges` | Défis | Liste des défis (actif / à venir / terminés), détail d'un défi avec les actions hebdomadaires attendues |
| `/app/checkin` | Check-in hebdo | Formulaire : sélection des actions réalisées cette semaine, message optionnel, confirmation avec animation de progression |
| `/app/team` | Équipe & Leaderboard | Classement complet avec niveaux (Bronze → Platine), filtres par équipe, avatars et streaks |
| `/app/barometer` | Baromètre ROI | 3-4 questions Likert rapides (confiance, engagement, clarté), visualisation radar/bar du score agrégé vs baseline |
| `/app/admin` | Admin (rôle Admin) | Vue org : gestion des défis, aperçu multi-équipes, export données (simulé) |

**Layout commun `/app/*`** : Sidebar gauche (navigation + rôle affiché), header avec nom utilisateur demo + badge de niveau, contenu principal.

---

## 2. Rôles & permissions (Demo Mode)

| Capacité | Admin | Manager | Participant |
|----------|-------|---------|-------------|
| Voir dashboard | ✅ | ✅ | ✅ (perso) |
| Faire un check-in | ❌ | ✅ | ✅ |
| Voir leaderboard complet | ✅ | ✅ (son équipe) | ✅ (son équipe) |
| Créer/modifier un défi | ✅ | ✅ | ❌ |
| Voir baromètre agrégé | ✅ | ✅ | ❌ (voit le sien) |
| Accéder à /app/admin | ✅ | ❌ | ❌ |

Le rôle est sélectionné à `/login` et stocké dans un React Context. Changer de rôle réinitialise la vue.

---

## 3. Modèle de données (interfaces TypeScript, front-end only)

```
Organization { id, name, logoUrl }

User { id, name, role, teamId, avatarUrl, level, xp, streak }

Team { id, name, managerId, memberIds }

Challenge { id, title, description, startDate, endDate, status, weeklyActions: Action[] }

Action { id, label, points }

CheckIn { id, userId, challengeId, weekNumber, completedActionIds, note, createdAt }

BarometerResponse { id, userId, challengeId, weekNumber, scores: { confidence, engagement, clarity } }

// Dérivés (calculés)
LeaderboardEntry { user, totalPoints, level, streak, rank }
BarometerAggregate { dimension, baseline, current, delta }
```

**Niveaux** : Bronze (0-99 XP) → Argent (100-249) → Or (250-499) → Platine (500+)

---

## 4. Demo Mode — State Shape & Propagation

- **Seeding** : Un fichier `src/data/demo-seed.ts` exporte l'organisation, 2 équipes, 8 utilisateurs fictifs (noms français non-sensibles), 1 défi actif avec 4 semaines d'historique de check-ins, et des réponses baromètre.
- **State** : Un `DemoContext` (React Context + `useReducer`) stocke toute la donnée. Actions du reducer : `CHECK_IN`, `SUBMIT_BAROMETER`, `SWITCH_ROLE`, `RESET_DEMO`.
- **Propagation** : Quand un check-in est soumis → le reducer recalcule les XP, le niveau, le streak et le classement. Le baromètre recalcule les agrégats. Tout est réactif via le context.
- **Persistance** : `localStorage` optionnel pour garder l'état entre les recharges, avec bouton "Réinitialiser la démo".

---

## 5. UI/UX — Thème Ignite+ Dark/Violet

### Tokens couleur (HSL)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--background` | `240 10% 8%` | Fond principal (charcoal profond) |
| `--card` | `240 8% 12%` | Surfaces cards, sidebar |
| `--card-foreground` | `0 0% 95%` | Texte sur cards |
| `--border` | `240 6% 20%` | Bordures subtiles |
| `--foreground` | `0 0% 95%` | Texte primaire (blanc cassé) |
| `--muted-foreground` | `240 5% 55%` | Texte secondaire |
| `--primary` | `262 83% 58%` | Violet accent (CTA, active nav, badges) |
| `--primary-foreground` | `0 0% 100%` | Texte sur violet |
| `--accent` | `262 60% 20%` | Violet sourdine (hover, highlights subtils) |
| `--destructive` | `0 72% 51%` | Erreurs |
| `--ring` | `262 83% 58%` | Focus rings |

### Règles d'usage du violet
- **OUI** : Boutons CTA, icône de navigation active, badges de niveau, barres de progression, highlights de rang #1, liens d'action
- **NON** : Texte courant, fonds de grandes surfaces, bordures par défaut, texte long

### Typographie
- Sans-serif système (Inter si possible via Google Fonts)
- Titres : semi-bold, tracking tight
- Corps : regular, line-height confortable (1.6)

---

## 6. Copywriting baseline (français, ton exécutif)

### Landing
- **One-liner** : « Transformez vos managers en leaders d'impact — un défi à la fois. »
- **3 bullet outcomes** :
  1. 🎯 « Des habitudes de leadership mesurables en 4 semaines »
  2. 📊 « Un baromètre ROI qui parle le langage du comité de direction »
  3. 🏆 « Une dynamique d'équipe portée par le jeu et la reconnaissance »
- **CTA** : « Explorer la démo »

### Navigation & boutons
- Dashboard : « Tableau de bord »
- Défis : « Défis »
- Check-in : « Mon check-in »
- Équipe : « Classement »
- Baromètre : « Baromètre ROI »
- Admin : « Administration »
- Soumettre : « Valider »
- Réinitialiser : « Réinitialiser la démo »

### États vides
- Aucun défi : « Aucun défi actif pour le moment. Créez-en un pour lancer la dynamique. »
- Aucun check-in : « Vous n'avez pas encore validé vos actions cette semaine. C'est le moment ! »
- Baromètre non rempli : « Prenez 30 secondes pour évaluer votre semaine. Votre feedback compte. »

---

## 7. Checklist d'implémentation (ordre de build)

1. **Thème & tokens** — Mettre à jour `index.css` et `tailwind.config.ts` avec le thème dark/violet. Police Inter.
2. **Layout App Shell** — Créer le layout commun (`AppLayout`) avec sidebar, header, slot contenu. Responsive.
3. **Demo Context & Seed** — Créer `demo-seed.ts`, `DemoContext`, reducer, et provider. Brancher sur `App.tsx`.
4. **Landing page** (`/`) — Hero, bullets, CTA vers `/login`.
5. **Login simulé** (`/login`) — Sélecteur de rôle, redirection vers `/app`.
6. **Dashboard** (`/app`) — KPIs cards, mini-leaderboard, progression perso.
7. **Page Défis** (`/app/challenges`) — Liste et détail d'un défi.
8. **Check-in** (`/app/checkin`) — Formulaire avec actions cochables, soumission qui met à jour le state.
9. **Leaderboard** (`/app/team`) — Classement complet avec niveaux et avatars.
10. **Baromètre ROI** (`/app/barometer`) — Questions Likert + visualisation radar/bar (Recharts).
11. **Admin** (`/app/admin`) — Vue multi-équipes, gestion défi (create/edit simulé).
12. **Polish** — Animations d'entrée, toasts de confirmation, micro-interactions sur level-up.

