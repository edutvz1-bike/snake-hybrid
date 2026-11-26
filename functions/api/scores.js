export async function onRequestPost({ request, env }) {
  if (!env.DB) return Response.json({ error: "Banco D1 não configurado." }, { status: 503 });
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Corpo JSON inválido." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ").slice(0, 16) : "";
  const score = Number(body.score);
  if (!name || !Number.isInteger(score) || score < 1 || score > 100000) {
    return Response.json({ error: "Nome ou pontuação inválidos." }, { status: 400 });
  }
  try {
    await env.DB.prepare("INSERT INTO scores (player_name, score) VALUES (?, ?)").bind(name, score).run();
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Não foi possível salvar a pontuação." }, { status: 500 });
  }
}
