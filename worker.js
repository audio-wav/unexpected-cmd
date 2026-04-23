export default {
    async fetch(request, env) {
        const { pathname } = new URL(request.url);
        
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers });
        }

        try {
            if (pathname === "/") {
                const row = await env.DB.prepare("SELECT count FROM stats WHERE id = 'executions'").first();
                const total = row?.count || 0;
                
                const html = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>unexpected tracking</title>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap" rel="stylesheet">
                    <style>
                        body { margin: 0; background: #080808; color: #fff; font-family: 'Outfit', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                        .box { text-align: center; }
                        h1 { font-size: 12px; text-transform: uppercase; letter-spacing: 4px; color: #444; margin: 0 0 10px 0; font-weight: 400; }
                        .val { font-size: 84px; font-weight: 600; background: linear-gradient(180deg, #fff 0%, #444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
                        .indicator { margin-top: 30px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 11px; color: #222; text-transform: uppercase; letter-spacing: 1px; }
                        .dot { width: 6px; height: 6px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 12px #00ff88; }
                    </style>
                </head>
                <body>
                    <div class="box">
                        <h1>Executions</h1>
                        <div class="val">${total.toLocaleString()}</div>
                        <div class="indicator"><div class="dot"></div> System Active</div>
                    </div>
                </body>
                </html>`;
                
                return new Response(html, { headers: { ...headers, "Content-Type": "text/html" } });
            }

            if (pathname === "/track" && request.method === "POST") {
                const key = request.headers.get("X-Session-Key");
                const agent = request.headers.get("User-Agent") || "";
                
                if (key !== "UX_PRIVATE_SIG_8821" || !agent.toLowerCase().includes("roblox")) {
                    return new Response("Unauthorized", { status: 401, headers });
                }

                const isWeb = request.headers.has("sec-fetch-mode") || request.headers.has("sec-ch-ua");
                if (isWeb) {
                    return new Response("Forbidden", { status: 403, headers });
                }

                const rawIp = request.headers.get("CF-Connecting-IP") || "unknown";
                const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawIp));
                const identity = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
                
                const stamp = Math.floor(Date.now() / 1000);
                
                const entry = await env.DB.prepare(
                    "SELECT last_ts FROM rate_limits WHERE ip = ?"
                ).bind(identity).first();

                if (entry && (stamp - entry.last_ts) < 30) {
                    return new Response("Spam", { status: 429, headers });
                }

                await env.DB.batch([
                    env.DB.prepare("UPDATE stats SET count = count + 1 WHERE id = 'executions'"),
                    env.DB.prepare("INSERT OR REPLACE INTO rate_limits (ip, last_ts) VALUES (?, ?)").bind(identity, stamp)
                ]);

                return new Response("OK", { headers });
            }

            if (pathname === "/stats" && request.method === "GET") {
                const data = await env.DB.prepare(
                    "SELECT count FROM stats WHERE id = 'executions'"
                ).first();
                
                return new Response(JSON.stringify({ count: data?.count || 0 }), {
                    headers: { ...headers, "Content-Type": "application/json" },
                });
            }

            return new Response("Not found", { status: 404, headers });
            
        } catch (error) {
            return new Response("Error", { status: 500, headers });
        }
    }
}
