# Configuration Email Rapide

## Problème
Vous voyez ce message dans les logs :
```
⚠️  Email configuration not found. Email sending will be skipped.
📧 Email not sent: Email configuration not available
```

## Solution Rapide

### Pour Gmail (Recommandé)

1. **Ouvrez votre fichier `.env` dans le dossier `server/`**

2. **Ajoutez ces lignes à la fin du fichier :**

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
```

3. **Générez un mot de passe d'application Gmail :**
   - Allez sur https://myaccount.google.com/
   - Cliquez sur **Sécurité** dans le menu de gauche
   - Activez **Authentification à deux facteurs** si ce n'est pas déjà fait
   - Cliquez sur **Mots de passe des applications**
   - Sélectionnez **Autre (nom personnalisé)** et entrez "SGRS Server"
   - Cliquez sur **Générer**
   - **Copiez le mot de passe généré** (16 caractères)
   - Utilisez ce mot de passe dans `SMTP_PASS` (PAS votre mot de passe Gmail normal)

4. **Redémarrez le serveur**

### Exemple de configuration complète

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=grouperachidsystem@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

**Important :** Utilisez le mot de passe d'application (16 caractères), pas votre mot de passe Gmail normal.

### Vérification

Après avoir configuré et redémarré le serveur, quand un client passe une commande, vous devriez voir :
```
✅ Email sent successfully: <messageId>
```

Au lieu de :
```
⚠️  Email configuration not found
```
