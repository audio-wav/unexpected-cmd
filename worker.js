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
                await env.DB.prepare(
                    "UPDATE stats SET count = count + 1 WHERE id = 'executions'"
                ).run();
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
