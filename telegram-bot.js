const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
const notionToken = process.env.NOTION_TOKEN;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const claudeKey = process.env.CLAUDE_API_KEY;

const bot = new TelegramBot(token, { polling: true });

const CLAUDE_MODEL = 'claude-sonnet-4-6';

async function callClaudeAPI(userMessage) {
  try {
    const systemPrompt = `Tu es Jarvis, assistant IA pour Tom chez WeloveFounders.

TÂCHE: Structurer DIRECTEMENT la note brute en JSON sans poser de questions.

Analyse cette note et SEULEMENT crée une structure JSON avec:
{
  "type": "Operation|Metric|Blocage|Note",
  "company": "Nom entreprise ou 'Unknown'",
  "title": "Résumé court de la note",
  "priority": "High|Medium|Low",
  "status": "À faire|In Progress|Done",
  "context": "Détails contextuels",
  "action": "Action proposée ou null"
}

RÈGLES:
- Identifie le type rapidement (Blocage = problème, Operation = action, Metric = données, Note = info)
- Si pas d'entreprise mentionnée: "Unknown"
- Priorité par défaut: "Medium" sauf si urgent
- Sois DIRECT, pas de questions!
- RÉPONDS UNIQUEMENT AVEC LE JSON, rien d'autre`;

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
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ],
        system: systemPrompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API error:', data);
      return null;
    }

    const textContent = data.content.find(c => c.type === 'text');
    if (!textContent) return null;

    // Parse JSON from Claude response
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      const structured = JSON.parse(jsonMatch ? jsonMatch[0] : textContent.text);
      return structured;
    } catch (e) {
      console.error('JSON parse error:', e);
      return null;
    }
  } catch (error) {
    console.error('Claude API call error:', error);
    return null;
  }
}

async function sendToNotion(noteData) {
  if (!noteData) return false;

  try {
    const properties = {
      'Note brute': {
        title: [
          {
            text: {
              content: noteData.title || 'Untitled'
            }
          }
        ]
      },
      'Type': {
        select: {
          name: noteData.type || 'Note'
        }
      },
      'Company': {
        rich_text: [
          {
            text: {
              content: noteData.company || ''
            }
          }
        ]
      },
      'Priority': {
        select: {
          name: noteData.priority || 'Medium'
        }
      },
      'Status': {
        select: {
          name: noteData.status || 'À faire'
        }
      },
      'Context': {
        rich_text: [
          {
            text: {
              content: noteData.context || ''
            }
          }
        ]
      },
      'Action proposée': {
        rich_text: [
          {
            text: {
              content: noteData.action || ''
            }
          }
        ]
      },
      'Date': {
        date: {
          start: new Date().toISOString().split('T')[0]
        }
      }
    };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: {
          database_id: notionDatabaseId
        },
        properties: properties
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Notion API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Notion error:', error);
    return false;
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🤖 Jarvis is ready!\n\nEnvoie-moi une note brute et je la structure directement. Pas de questions! ✨');
});

bot.on('message', async (msg) => {
  if (msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Show thinking
  await bot.sendMessage(chatId, '⏳ Je structure ta note...');

  // Structure with Claude
  const structured = await callClaudeAPI(userMessage);

  if (!structured) {
    await bot.sendMessage(chatId, '❌ Erreur: je n\'ai pas pu traiter cette note.');
    return;
  }

  // Send to Notion
  const success = await sendToNotion(structured);

  if (success) {
    await bot.sendMessage(
      chatId,
      `✅ Note ajoutée à Notion!\n\n📋 Type: ${structured.type}\n🏢 Entreprise: ${structured.company}\n⭐ Priorité: ${structured.priority}`
    );
  } else {
    await bot.sendMessage(chatId, '❌ Erreur: impossible d\'ajouter à Notion.');
  }
});

console.log('🤖 Jarvis Bot is running...');
