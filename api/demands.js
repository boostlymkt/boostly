const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.NOTION_DB_ID;

module.exports = async function handler(req, res) {
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
        title:    p.properties['Nome']?.title?.[0]?.plain_text || '',
        client:   p.properties['Cliente']?.select?.name || '',
        type:     p.properties['Tipo']?.select?.name || '',
        status:   p.properties['Status']?.select?.name || 'todo',
        assignee: p.properties['Responsável']?.select?.name || '',
        priority: p.properties['Prioridade']?.select?.name || '🟡',
        deadline: p.properties['Prazo']?.date?.start || '',
        notes:    p.properties['Observações']?.rich_text?.[0]?.plain_text || '',
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
            'Nome':        { title: [{ text: { content: d.title || '' } }] },
            'Cliente':     { select: { name: d.client || '' } },
            'Tipo':        { select: { name: d.type || '' } },
            'Status':      { select: { name: d.status || 'todo' } },
            'Responsável': { select: { name: d.assignee || '' } },
            'Prioridade':  { select: { name: d.priority || '🟡' } },
            'Prazo':       d.deadline ? { date: { start: d.deadline } } : { date: null },
            'Observações': { rich_text: [{ text: { content: d.notes || '' } }] },
          },
        }),
      });
      const page = await r.json();
      return res.status(200).json({ id: page.id });
    }

    if (req.method === 'PATCH') {
      const { id, ...d } = req.body;
      const props = {};
      if (d.title !== undefined)    props['Nome']        = { title: [{ text: { content: d.title } }] };
      if (d.client !== undefined)   props['Cliente']     = { select: { name: d.client } };
      if (d.type !== undefined)     props['Tipo']        = { select: { name: d.type } };
      if (d.status !== undefined)   props['Status']      = { select: { name: d.status } };
      if (d.assignee !== undefined) props['Responsável'] = { select: { name: d.assignee } };
      if (d.priority !== undefined) props['Prioridade']  = { select: { name: d.priority } };
      if (d.deadline !== undefined) props['Prazo']       = d.deadline ? { date: { start: d.deadline } } : { date: null };
      if (d.notes !== undefined)    props['Observações'] = { rich_text: [{ text: { content: d.notes } }] };
      await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: props }),
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
