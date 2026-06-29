import { initCharts, updateCharts } from '../../js/charts.js';

class MockChart {
  constructor(ctx, config) {
    this.config = config;
    this.data = config.data; // charts.js muta chart.data directamente
    MockChart.instances.push(this);
  }
  update() {}
}
MockChart.instances = [];

function getDonaChart()   { return MockChart.instances[0]; }
function getBarrasChart() { return MockChart.instances[1]; }

const gastoJunio = (monto, dia, cat = 'Alimentación') => ({
  id: String(dia),
  fecha: `2026-06-${String(dia).padStart(2, '0')}`,
  monto,
  categoria: cat,
  descripcion: '',
});

describe('Gráficos del dashboard', () => {
  beforeAll(() => {
    // jsdom no implementa Canvas; devolvemos un objeto vacío para que initCharts no falle
    HTMLCanvasElement.prototype.getContext = () => ({});
    document.body.innerHTML = `
      <canvas id="graficoDona"></canvas>
      <canvas id="graficoBarras"></canvas>
    `;
    vi.stubGlobal('Chart', MockChart);
    initCharts();
  });

  beforeEach(() => {
    MockChart.instances.forEach(c => {
      c.config.data.labels = [];
      c.config.data.datasets[0].data = [];
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe('Gráfico de barras — modo semanal', () => {
    it('genera exactamente 7 etiquetas de lunes a domingo', () => {
      updateCharts([gastoJunio(300, 29)], 'semanal', '2026-06-29');
      expect(getBarrasChart().config.data.labels).toEqual(
        ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      );
    });

    it('acumula el monto del día correcto según la fecha del gasto', () => {
      updateCharts([gastoJunio(300, 29)], 'semanal', '2026-06-29');
      const data = getBarrasChart().config.data.datasets[0].data;
      expect(data[0]).toBe(300); // lunes 2026-06-29
      expect(data[1]).toBe(0);   // martes sin gastos
    });
  });

  describe('Gráfico de barras — modo mensual', () => {
    it('genera etiquetas de semanas comenzando con "Sem 1"', () => {
      updateCharts([gastoJunio(200, 15)], 'mensual', '2026-06-01');
      const labels = getBarrasChart().config.data.labels;
      expect(labels[0]).toBe('Sem 1');
      expect(labels.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Gráfico de barras — modo anual', () => {
    it('genera exactamente 12 etiquetas, una por mes', () => {
      updateCharts([gastoJunio(100, 15)], 'anual', '2026-01-01');
      expect(getBarrasChart().config.data.labels).toHaveLength(12);
    });
  });

  describe('Gráfico de dona — sin gastos', () => {
    it('muestra la etiqueta "Sin gastos" cuando no hay datos en el período', () => {
      updateCharts([], 'semanal', '2026-06-29');
      expect(getDonaChart().config.data.labels).toEqual(['Sin gastos']);
    });

    it('usa un único valor placeholder para mostrar el gráfico vacío', () => {
      updateCharts([], 'semanal', '2026-06-29');
      expect(getDonaChart().config.data.datasets[0].data).toEqual([1]);
    });
  });

  describe('Gráfico de dona — con gastos', () => {
    it('incluye solo las categorías con monto mayor a cero', () => {
      const gastos = [
        gastoJunio(500, 20, 'Alimentación'),
        gastoJunio(200, 21, 'Transporte'),
      ];
      updateCharts(gastos, 'semanal', '2026-06-15');
      const labels = getDonaChart().config.data.labels;
      expect(labels).toContain('Alimentación');
      expect(labels).toContain('Transporte');
      expect(labels).not.toContain('Ocio');
    });
  });
});
