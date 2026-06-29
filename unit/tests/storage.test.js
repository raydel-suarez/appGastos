import { getGastos, addGasto, deleteGasto, updateGasto, getGastosByDateRange } from '../../js/storage.js';

const gastoBase = {
  id: 'abc123',
  fecha: '2026-06-15',
  monto: 500,
  categoria: 'Alimentación',
  descripcion: 'Almuerzo',
};

describe('Persistencia de gastos en localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Consulta de gastos', () => {
    it('devuelve una lista vacía cuando no hay gastos guardados', () => {
      expect(getGastos()).toEqual([]);
    });

    it('devuelve lista vacía si localStorage contiene datos corruptos', () => {
      localStorage.setItem('appGastos_gastos', 'esto-no-es-json');
      expect(getGastos()).toEqual([]);
    });
  });

  describe('Agregar un gasto', () => {
    it('el gasto agregado se recupera correctamente con todos sus campos', () => {
      addGasto(gastoBase);
      const gastos = getGastos();
      expect(gastos).toHaveLength(1);
      expect(gastos[0]).toEqual(gastoBase);
    });

    it('agregar múltiples gastos los acumula en orden de inserción', () => {
      const segundo = { ...gastoBase, id: 'def456', fecha: '2026-06-16' };
      addGasto(gastoBase);
      addGasto(segundo);
      expect(getGastos()).toHaveLength(2);
    });
  });

  describe('Eliminar un gasto', () => {
    it('elimina solo el gasto con el ID indicado sin afectar los demás', () => {
      const otro = { ...gastoBase, id: 'otro999' };
      addGasto(gastoBase);
      addGasto(otro);
      deleteGasto('abc123');
      const gastos = getGastos();
      expect(gastos).toHaveLength(1);
      expect(gastos[0].id).toBe('otro999');
    });
  });

  describe('Actualizar un gasto', () => {
    it('modifica solo los campos indicados y conserva el resto intacto', () => {
      addGasto(gastoBase);
      updateGasto('abc123', { monto: 999, descripcion: 'Cena' });
      const [actualizado] = getGastos();
      expect(actualizado.monto).toBe(999);
      expect(actualizado.descripcion).toBe('Cena');
      expect(actualizado.categoria).toBe('Alimentación');
      expect(actualizado.fecha).toBe('2026-06-15');
    });

    it('no modifica nada si el ID no existe', () => {
      addGasto(gastoBase);
      updateGasto('id-inexistente', { monto: 0 });
      expect(getGastos()[0].monto).toBe(500);
    });
  });

  describe('Filtrar gastos por rango de fechas', () => {
    beforeEach(() => {
      addGasto({ ...gastoBase, id: '1', fecha: '2026-06-01' });
      addGasto({ ...gastoBase, id: '2', fecha: '2026-06-15' });
      addGasto({ ...gastoBase, id: '3', fecha: '2026-06-30' });
      addGasto({ ...gastoBase, id: '4', fecha: '2026-07-01' });
    });

    it('devuelve solo los gastos dentro del rango de fechas indicado', () => {
      const resultado = getGastosByDateRange('2026-06-01', '2026-06-30');
      expect(resultado).toHaveLength(3);
      expect(resultado.map(g => g.id)).toEqual(['1', '2', '3']);
    });

    it('devuelve lista vacía si no hay gastos en el rango', () => {
      const resultado = getGastosByDateRange('2025-01-01', '2025-12-31');
      expect(resultado).toEqual([]);
    });

    it('incluye gastos en las fechas límite del rango (bordes inclusivos)', () => {
      const resultado = getGastosByDateRange('2026-06-15', '2026-06-15');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('2');
    });
  });
});
