AMOCRM.widgets.init().then(() => {
    const widget = AMOCRM.widgets.widgets['leads_conversion_widget'];
    const ctx = document.getElementById('leadsChart').getContext('2d');
    let chart;

    const fetchDataAndRender = (year, month) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        fetch(`https://your-domain.amocrm.ru/api/v4/leads?filter[date_create][from]=${Math.floor(firstDay/1000)}&filter[date_create][to]=${Math.floor(lastDay/1000)}`, {
            headers: {
                'Authorization': `Bearer ${widget.token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            const leads = data._embedded.leads || [];
            const weeks = {};
            leads.forEach(lead => {
                const date = new Date(lead.created_at * 1000);
                const weekNumber = Math.ceil(date.getDate() / 7);
                if (!weeks[weekNumber]) weeks[weekNumber] = { total: 0, won: 0 };
                weeks[weekNumber].total++;
                if (lead.status_id === 142) weeks[weekNumber].won++;
            });

            const labels = Object.keys(weeks).map(w => `Неделя ${w}`);
            const totalLeads = Object.values(weeks).map(w => w.total);
            const conversion = Object.values(weeks).map(w => (w.won / w.total * 100).toFixed(1));

            const barColors = conversion.map(c => c == 0 ? 'rgba(255, 99, 132, 0.7)' : 'rgba(54, 162, 235, 0.5)');

            if(chart) chart.destroy();

            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Лиды',
                            data: totalLeads,
                            backgroundColor: barColors
                        },
                        {
                            type: 'line',
                            label: 'Конверсия %',
                            data: conversion,
                            borderColor: 'rgba(255, 206, 86, 1)',
                            backgroundColor: 'rgba(255, 206, 86, 0.2)',
                            yAxisID: 'y1',
                            fill: false,
                            tension: 0.2,
                            pointRadius: 5,
                            pointHoverRadius: 8
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    if(context.dataset.type === 'bar'){
                                        const conv = conversion[context.dataIndex];
                                        return `Лиды: ${context.raw}, Конверсия: ${conv}%`;
                                    } else {
                                        return `Конверсия: ${context.raw}%`;
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Лиды' } },
                        y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'Конверсия %' } }
                    }
                }
            });
        });
    };

    const monthSelect = document.getElementById('monthSelect');
    const now = new Date();
    monthSelect.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    fetchDataAndRender(now.getFullYear(), now.getMonth());

    monthSelect.addEventListener('change', () => {
        const [year, month] = monthSelect.value.split('-').map(Number);
        fetchDataAndRender(year, month - 1);
    });
});
