export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            if (url.pathname === "/track" && request.method === "POST") {
                const ip = request.headers.get("CF-Connecting-IP") || "unknown";
                const now = Math.floor(Date.now() / 1000);
                const THRESHOLD = 30;

                const lastTrack = await env.DB.prepare(
                    "SELECT last_ts FROM rate_limits WHERE ip = ?"
                ).bind(ip).first();

                if (lastTrack && (now - lastTrack.last_ts) < THRESHOLD) {
                    return new Response("Spam Filter Active", { status: 429, headers: corsHeaders });
                }

                await env.DB.batch([
                    env.DB.prepare("UPDATE stats SET count = count + 1 WHERE id = 'executions'"),
                    env.DB.prepare("INSERT OR REPLACE INTO rate_limits (ip, last_ts) VALUES (?, ?)").bind(ip, now)
                ]);

                return new Response("OK", { headers: corsHeaders });
            }

            if (url.pathname === "/stats" && request.method === "GET") {
                const { count } = await env.DB.prepare(
                    "SELECT count FROM stats WHERE id = 'executions'"
                ).first();
                return new Response(JSON.stringify({ count }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            return new Response("Not Found", { status: 404, headers: corsHeaders });
        } catch (err) {
            return new Response(err.message, { status: 500, headers: corsHeaders });
        }
    },
};
