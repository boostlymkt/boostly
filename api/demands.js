const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const r = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100, sorts: [{ timestamp: 'created_time', direction: 'descending' }] }),
      });
      const data = await r.json();
      const demands = (data.results || []).map(p => ({
        id: p.id,
        title:      p.properties['Nome']?.title?.[0]?.plain_text || '',
        client:     p.properties['Cliente']?.select?.name || '',
        type:       p.properties['Tipo']?.select?.name || '',
        status:     p.properties['Status']?.select?.name || 'todo',
        assignee:   p.properties['Responsável']?.select?.name || '',
        priority:   p.properties['Prioridade']?.select?.name || '🟡',
        deadline:   p.properties['Prazo']?.date?.start || '',
        notes:      p.properties['Observações']?.rich_text?.[0]?.plain_text || '',
      }));
      return res.status(200).json(demands);
    }

    if (req.method === 'POST') {
      const d = req.body;
      const r = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent: { database_id: DB_ID },
          properties: {
            'Nome':        { t
