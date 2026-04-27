# 🤖 JARVIS BOT - Setup Complet

Bienvenue! Voici comment activer ton bot Telegram + Notion + Claude.

---

## ✅ Avant de commencer (pré-requis)

Tu as déjà:
- ✅ Token Telegram
- ✅ Token Notion API
- ✅ Database Notion "Jarvis Intake" créée
- ✅ Database ID

Il te manque juste:
- ⏳ Clé API Claude (on va l'obtenir)
- ⏳ Un compte GitHub (gratuit)
- ⏳ Un compte Railway (gratuit)

---

## 1️⃣ Obtenir ta clé API Claude

**Étapes :**

1. Va sur https://console.anthropic.com/account/keys
2. Clique **"Create Key"**
3. Nomme-la "Jarvis Bot"
4. **Copie la clé** (elle commence par `sk-ant-...`)
5. **Sauvegarde-la quelque part** (tu en auras besoin)

⚠️ **IMPORTANT** : Ne la partage JAMAIS. C'est secret comme un mot de passe.

---

## 2️⃣ Préparer le code (Local)

### Étape A: Cloner ou créer le repo

**Option 1 : Avec GitHub Desktop (facile)**
1. Crée un nouveau repo public sur GitHub: `jarvis-bot`
2. Clone-le sur ton ordinateur
3. Copie les fichiers que je t'ai créés dedans:
   - `telegram-bot.js`
   - `package.json`
   - `.env`

**Option 2 : Via Git CLI**
```bash
git clone https://github.com/TON_USERNAME/jarvis-bot.git
cd jarvis-bot
# Copie les fichiers ici
git add .
git commit -m "Initial commit: Jarvis Bot"
git push origin main
```

### Étape B: Remplir le fichier `.env`

Ouvre `.env` et remplace:

```
TELEGRAM_TOKEN=8076062627:AAGbWRFbDadWR_hboHOanNt40xHiZHFwzzg  # ✅ Déjà rempli
NOTION_TOKEN=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  # ✅ Déjà rempli
NOTION_DATABASE_ID=34f83ff1ba3a80eda94ec7c3a291f612  # ✅ Déjà rempli
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx  # ⬅️ Remplace par ta clé Claude
```

Sauvegarde et push sur GitHub:
```bash
git add .env
git commit -m "Add environment variables"
git push origin main
```

---

## 3️⃣ Déployer sur Railway (Gratuit)

**Railway te donne $5/mois gratuits** — plus que suffisant pour ce bot.

### Étape 1: Créer un compte Railway

1. Va sur https://railway.app
2. Clique **"Start Project"**
3. Login avec GitHub (c'est plus facile)
4. Autorise Railway

### Étape 2: Déployer depuis GitHub

1. Sur Railway, clique **"Create New Project"**
2. Sélectionne **"Deploy from GitHub"**
3. Cherche et sélectionne `jarvis-bot`
4. Railway va te demander les variables d'environnement
5. **Copie-colle les mêmes valeurs de ton `.env`** :
   - `TELEGRAM_TOKEN`
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
   - `CLAUDE_API_KEY`
6. Clique **"Deploy"**

### Étape 3: Vérifier que ça marche

Une fois déployé:
1. Va sur https://t.me/BotFather
2. Cherche ton bot (le nom que tu as créé, ex: `jarvis_tom_bot`)
3. Clique dessus
4. Tape `/start`
5. Le bot doit répondre avec le message d'accueil

Si ça marche ➜ **C'EST BON!** 🎉

---

## 4️⃣ Utiliser le bot (Workflow Tom)

### Le flux quotidien:

1. **Ouvre Telegram** et cherche ton bot
2. **Écris une note brute** (n'importe comment):
   ```
   "Kraken a un problème avec leur SAV clients"
   ```
3. **Jarvis pose des questions** pour clarifier:
   ```
   C'est quoi le type de problème? (technique, process, manpower?)
   Deadline?
   ```
4. **Tu réponds**
5. **Jarvis crée la structure** et la sauve dans Notion automatiquement ✅

### Types de notes:
- **Operation** → Tâche, action, blocage
- **Metric** → Données (ARR, MRR, churn, etc.)
- **Blocage** → Problème qui doit être résolu
- **Note** → Info générale pour plus tard

---

## 5️⃣ Monitoring & Logs

### Voir ce que fait le bot:

1. Va sur https://railway.app
2. Ouvre ton projet `jarvis-bot`
3. Clique **"Logs"** pour voir les requêtes en temps réel
4. Tu vois chaque message, chaque appel à Notion, tout!

### Si quelque chose bug:

1. Vérifie les logs
2. Regarde l'erreur exacte
3. Contacte-moi avec le message d'erreur

---

## 6️⃣ Coûts & Limites

### Gratuit pour:
- ✅ **Telegram Bot** : illimité (c'est gratuit)
- ✅ **Railway** : $5/mois gratuits (ce bot en utilise ~$0.10/mois)
- ✅ **Notion API** : gratuit

### Payant:
- ⚠️ **Claude API** : ~$0.003 par appel (minimal)
  - Une note = 1-2 appels
  - 100 notes/mois = ~$0.30-0.60
  - Budget Claude: garde un eye mais ça reste rien

---

## 🆘 Troubleshooting

### "Bot doesn't respond"
1. Vérifie que Railway est green (pas rouge)
2. Regarde les logs sur Railway
3. Vérifie que `TELEGRAM_TOKEN` est correct

### "Notion save fails"
1. Vérifie `NOTION_TOKEN` et `NOTION_DATABASE_ID`
2. Assure-toi que l'API Token a les permissions
3. Regarde les logs pour le message d'erreur exact

### "Claude API error"
1. Vérifie que `CLAUDE_API_KEY` est correct
2. Vérifie ton crédit Claude (https://console.anthropic.com/account/usage)
3. Si zéro crédit = ajoute une carte de crédit

---

## 📞 Support

Si tu as des questions:
1. Check les **logs Railway**
2. Vérife les **tokens** (copie/paste erreurs)
3. Contacte-moi avec le **message d'erreur exact**

---

## 🚀 Next Steps

Une fois qu'il marche:
1. **Utilise-le au quotidien** pour tes notes
2. **Optimize** les questions si besoin
3. **Ajoute des agents** (on peut en créer plus tard)

**Tu es prêt?** Dis-moi quand ton bot est live! 🎉
