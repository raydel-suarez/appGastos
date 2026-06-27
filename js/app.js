import { isLocalStorageAvailable, getGastos, addGasto, deleteGasto, getGastosByDateRange } from './storage.js';
import { initCharts, updateCharts } from './charts.js';
import { renderTabla, renderLegendas } from './ui.js';

let periodoActivo = 'semanal';

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getDateRange(periodo) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (periodo === 'semanal') {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const lunes = new Date(now);
    lunes.setDate(now.getDate() + diff);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { start: toDateStr(lunes), end: toDateStr(domingo) };
  }

  if (periodo === 'mensual') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: toDateStr(start), end: toDateStr(end) };
  }

  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31);
  return { start: toDateStr(start), end: toDateStr(end) };
}

function getPrevDateRange(periodo) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (periodo === 'semanal') {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const lunes = new Date(now);
    lunes.setDate(now.getDate() + diff - 7);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { start: toDateStr(lunes), end: toDateStr(domingo) };
  }

  if (periodo === 'mensual') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: toDateStr(start), end: toDateStr(end) };
  }

  const start = new Date(now.getFullYear() - 1, 0, 1);
  const end = new Date(now.getFullYear() - 1, 11, 31);
  return { start: toDateStr(start), end: toDateStr(end) };
}

function actualizarDashboard() {
  const { start, end } = getDateRange(periodoActivo);
  const { start: prevStart, end: prevEnd } = getPrevDateRange(periodoActivo);

  const gastosCurrent = getGastosByDateRange(start, end);
  const gastosPrev = getGastosByDateRange(prevStart, prevEnd);

  updateCharts(gastosCurrent, periodoActivo, start);
  renderLegendas(gastosCurrent, gastosPrev, periodoActivo);
  renderTabla(getGastos());
}

function setFechaHoy() {
  document.getElementById('fecha').value = toDateStr(new Date());
}

function validarFormulario() {
  const monto = parseFloat(document.getElementById('monto').value);
  const categoria = document.getElementById('categoria').value;
  document.getElementById('btnAgregar').disabled = !(monto > 0 && categoria);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!isLocalStorageAvailable()) {
    document.getElementById('errorStorage').classList.remove('hidden');
  }

  initCharts();
  setFechaHoy();
  validarFormulario();
  actualizarDashboard();

  // Mobile bottom sheet toggle
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const fab = document.getElementById('btnNuevoGasto');
  const btnCerrar = document.getElementById('btnCerrarSidebar');

  function toggleSidebar(abrir) {
    sidebar.classList.toggle('abierto', abrir);
    overlay.classList.toggle('visible', abrir);
    fab.classList.toggle('activo', abrir);
  }

  fab.addEventListener('click', () => toggleSidebar(!sidebar.classList.contains('abierto')));
  overlay.addEventListener('click', () => toggleSidebar(false));
  btnCerrar.addEventListener('click', () => toggleSidebar(false));

  document.getElementById('monto').addEventListener('input', validarFormulario);
  document.getElementById('categoria').addEventListener('change', validarFormulario);

  document.getElementById('formGasto').addEventListener('submit', (e) => {
    e.preventDefault();
    addGasto({
      id: generarId(),
      fecha: document.getElementById('fecha').value,
      monto: parseFloat(document.getElementById('monto').value),
      categoria: document.getElementById('categoria').value,
      descripcion: document.getElementById('descripcion').value.trim()
    });
    e.target.reset();
    setFechaHoy();
    validarFormulario();
    actualizarDashboard();
    toggleSidebar(false);
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
      tab.classList.add('activo');
      periodoActivo = tab.dataset.periodo;
      actualizarDashboard();
    });
  });

  document.getElementById('cuerpoTabla').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
      deleteGasto(e.target.dataset.id);
      actualizarDashboard();
    }
  });
});
