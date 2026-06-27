# Guía: Escritura de nuevos specs

Sigue estos pasos en orden cada vez que debas agregar un escenario nuevo.

---

## 1. Entender qué cubrir

Antes de escribir, responde:
- ¿Qué acción del usuario se está cubriendo?
- ¿Cuál es el resultado observable (aserción)?
- ¿Hay un `.feature` existente donde encaje, o se necesita uno nuevo?

Revisar los features existentes:
```bash
ls e2e/features/gastos/
```

---

## 2. Escribir el escenario Gherkin

Editar (o crear) el `.feature` correspondiente en `e2e/features/gastos/`.

**Plantilla de escenario:**
```gherkin
Escenario: <descripción en voz activa — sujeto + verbo + resultado>
  Dado que <estado inicial observable>
  Cuando <acción del usuario>
  Entonces <resultado verificable en pantalla>
```

**Reglas:**
- Escribir en español, con tildes y eñes correctas
- Un verbo por paso — si hay "y", dividir en dos pasos
- Los parámetros van entre comillas dobles: `"Alimentación"`, `"1500"`
- La aserción (`Entonces`) debe nombrar el elemento de pantalla: tabla, modal, panel, mensaje
- Evitar detalles técnicos (IDs, clases CSS) en el texto del escenario

---

## 3. Implementar los step definitions

Editar `e2e/steps/gastos/gastos.steps.ts`.

**Patrón de un step:**
```typescript
Given('que estoy en ...', async ({ gastosPage }) => {
  // usar métodos de GastosPage, nunca selectores directos
});
```

**Importar siempre desde `createBdd(test)`:**
```typescript
import { createBdd } from 'playwright-bdd';
import { test } from '../../support/fixtures';
const { Given, When, Then } = createBdd(test);
```

**Si el step necesita un selector nuevo** → ir al paso 4.

**Si el step reutiliza un step existente** → verificar que el texto del paso en el `.feature` coincide exactamente con el patrón registrado (incluyendo tildes).

---

## 4. Actualizar GastosPage.ts si hay selectores nuevos

Editar `e2e/pages/GastosPage.ts`.

- Agregar el `Locator` en el constructor
- Agregar el método que lo usa
- Mantener los métodos descriptivos de acción (`abrirModal`, `llenarFormulario`) — nunca exponer `locator.click()` directamente en los steps

**Selectores de referencia (app actual):**

| Elemento | Selector |
|---|---|
| Input monto | `#monto` |
| Select categoría | `#categoria` |
| Input descripción | `#descripcion` |
| Botón agregar | `#btnAgregar` |
| Filas de tabla | `#cuerpoTabla .fila-gasto` |
| Celda monto de fila | `.monto-celda` |
| Badge categoría | `.badge-categoria` |
| Mensaje vacío | `#mensajeVacio` |
| Modal editar | `#modalEditar` |
| Botón eliminar en modal | `#btnEliminarDesdeModal` |
| Panel leyendas | `#leyendas .leyenda-item` |
| Tabs de período | `.tab[data-periodo]` |

---

## 5. Verificar que no hay steps duplicados

Antes de registrar un step nuevo, verificar si ya existe uno con texto similar:
```bash
grep -r "Given\|When\|Then" e2e/steps/ | grep "texto del step"
```

Si ya existe con texto diferente: reusar el existente ajustando el texto del `.feature`.

---

## 6. Ejecutar los tests

Ver `scripts/run-tests.md`.
