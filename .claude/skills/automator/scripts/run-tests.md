# Guía: Ejecutar tests y leer resultados

---

## Requisito previo: servidor estático

La suite apunta a `http://localhost:3000`. El servidor debe estar corriendo antes de ejecutar los tests.

```bash
# Desde la raíz del repo (en otra terminal o en background)
npx serve . -p 3000
```

Para correr contra producción en lugar de local:
```bash
BASE_URL=https://raydel-suarez.github.io/appGastos/ cd e2e && npm test
```

---

## Ejecutar todos los tests

```bash
cd e2e && npm test
```

Esto corre `bddgen` (genera los spec files desde los `.feature`) y luego `playwright test`.

---

## Instalar dependencias (primera vez o después de cambiar package.json)

```bash
cd e2e && npm install && npx playwright install chromium
```

---

## Interpretar el output

### Tests pasando
```
✓  Escenario: Registrar un nuevo gasto
✓  Escenario: Ver el gasto registrado en la tabla
✓  Escenario: Eliminar un gasto existente
✓  Escenario: Verificar totales en el dashboard

4 passed (8s)
```

### Test fallando
```
✗  Escenario: Eliminar un gasto existente
   Error: Timed out waiting for locator('#btnEliminarDesdeModal')
   
   at GastosPage.eliminarPrimerGasto (pages/GastosPage.ts:38)
   at steps/gastos/gastos.steps.ts:28
```

Leer:
1. **Nombre del escenario fallido** — qué flujo está roto
2. **Tipo de error** — `TimeoutError` = selector no encontrado; `expect` = aserción fallida
3. **Archivo y línea** — dónde está el problema exacto
4. Ir a `scripts/maintain-spec.md` con esa información

---

## Ver el reporte Allure

```bash
cd e2e && npm run report
```

Abre el reporte en el navegador con:
- Lista de escenarios pasados/fallidos
- Capturas de pantalla de los pasos
- Trazas de red y consola por escenario

Si `allure-results/` está vacío → los tests no se ejecutaron o fallaron antes de generar resultados.

---

## Correr un solo escenario

```bash
cd e2e && bddgen && playwright test --grep "Registrar un nuevo gasto"
```

---

## Limpiar artefactos previos

```bash
rm -rf e2e/allure-results e2e/.features-gen
```
