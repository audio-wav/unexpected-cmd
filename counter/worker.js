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
            const now = Math.floor(Date.now() / 1000);

            if (pathname === "/track" && request.method === "POST") {
                const key = request.headers.get("X-Session-Key");
                const agent = request.headers.get("User-Agent") || "unknown";

                const validKey = env.SESSION_KEY || "UX_PRIVATE_SIG_8821";

                if (key !== validKey) {
                    console.log(`[TRACK] Rejecting request: Invalid session key from ${agent}`);
                    return new Response("Unauthorized", { status: 401, headers });
                }
                console.log(`[TRACK] Request from: ${agent}`);

                const rawIp = request.headers.get("CF-Connecting-IP") || "unknown";
                const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawIp));
                const identity = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

                const entry = await env.DB.prepare(
                    "SELECT last_ts FROM rate_limits WHERE ip = ?"
                ).bind(identity).first();

                if (entry && (now - entry.last_ts) < 10) {
                    console.log(`[TRACK] Rate limited: ${identity}`);
                    return new Response("Spam", { status: 429, headers });
                }

                await env.DB.batch([
                    env.DB.prepare("INSERT INTO stats (id, count) VALUES ('executions', 1) ON CONFLICT(id) DO UPDATE SET count = count + 1"),
                    env.DB.prepare("INSERT OR REPLACE INTO rate_limits (ip, last_ts) VALUES (?, ?)").bind(identity, now)
                ]);

                console.log(`[TRACK] Success: ${identity}`);
                return new Response("OK", { headers });
            }

            if (pathname === "/" || pathname === "/stats") {
                const wantsJson = pathname === "/stats" && (request.headers.get("Accept")?.includes("application/json") || !request.headers.get("Accept")?.includes("text/html"));

                if (wantsJson && request.method === "GET") {
                    const data = await env.DB.prepare(
                        "SELECT count FROM stats WHERE id = 'executions'"
                    ).first();
                    return new Response(JSON.stringify({ count: data?.count || 0 }), {
                        headers: { ...headers, "Content-Type": "application/json" },
                    });
                }

                if (request.method === "GET") {
                    const row = await env.DB.prepare("SELECT count FROM stats WHERE id = 'executions'").first();
                    const totalExecutions = row?.count || 0;

                    const activeRow = await env.DB.prepare("SELECT COUNT(*) as count FROM rate_limits WHERE last_ts >= ?").bind(now - 3600).first();
                    const activeSessions = activeRow?.count || 0;

                    const html = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Unexpected Counter</title>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
                        <style>
                            :root {
                                --bg-color: #030305;
                                --card-bg: rgba(255, 255, 255, 0.02);
                                --card-border: rgba(255, 255, 255, 0.05);
                                --text-main: #f0f0f0;
                                --text-muted: #888;
                                --accent-1: #00f0ff;
                                --accent-2: #00ff88;
                            }
                    
                            * {
                                box-sizing: border-box;
                                margin: 0;
                                padding: 0;
                            }
                    
                            body { 
                                background-color: var(--bg-color);
                                background-image: 
                                    radial-gradient(circle at 15% 50%, rgba(0, 240, 255, 0.04), transparent 25%),
                                    radial-gradient(circle at 85% 30%, rgba(0, 255, 136, 0.04), transparent 25%);
                                color: var(--text-main); 
                                font-family: 'Inter', sans-serif; 
                                min-height: 100vh;
                                display: flex; 
                                flex-direction: column;
                                align-items: center; 
                                justify-content: center;
                                overflow: hidden;
                            }
                    
                            .container {
                                width: 100%;
                                max-width: 800px;
                                padding: 2rem;
                                z-index: 10;
                            }
                    
                            header {
                                text-align: center;
                                margin-bottom: 3rem;
                                animation: fadeInDown 0.8s ease-out;
                            }
                    
                            h1 { 
                                font-size: 14px; 
                                text-transform: uppercase; 
                                letter-spacing: 6px; 
                                color: var(--text-muted); 
                                font-weight: 600; 
                                margin-bottom: 12px;
                            }
                    
                            .status-badge {
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                padding: 6px 14px;
                                background: rgba(0, 255, 136, 0.05);
                                border: 1px solid rgba(0, 255, 136, 0.2);
                                border-radius: 20px;
                                font-size: 11px;
                                text-transform: uppercase;
                                letter-spacing: 1.5px;
                                color: var(--accent-2);
                            }
                    
                            .pulse {
                                width: 6px;
                                height: 6px;
                                background-color: var(--accent-2);
                                border-radius: 50%;
                                box-shadow: 0 0 10px var(--accent-2);
                                animation: blink 2s infinite;
                            }
                    
                            .grid {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                                gap: 1.5rem;
                            }
                    
                            .card {
                                background: var(--card-bg);
                                border: 1px solid var(--card-border);
                                border-radius: 16px;
                                padding: 2.5rem;
                                backdrop-filter: blur(20px);
                                -webkit-backdrop-filter: blur(20px);
                                transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                                animation: fadeInUp 0.8s ease-out backwards;
                            }
                    
                            .card:nth-child(1) { animation-delay: 0.1s; }
                            .card:nth-child(2) { animation-delay: 0.2s; }
                    
                            .card:hover {
                                transform: translateY(-5px);
                                border-color: rgba(255, 255, 255, 0.1);
                                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                            }
                    
                            .card-title {
                                font-size: 12px;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                                color: var(--text-muted);
                                margin-bottom: 1rem;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            }
                    
                            .card-value {
                                font-size: 48px;
                                font-weight: 300;
                                background: linear-gradient(135deg, #fff 0%, #aaa 100%);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                line-height: 1.1;
                            }
                    
                            .icon {
                                opacity: 0.5;
                            }
                    
                            .footer {
                                margin-top: 4rem;
                                text-align: center;
                                font-size: 12px;
                                color: var(--text-muted);
                                animation: fadeIn 1s ease-out 1s backwards;
                            }
                    
                            @keyframes blink {
                                0%, 100% { opacity: 1; transform: scale(1); }
                                50% { opacity: 0.4; transform: scale(0.8); }
                            }
                    
                            @keyframes fadeInDown {
                                from { opacity: 0; transform: translateY(-20px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                    
                            @keyframes fadeInUp {
                                from { opacity: 0; transform: translateY(20px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                    
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                    
                            .scanline {
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100px;
                                background: linear-gradient(to bottom, transparent, rgba(0, 240, 255, 0.03), transparent);
                                animation: scan 8s linear infinite;
                                pointer-events: none;
                                z-index: 1;
                            }
                    
                            @keyframes scan {
                                0% { transform: translateY(-100px); }
                                100% { transform: translateY(100vh); }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="scanline"></div>
                        <div class="container">
                            <header>
                                <h1>Unexpected CMD Counter</h1>
                                <div class="status-badge">
                                    <div class="pulse"></div>
                                    Systems Online
                                </div>
                            </header>
                    
                            <div class="grid">
                                <div class="card">
                                    <div class="card-title">
                                        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                        Total Executions
                                    </div>
                                    <div class="card-value">${totalExecutions.toLocaleString()}</div>
                                </div>
                    
                                <div class="card">
                                    <div class="card-title">
                                        <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        Active Sessions (1h)
                                    </div>
                                    <div class="card-value">${activeSessions.toLocaleString()}</div>
                                </div>
                            </div>
                            
                            <div class="footer">
                                unexpected-cmd endpoint &bull; counter active! :3
                            </div>
                        </div>
                    </body>
                    </html>`;
                    return new Response(html, { headers: { ...headers, "Content-Type": "text/html" } });
                }
            }

            return new Response("Not found", { status: 404, headers });

        } catch (error) {
            return new Response("Error", { status: 500, headers });
        }
    }
}
