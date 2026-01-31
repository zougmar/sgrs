# Guide de Connexion MongoDB

## Problème : Timeout de connexion à MongoDB Atlas

Si vous obtenez l'erreur `ETIMEOUT` ou `MongoServerSelectionError`, voici les solutions :

## Solution 1 : Vérifier la Whitelist IP dans MongoDB Atlas

1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com/)
2. Allez dans **Network Access** (Accès réseau)
3. Cliquez sur **Add IP Address** (Ajouter une adresse IP)
4. Cliquez sur **Allow Access from Anywhere** (Autoriser l'accès depuis n'importe où) OU
5. Ajoutez votre adresse IP actuelle : `0.0.0.0/0` (pour le développement uniquement)

⚠️ **Note de sécurité** : Autoriser toutes les IP (`0.0.0.0/0`) n'est recommandé que pour le développement. Pour la production, utilisez des IP spécifiques.

## Solution 2 : Augmenter les Timeouts

Modifiez `server/server.js` pour augmenter les timeouts :

```javascript
const options = {
  serverSelectionTimeoutMS: 30000, // 30 secondes au lieu de 10
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000, // 30 secondes au lieu de 10
};
```

## Solution 3 : Utiliser MongoDB Local

Si vous avez MongoDB installé localement :

1. Modifiez `server/.env` :
```env
MONGODB_URI=mongodb://localhost:27017/sgrs_security
```

2. Assurez-vous que MongoDB est démarré :
   - Windows : Vérifiez dans les Services Windows
   - Ou lancez : `mongod` dans un terminal

## Solution 4 : Vérifier votre Connexion Internet

- Vérifiez que vous avez une connexion Internet active
- Essayez de ping le cluster : `ping cluster0.i0tsmn6.mongodb.net`
- Vérifiez si un firewall bloque la connexion

## Solution 5 : Vérifier les Credentials

Vérifiez que votre URI MongoDB dans `.env` est correcte :

Format correct :
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

Assurez-vous que :
- Le nom d'utilisateur est correct
- Le mot de passe est correct (sans caractères spéciaux encodés)
- Le nom du cluster est correct
- Le nom de la base de données est correct

## Solution 6 : Réinitialiser le Mot de Passe MongoDB Atlas

1. Allez dans **Database Access** dans MongoDB Atlas
2. Cliquez sur votre utilisateur
3. Cliquez sur **Edit** puis **Edit Password**
4. Générez un nouveau mot de passe
5. Mettez à jour `MONGODB_URI` dans `server/.env`

## Test de Connexion

Pour tester la connexion, vous pouvez utiliser MongoDB Compass ou exécuter :

```bash
cd server
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

## Configuration Recommandée pour le Développement

Pour le développement local, je recommande d'utiliser MongoDB local :

1. Installez MongoDB Community Edition : https://www.mongodb.com/try/download/community
2. Modifiez `server/.env` :
```env
MONGODB_URI=mongodb://localhost:27017/sgrs_security
```

Cela évite les problèmes de réseau et de timeout.
