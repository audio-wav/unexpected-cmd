// WE VALUE TRANSPARENCY. THIS IS THE LEGITIMATE SOURCE CODE OF THE COUNTER/STATS/TRACKER WORKER.
// YOU MAY VISIT IT AT: https://globalzen-api.renern.workers.dev/unexpected

import { getHeader, tokens } from '../../shared/ui/components.js';

export function getUnexpectedUI(data) {
    const { totalExecutions, activeSessions, peakSessions, totalIdentities, colo } = data;

    let loadStatus = "Normal";
    if (activeSessions > 100) loadStatus = "High";
    if (activeSessions > 500) loadStatus = "Peak";

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unexpected Stats | GlobalZen</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
    <style>
        ${tokens}

        body {
            background-image: radial-gradient(#f0f0f0 1px, transparent 1px);
            background-size: 32px 32px;
        }

        .container { max-width: 1000px; margin: 0 auto; padding: 60px 24px; }

        header {
            margin-bottom: 80px;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
        }

        h1 { 
            font-size: 56px; 
            font-weight: 900; 
            letter-spacing: -0.06em; 
            line-height: 0.85;
        }
        
        .node-badge {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 16px;
            background: #000;
            color: #fff;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .pulse {
            width: 8px; height: 8px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 10px #10b981;
            animation: pulse-op 1.5s infinite;
        }

        @keyframes pulse-op {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 40px;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stat-card:hover {
            border-color: #000;
            transform: translateY(-8px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.06);
        }

        .stat-label {
            font-size: 11px;
            font-weight: 800;
            color: #aaa;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            margin-bottom: 24px;
            display: block;
        }

        .stat-value {
            font-family: 'JetBrains Mono', monospace;
            font-size: 64px;
            font-weight: 800;
            letter-spacing: -0.08em;
            line-height: 0.9;
            color: #000;
            margin-bottom: 16px;
        }

        .stat-sub { font-size: 13px; color: #888; font-weight: 500; }

        .dashboard-section {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
        }

        .content-box {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 40px;
        }

        .box-title {
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .box-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--border);
        }

        .metric-row {
            display: flex;
            justify-content: space-between;
            padding: 16px 0;
            border-bottom: 1px solid #f9f9f9;
            font-size: 14px;
        }

        .metric-row:last-child { border: 0; }
        .metric-label { color: #888; font-weight: 600; }
        .metric-value { color: #000; font-weight: 800; font-family: 'JetBrains Mono'; }

        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; font-size: 10px; color: #bbb; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px; border-bottom: 1px solid var(--border); }
        .data-table td { padding: 18px 12px; font-size: 14px; border-bottom: 1px solid #f9f9f9; }

        footer {
            margin-top: 100px; padding: 60px 0; border-top: 1px solid var(--border);
            text-align: center; font-size: 11px; font-weight: 800; color: #ccc; letter-spacing: 0.3em;
        }

        @media (max-width: 900px) {
            .dashboard-section { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    ${getHeader('unexpected')}
    <div class="container">
        <header>
            <div>
                <span style="font-size: 13px; font-weight: 800; color: #bbb; letter-spacing: 0.4em; text-transform: uppercase;">Infrastructure Telemetry</span>
                <h1>Unexpected</h1>
            </div>
            <div class="node-badge">
                <div class="pulse"></div>
                Node: ${colo}
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-label">Total Executions</span>
                <div class="stat-value">${(totalExecutions || 0).toLocaleString()}</div>
                <div class="stat-sub">Lifetime command telemetry</div>
            </div>
            <div class="stat-card">
                <span class="stat-label">Active Sessions</span>
                <div class="stat-value">${(activeSessions || 0).toLocaleString()}</div>
                <div class="stat-sub">Concurrent instances (60m)</div>
            </div>
            <div class="stat-card">
                <span class="stat-label">Historical Peak</span>
                <div class="stat-value">${(peakSessions || 0).toLocaleString()}</div>
                <div class="stat-sub">All-time concurrency high</div>
            </div>
        </div>

        <div class="dashboard-section">
            <div class="content-box">
                <h3 class="box-title">Network Statistics</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Identity Retention</strong></td>
                            <td><span style="font-family: 'JetBrains Mono'; font-weight: 800;">${(totalIdentities || 0).toLocaleString()}</span></td>
                            <td style="color: #999; font-size: 12px;">Unique client hashes in env.UNEXPECTED_DB</td>
                        </tr>
                        <tr>
                            <td><strong>Query Engine</strong></td>
                            <td><span style="font-family: 'JetBrains Mono'; font-weight: 800;">SQLITE_V3</span></td>
                            <td style="color: #999; font-size: 12px;">Standard D1 relational processing</td>
                        </tr>
                        <tr>
                            <td><strong>Namespace</strong></td>
                            <td><span style="font-family: 'JetBrains Mono'; font-weight: 800;">UNEXPECTED_DB</span></td>
                            <td style="color: #999; font-size: 12px;">Isolated environment binding</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="content-box">
                <h3 class="box-title">System Vitals</h3>
                <div class="metric-row">
                    <span class="metric-label">Status</span>
                    <span class="metric-value" style="color: #10b981;">OPERATIONAL</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Load Assess</span>
                    <span class="metric-value">${loadStatus.toUpperCase()}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Infra Tier</span>
                    <span class="metric-value">EDGE_WORKER</span>
                </div>
            </div>
        </div>

        <footer>
            GLOBALZEN_UNEXPECTED • REALTIME_STATS • ${new Date().getFullYear()}
        </footer>
    </div>
</body>
</html>`;
}
