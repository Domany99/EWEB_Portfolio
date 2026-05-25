// Holt einen frischen Access Token, lädt die letzten Aktivitäten
// und schreibt eine schlanke activities.json (nur die Felder, die
// der Kalender braucht — keine Tokens, kein sensibles Material).

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error("Fehlende Strava-Secrets. Bitte in den Repository-Secrets hinterlegen.");
    process.exit(1);
}

async function getAccessToken() {
    const res = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: "refresh_token",
        }),
    });
    if (!res.ok) {
        throw new Error(`Token-Refresh fehlgeschlagen: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    return data.access_token;
}

async function getActivities(token) {
    // per_page=100 deckt locker einen Monat ab; bei Bedarf erhöhen
    const url = "https://www.strava.com/api/v3/athlete/activities?per_page=100";
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error(`Aktivitäten-Abruf fehlgeschlagen: ${res.status} ${await res.text()}`);
    }
    return res.json();
}

function slim(activities) {
    // Nur die nötigen Felder behalten, Distanz in km runden
    return activities.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.sport_type || a.type,
        date: a.start_date_local,
        distance_km: Math.round((a.distance / 1000) * 10) / 10,
        moving_time_min: Math.round(a.moving_time / 60),
        elevation_m: Math.round(a.total_elevation_gain),
    }));
}

async function main() {
    const token = await getAccessToken();
    const activities = await getActivities(token);
    const output = {
        updated_at: new Date().toISOString(),
        activities: slim(activities),
    };
    const fs = await import("node:fs/promises");
    await fs.writeFile("activities.json", JSON.stringify(output, null, 2));
    console.log(`activities.json geschrieben: ${output.activities.length} Aktivitäten.`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
