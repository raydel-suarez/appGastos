import { toDateStr, getDateRange, getPrevDateRange, generarId } from '../../js/dateUtils.js';

// Fecha fija: lunes 2026-06-29
const LUNES_FIJO = new Date('2026-06-29T00:00:00');

describe('Utilidades de fecha', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(LUNES_FIJO);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Período semanal — semana actual', () => {
    it('el rango empieza el lunes y termina el domingo de la misma semana', () => {
      const { start, end } = getDateRange('semanal');
      expect(start).toBe('2026-06-29');
      expect(end).toBe('2026-07-05');
    });
  });

  describe('Período semanal — semana anterior', () => {
    it('el rango cubre exactamente los 7 días de la semana previa', () => {
      const { start, end } = getPrevDateRange('semanal');
      expect(start).toBe('2026-06-22');
      expect(end).toBe('2026-06-28');
    });
  });

  describe('Período mensual — mes actual', () => {
    it('el rango abarca del primer al último día del mes en curso', () => {
      const { start, end } = getDateRange('mensual');
      expect(start).toBe('2026-06-01');
      expect(end).toBe('2026-06-30');
    });
  });

  describe('Período mensual — mes anterior', () => {
    it('el rango cubre del primer al último día del mes previo', () => {
      const { start, end } = getPrevDateRange('mensual');
      expect(start).toBe('2026-05-01');
      expect(end).toBe('2026-05-31');
    });
  });

  describe('Período anual — año actual', () => {
    it('el rango va del 1 de enero al 31 de diciembre del año en curso', () => {
      const { start, end } = getDateRange('anual');
      expect(start).toBe('2026-01-01');
      expect(end).toBe('2026-12-31');
    });
  });

  describe('Período anual — año anterior', () => {
    it('el rango cubre todo el año previo', () => {
      const { start, end } = getPrevDateRange('anual');
      expect(start).toBe('2025-01-01');
      expect(end).toBe('2025-12-31');
    });
  });

  describe('Generación de IDs únicos', () => {
    it('dos IDs generados consecutivamente son siempre distintos', () => {
      const id1 = generarId();
      const id2 = generarId();
      expect(id1).not.toBe(id2);
    });

    it('el ID generado es una cadena no vacía', () => {
      const id = generarId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });
});
