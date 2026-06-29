import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { test } from '../../support/fixtures';

const { Given, When, Then, Before } = createBdd(test);

async function screenshot(page: import('@playwright/test').Page, nombre: string) {
  await allure.attachment(nombre, await page.screenshot(), { contentType: 'image/png' });
}

Before(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('appGastos_gastos'));
  await page.reload();
  await screenshot(page, 'dashboard-estado-inicial');
});

Given('que estoy en el dashboard de appGastos', async () => {
  // navegación y limpieza ya realizadas en Before
});

Given('que existe un gasto de {string} en categoría {string}', async ({ gastosPage }, monto: string, categoria: string) => {
  await gastosPage.llenarFormulario(monto, categoria, 'Gasto de prueba');
});

When('registro un gasto de {string} en categoría {string} con descripción {string}', async ({ gastosPage }, monto: string, categoria: string, descripcion: string) => {
  await gastosPage.llenarFormulario(monto, categoria, descripcion);
});

When('observo la tabla de gastos', async () => {
  // la tabla es siempre visible en desktop
});

When('elimino el gasto de la tabla', async ({ gastosPage }) => {
  await gastosPage.eliminarPrimerGasto();
});

When('observo el panel de totales', async () => {
  // las leyendas son siempre visibles en desktop
});

Then('el gasto aparece en la tabla con monto {string}', async ({ gastosPage }, montoEsperado: string) => {
  const monto = await gastosPage.obtenerMontoPrimeraFila();
  expect(monto).toContain(montoEsperado);
  await screenshot(gastosPage.page, 'gasto-registrado-en-tabla');
});

Then('la tabla muestra al menos un gasto con categoría {string}', async ({ gastosPage }, categoria: string) => {
  const fila = gastosPage.cuerpoTabla.locator('.fila-gasto').first();
  await expect(fila.locator('.badge-categoria')).toContainText(categoria);
  await screenshot(gastosPage.page, `tabla-categoria-${categoria.toLowerCase()}`);
});

Then('la tabla no muestra el gasto eliminado', async ({ gastosPage }) => {
  await expect(gastosPage.mensajeVacio).toBeVisible();
  await screenshot(gastosPage.page, 'tabla-vacia-tras-eliminar');
});

Then('el total del período refleja el monto {string}', async ({ gastosPage }, monto: string) => {
  // El formateador de la app (es-DO, DOP) convierte 1500 → "1,500.00"
  const numStr = Number(monto).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const textos = await gastosPage.obtenerTextosLeyendas();
  expect(textos.some(t => t.includes(numStr))).toBe(true);
  await screenshot(gastosPage.page, 'panel-totales-del-periodo');
});
