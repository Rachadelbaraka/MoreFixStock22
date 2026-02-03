# Firebase Setup Guide for MoreFix

## 🔥 Configuration Firebase

Ce guide vous aidera à configurer Firebase Firestore pour votre application MoreFix.

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet (ex: "morefix-showcase")
4. Suivez les étapes de configuration

### 2. Activer Firestore Database

1. Dans la console Firebase, allez dans "Build" > "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez le mode de production
4. Sélectionnez une région (ex: europe-west1 pour la France)

### 3. Configurer les règles de sécurité

Dans l'onglet "Règles" de Firestore, utilisez ces règles pour permettre la lecture publique et l'écriture admin :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all products
    match /products/{productId} {
      allow read: if true;
      // For now, allow write from client (in production, use Firebase Auth)
      allow write: if true;
    }
  }
}
```

**Note:** Pour la production, implémentez Firebase Authentication pour sécuriser les opérations d'écriture.

### 4. Obtenir les clés de configuration

1. Dans les paramètres du projet (⚙️ icône en haut à gauche)
2. Allez dans "Paramètres du projet"
3. Faites défiler jusqu'à "Vos applications"
4. Cliquez sur l'icône Web (</>)
5. Enregistrez votre application (ex: "MoreFix Web App")
6. Copiez l'objet `firebaseConfig`

### 5. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

### 6. Structure de la collection "products"

Chaque document dans la collection `products` a cette structure :

```typescript
{
  title: string              // "Dell Latitude 5400"
  price: number              // 249.99
  originalPrice?: number     // 399.99 (optionnel)
  description: string        // Description du produit
  category: string           // "Ordinateurs", "Smartphones", etc.
  condition: string          // "Neuf" ou "Occasion"
  images: string[]           // Array d'URLs d'images
  features?: string[]        // ["Intel i5", "8GB RAM"] (optionnel)
  rating?: number            // 4.5 (optionnel)
  reviews?: number           // 29 (optionnel)
  inStock?: boolean          // true/false (optionnel, défaut: true)
  createdAt: Timestamp       // Généré automatiquement
}
```

## 🔐 Connexion Admin

Le mot de passe admin par défaut est : **admin123**

Pour changer le mot de passe :
1. Ouvrez `app/page.tsx`
2. Modifiez la constante `ADMIN_PASSWORD`

## 🚀 Utilisation

### Mode Visiteur (Guest)
- Parcourir les produits en temps réel
- Filtrer par catégorie
- Ajouter aux favoris
- Contacter pour un produit

### Mode Admin
1. Cliquez sur l'icône 🛡️ (Shield) dans le header
2. Entrez le mot de passe admin
3. Ajoutez des produits via le formulaire
4. Supprimez des produits avec l'icône 🗑️ (Trash)

### Synchronisation en Temps Réel

Les produits sont synchronisés en temps réel grâce à `onSnapshot` de Firestore :
- Ajout d'un produit → Apparaît instantanément pour tous
- Suppression d'un produit → Disparaît instantanément pour tous
- Aucun rechargement de page nécessaire

## 📝 Notes Importantes

1. **Sécurité en Production** : Implémentez Firebase Authentication pour l'admin
2. **Images** : Utilisez des URLs publiques (Firebase Storage, Cloudinary, etc.)
3. **Coûts** : Le plan gratuit Firebase Spark offre :
   - 1 Go de stockage
   - 10 Go/mois de transfert
   - 50k lectures, 20k écritures, 20k suppressions par jour

## 🛠️ Développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Démarrer en production
npm start
```

## 🎨 Couleurs du Design

- **Primary Purple:** #8B5CF6 (rgb(139, 92, 246))
- **Secondary Orange:** #F97316 (rgb(249, 115, 22))
- **Gradient:** from-orange-500 to-purple-600

## 📧 Support

Pour toute question, contactez :
- **Email:** contact@morefix.fr
- **Téléphone:** 07 45 92 35 38

---

**Développé par Mohammad Radwan**  
© 2025 MoreFix. Tous droits réservés.
