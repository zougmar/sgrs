# Configuration de l'envoi d'email

Pour activer l'envoi automatique d'emails avec les factures PDF, vous devez configurer les variables d'environnement suivantes dans votre fichier `.env` :

## Variables d'environnement requises

```env
# Configuration SMTP pour l'envoi d'emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
```

## Configuration Gmail

Si vous utilisez Gmail, vous devez :

1. **Activer l'authentification à deux facteurs** sur votre compte Gmail
2. **Générer un mot de passe d'application** :
   - Allez dans votre compte Google
   - Sécurité → Authentification à deux facteurs
   - Mots de passe des applications
   - Créez un nouveau mot de passe d'application
   - Utilisez ce mot de passe dans `SMTP_PASS`

## Autres fournisseurs SMTP

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Serveur SMTP personnalisé
```env
SMTP_HOST=votre-serveur-smtp.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Note importante

Si les variables d'environnement ne sont pas configurées, le système continuera de fonctionner normalement mais les emails ne seront pas envoyés. Un message d'avertissement sera affiché dans les logs du serveur.

## Test de la configuration

Après avoir configuré les variables d'environnement, redémarrez le serveur et passez une commande. Vous devriez voir dans les logs :
- `✅ Email sent successfully: [messageId]` si l'email a été envoyé avec succès
- `⚠️  Failed to send email` si l'envoi a échoué
