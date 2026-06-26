import { CATEGORIAS, COLORES_CAT } from './constants.js';

const BADGE_COLORS = Object.fromEntries(CATEGORIAS.map((cat, i) => [cat, COLORES_CAT[i]]));

const fmt = (n) =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(n);

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatFecha(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function renderTabla(gastos) {
  const tbody = document.getElementById('cuerpoTabla');
  const msgVacio = document.getElementById('mensajeVacio');

  if (gastos.length === 0) {
    tbody.innerHTML = '';
    msgVacio.classList.remove('hidden');
    return;
  }

  msgVacio.classList.add('hidden');

  const sorted = [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const color = (cat) => BADGE_COLORS[cat] || '#888';

  tbody.innerHTML = sorted.map(g => `
    <tr>
      <td>${formatFecha(g.fecha)}</td>
      <td>
        <span class="badge-categoria"
          style="background:${hexToRgba(color(g.categoria), 0.15)};color:${color(g.categoria)}">
          ${g.categoria}
        </span>
      </td>
      <td class="descripcion-celda">${g.descripcion || '—'}</td>
      <td class="monto-celda">${fmt(g.monto)}</td>
      <td><button class="btn-eliminar" data-id="${g.id}">Eliminar</button></td>
    </tr>
  `).join('');
}

export function renderLegendas(gastosCurrent, gastosPrev, periodo) {
  const el = document.getElementById('leyendas');

  if (gastosCurrent.length === 0) {
    el.innerHTML = '<p class="leyenda-item">Sin gastos registrados en este período.</p>';
    return;
  }

  const periodLabel = { semanal: 'esta semana', mensual: 'este mes', anual: 'este año' }[periodo];
  const prevLabel = { semanal: 'la semana pasada', mensual: 'el mes pasado', anual: 'el año pasado' }[periodo];

  const totalCurrent = gastosCurrent.reduce((s, g) => s + g.monto, 0);
  const totalPrev = gastosPrev.reduce((s, g) => s + g.monto, 0);

  const msgs = [];

  if (totalPrev > 0) {
    const pct = Math.round((totalCurrent - totalPrev) / totalPrev * 100);
    const dir = pct >= 0 ? 'más' : 'menos';
    msgs.push(`Gastaste ${fmt(totalCurrent)} ${periodLabel}, un ${Math.abs(pct)}% ${dir} que ${prevLabel}.`);
  } else {
    msgs.push(`Gastaste ${fmt(totalCurrent)} en total ${periodLabel}.`);
  }

  const byCategory = {};
  gastosCurrent.forEach(g => { byCategory[g.categoria] = (byCategory[g.categoria] || 0) + g.monto; });
  const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  if (topCat) {
    msgs.push(`Tu mayor gasto ${periodLabel} fue en ${topCat[0]} con ${fmt(topCat[1])}.`);
  }

  if (gastosPrev.length > 0) {
    const byCatPrev = {};
    gastosPrev.forEach(g => { byCatPrev[g.categoria] = (byCatPrev[g.categoria] || 0) + g.monto; });

    let biggestCat = null;
    let biggestPct = 0;
    Object.entries(byCategory).forEach(([cat, curr]) => {
      const prev = byCatPrev[cat] || 0;
      if (prev > 0) {
        const absPct = Math.abs((curr - prev) / prev * 100);
        if (absPct > biggestPct) {
          biggestPct = absPct;
          biggestCat = { cat, rawPct: Math.round((curr - prev) / prev * 100) };
        }
      }
    });

    if (biggestCat && biggestPct > 5) {
      const dir = biggestCat.rawPct >= 0 ? 'más' : 'menos';
      msgs.push(`En ${biggestCat.cat} gastaste un ${Math.abs(biggestCat.rawPct)}% ${dir} que ${prevLabel}.`);
    }
  }

  el.innerHTML = msgs.map(m => `<p class="leyenda-item">${m}</p>`).join('');
}
