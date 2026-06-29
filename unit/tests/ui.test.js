import { renderTabla, renderLegendas } from '../../js/ui.js';

function crearDOM() {
  document.body.innerHTML = `
    <table><tbody id="cuerpoTabla"></tbody></table>
    <p id="mensajeVacio" class="hidden"></p>
    <div id="leyendas"></div>
  `;
}

const gastoAlimentacion = { id: '1', fecha: '2026-06-20', monto: 500, categoria: 'Alimentación', descripcion: 'Almuerzo' };
const gastoTransporte  = { id: '2', fecha: '2026-06-25', monto: 200, categoria: 'Transporte',   descripcion: 'Metro' };
const gastoOcio        = { id: '3', fecha: '2026-06-10', monto: 800, categoria: 'Ocio',          descripcion: 'Cine' };

describe('Tabla de gastos', () => {
  beforeEach(crearDOM);

  it('muestra el mensaje de "sin gastos" cuando la lista está vacía', () => {
    renderTabla([]);
    expect(document.getElementById('mensajeVacio').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('cuerpoTabla').innerHTML).toBe('');
  });

  it('oculta el mensaje de "sin gastos" cuando hay gastos en la lista', () => {
    renderTabla([gastoAlimentacion]);
    expect(document.getElementById('mensajeVacio').classList.contains('hidden')).toBe(true);
  });

  it('ordena los gastos de más reciente a más antiguo', () => {
    renderTabla([gastoAlimentacion, gastoTransporte, gastoOcio]);
    const filas = document.querySelectorAll('.fila-gasto');
    const ids = [...filas].map(f => f.dataset.id);
    expect(ids).toEqual(['2', '1', '3']);
  });

  it('renderiza una fila por cada gasto recibido', () => {
    renderTabla([gastoAlimentacion, gastoTransporte]);
    expect(document.querySelectorAll('.fila-gasto')).toHaveLength(2);
  });
});

describe('Leyendas comparativas del período', () => {
  beforeEach(crearDOM);

  it('muestra mensaje de "Sin gastos registrados" cuando el período está vacío', () => {
    renderLegendas([], [], 'semanal');
    expect(document.getElementById('leyendas').textContent).toContain('Sin gastos registrados');
  });

  it('muestra el total gastado sin porcentaje de variación cuando no hay datos del período anterior', () => {
    renderLegendas([gastoAlimentacion], [], 'semanal');
    const texto = document.getElementById('leyendas').textContent;
    expect(texto).toContain('500');
    expect(texto).not.toContain('%');
  });

  it('muestra el porcentaje de variación respecto al período anterior cuando hay datos previos', () => {
    const prev = [{ ...gastoAlimentacion, id: 'p1', monto: 250 }];
    renderLegendas([gastoAlimentacion], prev, 'semanal');
    const texto = document.getElementById('leyendas').textContent;
    expect(texto).toContain('100%');
    expect(texto).toContain('más');
  });

  it('indica "menos" cuando el gasto actual es menor al del período anterior', () => {
    const prev = [{ ...gastoAlimentacion, id: 'p1', monto: 1000 }];
    renderLegendas([gastoAlimentacion], prev, 'semanal');
    const texto = document.getElementById('leyendas').textContent;
    expect(texto).toContain('menos');
  });

  it('identifica correctamente la categoría con mayor gasto del período', () => {
    renderLegendas([gastoAlimentacion, gastoTransporte, gastoOcio], [], 'mensual');
    const texto = document.getElementById('leyendas').textContent;
    expect(texto).toContain('Ocio');
  });

  it('incluye aviso de variación por categoría cuando supera el 5% respecto al período anterior', () => {
    const prev = [{ ...gastoAlimentacion, id: 'p1', monto: 100 }];
    renderLegendas([gastoAlimentacion], prev, 'mensual');
    const items = document.querySelectorAll('.leyenda-item');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('omite el aviso de variación por categoría cuando la diferencia es igual o menor al 5%', () => {
    const actual = [{ ...gastoAlimentacion, monto: 105 }];
    const prev   = [{ ...gastoAlimentacion, id: 'p1', monto: 100 }];
    renderLegendas(actual, prev, 'mensual');
    const items = document.querySelectorAll('.leyenda-item');
    expect(items.length).toBe(2);
  });
});
