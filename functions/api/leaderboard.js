export async function onRequestGet({ env }) {
  if (!env.DB) return Response.json({ error: "Banco D1 não configurado." }, { status: 503 });
  try {
    const { results } = await env.DB.prepare(
      "SELECT player_name AS name, MAX(score) AS score FROM scores GROUP BY LOWER(player_name) ORDER BY score DESC, MIN(created_at) ASC LIMIT 10"
    ).all();
    return Response.json({ scores: results || [] }, {
      headers: { "Cache-Control": "public, max-age=30" }
    });
  } catch (error) {
    return Response.json({ error: "Não foi possível carregar o ranking." }, { status: 500 });
  }
}
