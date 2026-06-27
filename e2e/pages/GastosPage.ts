import { Page, Locator } from '@playwright/test';

export class GastosPage {
  readonly page: Page;
  readonly montoInput: Locator;
  readonly categoriaSelect: Locator;
  readonly descripcionInput: Locator;
  readonly btnAgregar: Locator;
  readonly cuerpoTabla: Locator;
  readonly leyendas: Locator;
  readonly mensajeVacio: Locator;
  readonly modalEditar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.montoInput = page.locator('#monto');
    this.categoriaSelect = page.locator('#categoria');
    this.descripcionInput = page.locator('#descripcion');
    this.btnAgregar = page.locator('#btnAgregar');
    this.cuerpoTabla = page.locator('#cuerpoTabla');
    this.leyendas = page.locator('#leyendas');
    this.mensajeVacio = page.locator('#mensajeVacio');
    this.modalEditar = page.locator('#modalEditar');
  }

  async llenarFormulario(monto: string, categoria: string, descripcion: string) {
    await this.montoInput.fill(monto);
    await this.categoriaSelect.selectOption(categoria);
    await this.descripcionInput.fill(descripcion);
    await this.btnAgregar.click();
    await this.cuerpoTabla.locator('.fila-gasto').first().waitFor({ state: 'visible' });
  }

  async obtenerMontoPrimeraFila(): Promise<string> {
    return this.cuerpoTabla.locator('.fila-gasto').first().locator('.monto-celda').innerText();
  }

  async eliminarPrimerGasto() {
    await this.cuerpoTabla.locator('.fila-gasto').first().click();
    await this.modalEditar.waitFor({ state: 'visible' });
    this.page.once('dialog', dialog => dialog.accept());
    await this.page.locator('#btnEliminarDesdeModal').click();
    await this.modalEditar.waitFor({ state: 'hidden' });
  }

  async obtenerTextosLeyendas(): Promise<string[]> {
    return this.leyendas.locator('.leyenda-item').allInnerTexts();
  }
}
