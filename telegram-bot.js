const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
const notionToken = process.env.NOTION_TOKEN;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const claudeKey = process.env.CLAUDE_API_KEY;

const bot = new TelegramBot(token, { polling: true });

const conversationState = {};
const CLAUDE_MODEL = 'claude-sonnet-4-6';

async function callClaudeAPI(userMessage) {
  try {
    const systemPrompt = `Tu es Jarvis, un assistant IA pour Tom qui travaille chez WeloveFounders (fonds VC belge pré-seed/seed).

Ton rôle: Aider Tom à structurer ses notes quotidiennes brutes en informations bien organisées pour Notion.

Quand Tom écrit une note:
1. IDENTIFY le type: Operation (tâche, action), Metric (données), Blocage (problème), Note (info générale)
2. Pose 1-2 questions CLAIRES et CONCISES pour mieux comprendre
3. Après ses réponses, génère une structure JSON clean

IMPORTANT: 
- Réponds EN FRANÇAIS
- Sois direct et efficace (Tom est occupé)

Si tu as assez d'infos, réponds avec ce JSON format:
\`\`\`json
{
  "type": "Operation|Metric|Blocage|Note",
  "title": "titre court",
  "company": "company name or -",
  "priority": "High|Medium|Low",
  "context": "description courte",
  "action": "action proposée ou insight"
}
\`\`\``;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return null;
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API call error:', error);
    return null;
  }
}

async function saveToNotion(taskData) {
  try {
    const response = await fetch(`https://api.notion.com/v1/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: notionDatabaseId },
        properties: {
          'Note brute': {
            title: [{ type: 'text', text: { content: taskData.title } }]
          },
          'Type': {
            select: { name: taskData.type }
          },
          'Company': {
            rich_text: [{ type: 'text', text: { content: taskData.company } }]
          },
          'Priority': {
            select: { name: taskData.priority }
          },
          'Status': {
            select: { name: 'À faire' }
          },
          'Context': {
            rich_text: [{ type: 'text', text: { content: taskData.context } }]
          },
          'Action proposée': {
            rich_text: [{ type: 'text', text: { content: taskData.action } }]
          },
          'Date': {
            date: { start: new Date().toISOString().split('T')[0] }
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Notion API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Notion save error:', error);
    return false;
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    `🤖 *Jarvis Bot - Structuration Notion*\n\n` +
    `Salut Tom! Je suis ton assistant IA.\n\n` +
    `Écris une note brute et je vais:\n` +
    `1️⃣ La classifier (Operation, Metric, Blocage, Note)\n` +
    `2️⃣ Te poser des questions pour la clarifier\n` +
    `3️⃣ La structurer et la sauver dans Notion\n\n` +
    `*Exemples:*\n` +
    `• "Kraken dit que leur SAV clients est chaotique"\n` +
    `• "ARR a augmenté de 30% ce mois"\n` +
    `• "Discussion avec co-founder de XYZ"\n\n` +
    `À toi! 👉`,
    { parse_mode: 'Markdown' }
  );
  conversationState[chatId] = { step: 'initial', messages: [], questionCount: 0 };
});

bot.on('message', async (msg) => {
  if (msg.text === '/start') return;
  
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  if (!conversationState[chatId]) {
    conversationState[chatId] = { step: 'initial', messages: [], questionCount: 0 };
  }

  const state = conversationState[chatId];

  try {
    // Call Claude to get response
    const claudeResponse = await callClaudeAPI(userMessage);
    
    if (!claudeResponse) {
      bot.sendMessage(chatId, '❌ Erreur API Claude. Réessaie stp.');
      return;
    }

    // Check if response contains JSON (task completed)
    const jsonMatch = claudeResponse.match(/```json\n([\s\S]*?)\n```/);
    
    if (jsonMatch) {
      // Parse and save to Notion
      try {
        const taskData = JSON.parse(jsonMatch[1]);
        const saved = await saveToNotion(taskData);

        if (saved) {
          bot.sendMessage(chatId,
            `✅ *Tâche structurée et sauvée dans Notion!*\n\n` +
            `📌 *Type:* ${taskData.type}\n` +
            `🏢 *Company:* ${taskData.company}\n` +
            `⚡ *Priority:* ${taskData.priority}\n` +
            `📝 *Context:* ${taskData.context}\n` +
            `🎯 *Action:* ${taskData.action}\n\n` +
            `Écris une autre note pour continuer! 📬`,
            { parse_mode: 'Markdown' }
          );
          
          // Reset conversation
          state.step = 'initial';
          state.messages = [];
          state.questionCount = 0;
        } else {
          bot.sendMessage(chatId, '⚠️ Erreur en sauvant dans Notion. Vérifie ta clé API.');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        bot.sendMessage(chatId, '❌ Erreur en traitant la réponse. Réessaie stp.');
      }
    } else {
      // Claude is asking clarifying questions
      bot.sendMessage(chatId, claudeResponse);
      state.questionCount++;
    }

  } catch (error) {
    console.error('Error processing message:', error);
    bot.sendMessage(chatId, '❌ Une erreur s\'est produite. Réessaie stp.');
  }
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🤖 Jarvis Bot is running...');

