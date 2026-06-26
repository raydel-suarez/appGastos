const STORAGE_KEY = 'appGastos_gastos';

export function isLocalStorageAvailable() {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return true;
  } catch {
    return false;
  }
}

export function getGastos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGastos(gastos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gastos));
}

export function addGasto(gasto) {
  const gastos = getGastos();
  gastos.push(gasto);
  saveGastos(gastos);
}

export function deleteGasto(id) {
  saveGastos(getGastos().filter(g => g.id !== id));
}

export function getGastosByDateRange(start, end) {
  return getGastos().filter(g => g.fecha >= start && g.fecha <= end);
}
