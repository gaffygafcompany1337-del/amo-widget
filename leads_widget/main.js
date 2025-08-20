AMOCRM.widgets.init().then(() => {
    const ctx = document.getElementById('leadsChart').getContext('2d');
    let chart;
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const viewSelect = document.getElementById('viewSelect');

    let leadsData = [];

    const fetchAllLeads = () => {
        return AMOCRM.api.call('GET', '/api/v4/leads', {}).then(data => {
            leadsData = data._embedded ? data._embedded.leads : [];
            populateYearSelect();
        });
    };

    const populateYearSelect = () => {
        const years = [...new Set(leadsData.map(l => new Date(l.created_at*1000).getFullYear()))];
        yearSelect.innerHTML = '';
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        });
        populateMonthSelect();
        renderChart();
    };

    const populateMonthSelect = () => {
        const selectedYear = parseInt(yearSelect.value);
        const months = [...new Set(leadsData
            .filter(l => new Date(l.created_at*1000).getFullYear() === selectedYear)
            .map(l => new Date(l.created_at*1000).getMonth() + 1)
        )];
        monthSelect.innerHTML = '';
        months.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            monthSelect.appendChild(opt);
        });
    };

    const renderChart = () => {
        const mode = viewSelect.value;
        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value);

        let periods = {};

        if(mode === 'week'){
            const monthLeads = leadsData.filter(l => {
                const d = new Date(l.created_at*1000);
                return d.getFullYear() === year && d.getMonth()+1 === month;
            });
            monthLeads.forEach(lead => {
                const d = new Date(lead.created_at*1000);
                const week = Math.ceil(d.getDate()/7);
                if(!periods[week]) periods[week] = { total:0, won:0 };
                periods[week].total++;
                if(lead.status_id === 142) periods[week].won++;
            });
        } else {
            const yearLeads = leadsData.filter(l => new Date(l.created_at*1000).getFullYear() === year);
            yearLeads.forEach(lead => {
                const m = new Date(lead.created_at*1000).getMonth() + 1;
                if(!periods[m]) periods[m] = { total:0, won:0 };
                periods[m].total++;
                if(lead.status_id === 142) periods[m].won++;
            });
        }

        const labels = Object.keys(periods).map(p => mode==='week'?`Неделя ${p}`:`Месяц ${p}`);
        const totalLeads = Object.values(periods).map(p => p.total);
        const conversion = Object.values(periods).map(p => ((p.won/p.total)*100).toFixed(1));
        const barColors = conversion.map(c => c==0?'rgba(255,99,132,0.7)':'rgba(54,162,235,0.5)');

        if(chart) chart.destroy();
        chart = new Chart(ctx, {
            type:'bar',
            data:{
                labels,
                datasets:[
                    { type:'bar', label:'Лиды', data: totalLeads, backgroundColor: barColors },
                    { type:'line', label:'Конверсия %', data: conversion,
                      borderColor:'rgba(255,206,86,1)',
                      backgroundColor:'rgba(255,206,86,0.2)',
                      yAxisID:'y1', fill:false, tension:0.2, pointRadius:5, pointHoverRadius:8
                    }
                ]
            },
            options:{
                responsive:true,
                plugins:{
                    legend:{ labels:{ color:'#fff' } },
                    tooltip:{
                        callbacks:{
                            label:function(ctx){
                                if(ctx.dataset.type==='bar'){
                                    const conv = conversion[ctx.dataIndex];
                                    return `Лиды: ${ctx.raw}, Конверсия: ${conv}%`;
                                } else return `Конверсия: ${ctx.raw}%`;
                            }
                        }
                    }
                },
                scales:{
                    x:{ ticks:{ color:'#fff' } },
                    y:{ beginAtZero:true, position:'left', title:{ display:true, text:'Лиды', color:'#fff' }, ticks:{ color:'#fff' } },
                    y1:{ beginAtZero:true, position:'right', title:{ display:true, text:'Конверсия %', color:'#fff' }, ticks:{ color:'#fff' } }
                }
            }
        });
    };

    yearSelect.addEventListener('change', () => { populateMonthSelect(); renderChart(); });
    monthSelect.addEventListener('change', renderChart);
    viewSelect.addEventListener('change', renderChart);

    fetchAllLeads();
});
