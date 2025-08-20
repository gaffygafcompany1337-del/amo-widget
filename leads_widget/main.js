AMOCRM.widgets.init().then(() => {
    const widget = AMOCRM.widgets.widgets['leads_conversion_widget'];
    const ctx = document.getElementById('leadsChart').getContext('2d');
    let chart;

    const fetchDataAndRender = async (year, month) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        try {
            const response = await AMOCRM.api.call(
                'GET',
                `/api/v4/leads?filter[date_create][from]=${Math.floor(firstDay/1000)}&filter[date_create][to]=${Math.floor(lastDay/1000)}`
            );

            const leads = response._embedded?.leads || [];
            const pipelineId = leads[0]?.pipeline_id || null;

            const pipelineResponse = await AMOCRM.api.call('GET', `/api/v4/leads/pipelines`);
            const pipeline = pipelineResponse._embedded.pipelines.find(p => p.id === pipelineId);
            const wonStatusIds = pipeline?.statuses.filter(s => s.type === 'won').map(s => s.id) || [];

            const weeks = {};
            leads.forEach(lead => {
                const date = new Date(lead.created_at * 1000);
                const weekNumber = Math.ceil(date.getDate() / 7);
                if (!weeks[weekNumber]) weeks[weekNumber] = { total: 0, won: 0 };
                weeks[weekNumber].total++;
                if (wonStatusIds.includes(lead.status_id)) weeks[weekNumber].won++;
            });

            const labels = Object.keys(weeks).map(w => `Неделя ${w}`);
            const totalLeads = Object.values(weeks).map(w => w.total);
            const conversion = Object.values(weeks).map(w => (w.won / w.total * 100).toFixed(1));

            const barColors = conversion.map(c => c == 0 ? 'rgba(255, 99, 132, 0.7)' : 'rgba(54, 162, 235, 0.7)');
            const lineColor = 'rgba(255, 206, 86, 1)';
            const lineBgColor = 'rgba(255, 206, 86, 0.2)';

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
                            borderColor: lineColor,
                            backgroundColor: lineBgColor,
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
                        legend: { labels: { color: '#fff' } },
                        tooltip: {
                            backgroundColor: '#333',
                            titleColor: '#fff',
                            bodyColor: '#fff',
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
                        x: { ticks: { color: '#fff' }, grid: { color: '#444' } },
                        y: { ticks: { color: '#fff' }, grid: { color: '#444' }, position: 'left', title: { display: true, text: 'Лиды', color: '#fff' } },
                        y1: { ticks: { color: '#fff' }, grid: { color: '#444' }, position: 'right', title: { display: true, text: 'Конверсия %', color: '#fff' } }
                    }
                }
            });

        } catch (err) {
            console.error('Ошибка при получении данных виджета:', err);
        }
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


