document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("leadsChart").getContext("2d");

    // Фейковые данные
    const fakeData = {
        2025: {
            1: [10, 15, 20, 25],   // Январь (по неделям)
            2: [12, 18, 22, 30],   // Февраль
            3: [8, 14, 19, 27]     // Март
        }
    };

    let chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["1 неделя", "2 неделя", "3 неделя", "4 неделя"],
            datasets: [{
                label: "Количество лидов",
                data: [],
                borderColor: "white",
                backgroundColor: "rgba(255,255,255,0.2)"
            }]
        },
        options: {
            plugins: { legend: { labels: { color: "white" } } },
            scales: {
                x: { ticks: { color: "white" } },
                y: { ticks: { color: "white" } }
            }
        }
    });

    // Элементы управления
    const yearSelect = document.getElementById("yearSelect");
    const monthSelect = document.getElementById("monthSelect");
    const modeSelect = document.getElementById("modeSelect");

    // Заполняем годы
    Object.keys(fakeData).forEach(year => {
        let opt = document.createElement("option");
        opt
