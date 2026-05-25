// Strava-Monatskalender
// Lädt activities.json (von der GitHub Action erzeugt) und zeigt
// pro Tag, an dem eine Aktivität stattfand, eine grüne Markierung.

(function () {
    const MONTHS = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember",
    ];
    const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

    const root = document.getElementById("strava-calendar");
    if (!root) return;

    let activitiesByDay = {}; // "YYYY-MM-DD" -> [Aktivität, ...]
    let viewYear, viewMonth; // aktuell angezeigter Monat
    let updatedAt = null;

    // Lokalen Datumsschlüssel bauen (ohne Zeitzonen-Verschiebung)
    function dayKey(dateStr) {
        return dateStr.slice(0, 10); // start_date_local ist bereits lokal
    }

    function formatActivity(a) {
        const bits = [`<strong>${a.name}</strong>`, a.type];
        if (a.distance_km > 0) bits.push(`${a.distance_km} km`);
        if (a.moving_time_min > 0) bits.push(`${a.moving_time_min} min`);
        if (a.elevation_m > 0) bits.push(`${a.elevation_m} hm`);
        return bits.join(" · ");
    }

    function render() {
        const first = new Date(viewYear, viewMonth, 1);
        const startWeekday = (first.getDay() + 6) % 7; // Mo=0 ... So=6
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const today = new Date();

        let html = `
      <div class="strava-cal-head">
        <h3 class="strava-cal-title">Meine Aktivitäten</h3>
        <div class="strava-cal-nav">
          <button type="button" data-dir="-1" aria-label="Vorheriger Monat">‹</button>
          <span class="strava-cal-month">${MONTHS[viewMonth]} ${viewYear}</span>
          <button type="button" data-dir="1" aria-label="Nächster Monat">›</button>
        </div>
      </div>
      <div class="strava-cal-weekdays">
        ${WEEKDAYS.map((d) => `<span>${d}</span>`).join("")}
      </div>
      <div class="strava-cal-grid">`;

        // Leere Zellen vor dem Monatsersten
        for (let i = 0; i < startWeekday; i++) {
            html += `<div class="strava-cal-day empty"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const acts = activitiesByDay[key];
            const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;

            const classes = ["strava-cal-day"];
            if (acts) classes.push("has-activity");
            if (isToday) classes.push("today");
            // Wochentag dieses Tages (0=Mo ... 6=So); letzte Spalten -> Tooltip linksbündig
            const colIndex = (startWeekday + day - 1) % 7;
            if (colIndex >= 5) classes.push("edge-right");

            let cell = `<div class="${classes.join(" ")}"><span>${day}</span>`;
            if (acts) {
                cell += `<span class="day-dot"></span>`;
                const lines = acts.map(formatActivity).join("<br>");
                cell += `<div class="day-tooltip">${lines}</div>`;
            }
            cell += `</div>`;
            html += cell;
        }

        html += `</div>`;

        if (updatedAt) {
            const d = new Date(updatedAt);
            html += `<div class="strava-cal-footer">Zuletzt aktualisiert: ${d.toLocaleDateString("de-CH")}</div>`;
        }

        root.innerHTML = html;

        root.querySelectorAll(".strava-cal-nav button").forEach((btn) => {
            btn.addEventListener("click", () => {
                const dir = parseInt(btn.dataset.dir, 10);
                viewMonth += dir;
                if (viewMonth < 0) { viewMonth = 11; viewYear--; }
                if (viewMonth > 11) { viewMonth = 0; viewYear++; }
                render();
            });
        });
    }

    function showStatus(msg) {
        root.innerHTML = `<div class="strava-cal-status">${msg}</div>`;
    }

    async function init() {
        showStatus("Aktivitäten werden geladen …");
        try {
            const res = await fetch("activities.json", { cache: "no-cache" });
            if (!res.ok) throw new Error(res.status);
            const data = await res.json();

            updatedAt = data.updated_at;
            activitiesByDay = {};
            (data.activities || []).forEach((a) => {
                const key = dayKey(a.date);
                (activitiesByDay[key] = activitiesByDay[key] || []).push(a);
            });

            // Start im aktuellen Monat
            const now = new Date();
            viewYear = now.getFullYear();
            viewMonth = now.getMonth();
            render();
        } catch (err) {
            console.error("Strava-Kalender konnte nicht geladen werden:", err);
            showStatus("Aktivitäten konnten gerade nicht geladen werden.");
        }
    }

    init();
})();
