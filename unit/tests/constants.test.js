import { CATEGORIAS, COLORES_CAT, MESES } from '../../js/constants.js';

describe('Constantes del sistema', () => {
  describe('Categorías de gastos', () => {
    it('define exactamente 7 categorías', () => {
      expect(CATEGORIAS).toHaveLength(7);
    });

    it('cada categoría tiene un color asignado', () => {
      expect(COLORES_CAT).toHaveLength(CATEGORIAS.length);
    });

    it('ninguna categoría está vacía o es indefinida', () => {
      CATEGORIAS.forEach(cat => {
        expect(cat).toBeTruthy();
        expect(typeof cat).toBe('string');
      });
    });
  });

  describe('Meses del calendario', () => {
    it('define exactamente 12 meses', () => {
      expect(MESES).toHaveLength(12);
    });
  });
});
