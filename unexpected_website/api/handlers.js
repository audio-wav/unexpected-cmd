import { getUnexpectedUI } from './ui.js';

export async function handleTrack(request, env) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Key",
    };

    const key = request.headers.get("X-Session-Key");
    const agent = request.headers.get("User-Agent") || "unknown";

    const validKey = env.SESSION_KEY || "UX_PRIVATE_SIG_8821";

    if (key !== validKey) {
        return new Response("Unauthorized", { status: 401, headers });
    }

    const rawIp = request.headers.get("CF-Connecting-IP") || "unknown";
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawIp));
    const identity = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const now = Math.floor(Date.now() / 1000);

    const entry = await env.UNEXPECTED_DB.prepare(
        "SELECT last_ts FROM rate_limits WHERE ip = ?"
    ).bind(identity).first();

    if (entry && (now - entry.last_ts) < 10) {
        return new Response("Spam", { status: 429, headers });
    }

    await env.UNEXPECTED_DB.batch([
        env.UNEXPECTED_DB.prepare("INSERT INTO stats (id, count) VALUES ('executions', 1) ON CONFLICT(id) DO UPDATE SET count = count + 1"),
        env.UNEXPECTED_DB.prepare("INSERT OR REPLACE INTO rate_limits (ip, last_ts) VALUES (?, ?)").bind(identity, now)
    ]);

    return new Response("OK", { headers });
}

export async function handleStats(request, env) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    const now = Math.floor(Date.now() / 1000);
    const wantsJson = request.headers.get("Accept")?.includes("application/json") || !request.headers.get("Accept")?.includes("text/html");

    const statsRows = await env.UNEXPECTED_DB.prepare("SELECT id, count FROM stats WHERE id IN ('executions', 'peak_sessions')").all();
    const stats = Object.fromEntries(statsRows.results.map(r => [r.id, r.count]));

    const totalExecutions = stats.executions || 0;
    let peakSessions = stats.peak_sessions || 0;

    const activeRow = await env.UNEXPECTED_DB.prepare("SELECT COUNT(*) as count FROM rate_limits WHERE last_ts >= ?").bind(now - 3600).first();
    const activeSessions = activeRow?.count || 0;

    if (activeSessions > peakSessions) {
        peakSessions = activeSessions;
        await env.UNEXPECTED_DB.prepare("INSERT INTO stats (id, count) VALUES ('peak_sessions', ?) ON CONFLICT(id) DO UPDATE SET count = ?").bind(peakSessions, peakSessions).run();
    }

    if (wantsJson) {
        return new Response(JSON.stringify({ totalExecutions, activeSessions, peakSessions }), {
            headers: { ...headers, "Content-Type": "application/json" },
        });
    }

    return new Response(getUnexpectedUI({ totalExecutions, activeSessions, peakSessions }), {
        headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    });
}
