document.addEventListener("DOMContentLoaded", () => {
  const yearSelect = document.getElementById("yearSelect");
  const monthSelect = document.getElementById("monthSelect");
  const modeSelect = document.getElementById("modeSelect");
  const ctx = document.getElementById("leadsChart").getContext("2d");

  // Фейковые данные
  const fakeData = {
    2025: {
      1: [5, 10, 7, 12],
      2: [8, 14, 6, 10],
      3: [12, 9, 15, 18],
    }
  };

  // Заполняем селекты
  Object.keys(fakeData).forEach(year => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    yearSelect.appendChild(opt);
  });

  function updateMonths(year) {
    monthSelect.innerHTML = "";
    Object.keys(fakeData[year]).forEach(month => {
      const opt = document.createElement("option");
      opt.value = month;
      opt.textContent = month;
      monthSelect.appendChild(opt);
    });
  }

  let chart;

  function updateChart() {
    const year = yearSelect.value;
    const month = monthSelect.value;
    const mode = modeSelect.value;

    let labels, data;

    if (mode === "weeks") {
      labels = ["1 неделя", "2 неделя", "3 неделя", "4 неделя"];
      data = fakeData[year][month];
    } else {
      labels = Object.keys(fakeData[year]);
      data = labels.map(m => fakeData[year][m].reduce((a, b) => a + b, 0));
    }

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Лиды",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "#fff"
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#fff" }
          },
          y: {
            ticks: { color: "#fff" }
          }
        }
      }
    });
  }

  // Слушатели
  yearSelect.addEventListener("change", () => {
    updateMonths(yearSelect.value);
    updateChart();
  });
  monthSelect.addEventListener("change", updateChart);
  modeSelect.addEventListener("change", updateChart);

  // Первоначальная инициализация
  yearSelect.value = Object.keys(fakeData)[0];
  updateMonths(yearSelect.value);
  monthSelect.value = Object.keys(fakeData[yearSelect.value])[0];
  updateChart();
});

