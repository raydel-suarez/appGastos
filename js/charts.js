import { CATEGORIAS, COLORES_CAT, MESES } from './constants.js';

let donaChart = null;
let barrasChart = null;

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function initCharts() {
  const ctxDona = document.getElementById('graficoDona').getContext('2d');
  const ctxBarras = document.getElementById('graficoBarras').getContext('2d');

  donaChart = new Chart(ctxDona, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: [], borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'right', labels: { font: { size: 12 }, padding: 12 } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.parsed;
              return ` RD$${val.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
            }
          }
        }
      }
    }
  });

  barrasChart = new Chart(ctxBarras, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: '#6366f1',
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` RD$${ctx.parsed.y.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `RD$${v.toLocaleString('es-DO')}`
          }
        }
      }
    }
  });
}

export function updateCharts(gastos, periodo, rangeStart) {
  updateDona(gastos);
  updateBarras(gastos, periodo, rangeStart);
}

function updateDona(gastos) {
  if (gastos.length === 0) {
    donaChart.data.labels = ['Sin gastos'];
    donaChart.data.datasets[0].data = [1];
    donaChart.data.datasets[0].backgroundColor = ['#e2e8f0'];
    donaChart.update();
    return;
  }

  const totales = {};
  CATEGORIAS.forEach(c => { totales[c] = 0; });
  gastos.forEach(g => { totales[g.categoria] = (totales[g.categoria] || 0) + g.monto; });

  const labels = [];
  const data = [];
  const colors = [];

  CATEGORIAS.forEach((cat, i) => {
    if (totales[cat] > 0) {
      labels.push(cat);
      data.push(totales[cat]);
      colors.push(COLORES_CAT[i]);
    }
  });

  donaChart.data.labels = labels;
  donaChart.data.datasets[0].data = data;
  donaChart.data.datasets[0].backgroundColor = colors;
  donaChart.update();
}

function updateBarras(gastos, periodo, rangeStart) {
  let labels, data;

  if (periodo === 'semanal') {
    const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    labels = DIAS;
    const start = new Date(rangeStart + 'T00:00:00');
    data = DIAS.map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const ds = toDateStr(d);
      return gastos.filter(g => g.fecha === ds).reduce((sum, g) => sum + g.monto, 0);
    });
  } else if (periodo === 'mensual') {
    const [yearStr, monthStr] = rangeStart.split('-');
    const weeks = getWeeksInMonth(parseInt(yearStr), parseInt(monthStr) - 1);
    labels = weeks.map(w => w.label);
    data = weeks.map(w =>
      gastos.filter(g => g.fecha >= w.start && g.fecha <= w.end).reduce((sum, g) => sum + g.monto, 0)
    );
  } else {
    labels = MESES;
    const year = parseInt(rangeStart.split('-')[0]);
    data = MESES.map((_, i) => {
      const monthStr = String(i + 1).padStart(2, '0');
      const start = `${year}-${monthStr}-01`;
      const lastDay = new Date(year, i + 1, 0).getDate();
      const end = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
      return gastos.filter(g => g.fecha >= start && g.fecha <= end).reduce((sum, g) => sum + g.monto, 0);
    });
  }

  barrasChart.data.labels = labels;
  barrasChart.data.datasets[0].data = data;
  barrasChart.update();
}

function getWeeksInMonth(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  const dayOfWeek = firstDay.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const firstMonday = new Date(firstDay);
  firstMonday.setDate(firstDay.getDate() + diff);

  const weeks = [];
  let current = new Date(firstMonday);
  let num = 1;

  while (current <= lastDay) {
    const start = new Date(current);
    const end = new Date(current);
    end.setDate(end.getDate() + 6);
    weeks.push({ label: `Sem ${num}`, start: toDateStr(start), end: toDateStr(end) });
    current.setDate(current.getDate() + 7);
    num++;
  }

  return weeks;
}
