# 🛡️ Cyna – Marketplace SaaS pour entreprises

Bienvenue sur **Cyna**, la plateforme de référence pour découvrir, comparer et tester les meilleurs outils SaaS du marché.

> Ce projet a été réalisé dans le cadre du **Bachelor 3 – Développement Web & Mobile** chez **INGÉTIS / SUP DE VINCI**.  
> Il sert de support à la **soutenance finale de notre projet fil rouge**.

---

## 🎯 Objectif du projet

L’objectif du projet est de répondre à un besoin réel de l’entreprise **CYNA**, spécialisée dans les solutions SaaS de cybersécurité.  
Nous avons conçu une **marketplace e-commerce B2B**, moderne et sécurisée, permettant à des clients professionnels de :

- Rechercher des outils numériques (SOC, EDR, XDR, etc.)
- Comparer les offres
- S’abonner à des services SaaS
- Gérer leurs abonnements en ligne
- Effectuer des paiements sécurisés

---

## 🚀 Fonctionnalités principales

### 🧑‍💻 Pour les utilisateurs :
- Recherche et filtres avancés (catégories, prix, notation…)
- Fiches produits détaillées avec avis, prix, screenshots
- Inscription, connexion sécurisée (JWT)
- Panier et abonnement SaaS mensuel/annuel
- Paiement sécurisé via Stripe / PayPal
- Historique de commandes
- Interface responsive (mobile, tablette, desktop)

### 🔒 Pour les administrateurs :
- Back-office complet : gestion des produits, utilisateurs, commandes
- Authentification 2FA (deux facteurs)
- Tableau de bord avec statistiques
- Interface sécurisée et ergonomique

---

## 🛠️ Stack technique

| Côté               | Technologies utilisées                                                |
|--------------------|------------------------------------------------------------------------|
| Front-end          | [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| Back-end           | Node.js, Express.js, MySQL                                             |
| Authentification   | JWT, bcrypt, Auth 2FA                                                  |
| Paiement           | Stripe, PayPal                                                         |
| Outils projet      | GitHub, Trello, Figma, Notion                                          |

---

## 📁 Arborescence du projet

```
src/
  components/      # Composants UI réutilisables
  hooks/           # Hooks personnalisés
  lib/             # Fonctions utilitaires
  pages/           # Pages principales (Accueil, Catalogue, Login, Register, etc.)
  App.tsx          # Point d'entrée principal
  main.tsx         # Bootstrap de l'app React
public/            # Fichiers statiques (favicon, images, etc.)
```

---

## 👥 Équipe projet

Projet réalisé dans le cadre du Bachelor 3 INGÉTIS / SUP DE VINCI

**Chef de projet :**  
Mouhamed DIAGNE

**Développeurs :**  
- Mouhamed DIAGNE  
- Ruben Précieux Madzou  
- Amah Audrey Djogbema  
- Moubarak Kiye Dendi

**Encadrants pédagogiques :**  
- Mme Guerfi  
- Mr Roget  
- Mme Houda Neffati

**Entreprise partenaire :**  
- CYNA

**Consultant technique :**  
- MAD Consulting

---

## 📄 Licence

Ce projet est sous licence MIT.

---

> Pour toute question ou suggestion, n’hésite pas à ouvrir une issue ou à nous contacter.
