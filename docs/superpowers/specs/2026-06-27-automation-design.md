# Spec: Suite de Automatización E2E — appGastos

**Fecha:** 2026-06-27  
**Estado:** Aprobado  

---

## Contexto

appGastos es una app web estática (HTML + Vanilla JS + Chart.js) sin backend. Ya cuenta con pruebas E2E via TestSprite. Esta suite agrega una capa de regresión local con Playwright + Gherkin + Allure Reports, sin reemplazar TestSprite.

**Convivencia de suites:**
- **TestSprite** → smoke tests contra producción (`https://raydel-suarez.github.io/appGastos/`)
- **Nueva suite Playwright+Gherkin+Allure** → regresiones locales detalladas antes de hacer push

---

## Stack técnico

| Herramienta | Versión | Rol |
|---|---|---|
| `@playwright/test` | latest | Runner de tests y driver de browser |
| `playwright-bdd` | latest | Plugin BDD — parsea `.feature` y mapea step definitions |
| `allure-playwright` | latest | Reporter que genera resultados en `allure-results/` |
| `allure-commandline` | latest | CLI para visualizar el reporte |
| TypeScript | latest | Lenguaje de los step definitions y page objects |

---

## Estructura de directorios

```
e2e/
├── package.json
├── tsconfig.json
├── playwright.config.ts          # baseURL, allure reporter, bdd config
├── features/
│   └── gastos/
│       └── flujo-critico.feature # 4 escenarios iniciales en Gherkin
├── steps/
│   └── gastos/
│       └── gastos.steps.ts       # step definitions con fixtures de playwright-bdd
├── pages/
│   └── GastosPage.ts             # Page Object Model
├── support/
│   └── fixtures.ts               # fixtures compartidos
└── allure-results/               # gitignored
```

---

## Escenarios iniciales (flujo crítico)

```gherkin
Feature: Flujo crítico de gestión de gastos

  Scenario: Registrar un nuevo gasto
    Given que estoy en el dashboard de appGastos
    When registro un gasto de "1500" en categoría "Alimentación" con descripción "Almuerzo"
    Then el gasto aparece en la tabla con monto "RD$ 1,500.00"

  Scenario: Ver el gasto registrado en la tabla
    Given que existe un gasto de "1500" en categoría "Alimentación"
    When observo la tabla de gastos
    Then la tabla muestra al menos un gasto con categoría "Alimentación"

  Scenario: Eliminar un gasto existente
    Given que existe un gasto de "1500" en categoría "Alimentación"
    When elimino el gasto de la tabla
    Then la tabla no muestra el gasto eliminado

  Scenario: Verificar totales en el dashboard
    Given que existe un gasto de "1500" en categoría "Alimentación"
    When observo el panel de totales
    Then el total del período refleja el monto "1500"
```

---

## Page Object Model

`GastosPage.ts` encapsula todos los selectores y acciones sobre la app:

- `abrirFormulario()` — interactúa con el botón de nuevo gasto
- `llenarFormulario(monto, categoria, descripcion)` — rellena y envía el form
- `obtenerFilasTabla()` — devuelve las filas visibles en la tabla
- `eliminarPrimerGasto()` — hace clic en el botón eliminar de la primera fila
- `obtenerTotalPeriodo()` — lee el valor del total mostrado en el dashboard

Los selectores se centralizan en esta clase. Los steps **nunca** contienen selectores directamente.

---

## Configuración de Playwright

`playwright.config.ts` define:

```ts
// baseURL local para desarrollo
baseURL: 'http://localhost:3000'

// Allure como reporter
reporter: [['allure-playwright']]

// playwright-bdd: directorio de features y steps
// outputDir: e2e/.features-gen (archivos generados por playwright-bdd)
```

**Para correr contra producción** se puede sobreescribir con variable de entorno:
```bash
BASE_URL=https://raydel-suarez.github.io/appGastos/ npm test
```

---

## Flujo de ejecución local

```bash
# 1. Levantar el servidor estático (desde raíz del repo)
npx serve . -p 3000

# 2. Correr los tests (desde e2e/)
cd e2e && npm test

# 3. Ver el reporte Allure
npx allure open allure-results/
```

---

## Skill `/automator`

Vive en `.claude/skills/automator/` con la siguiente estructura:

```
.claude/skills/automator/
├── SKILL.md          # Punto de entrada: detección de modo y orquestación
└── scripts/
    ├── new-spec.md       # Guía para escribir nuevos .feature + step definitions
    ├── maintain-spec.md  # Guía para actualizar specs y steps existentes
    └── run-tests.md      # Guía para ejecutar tests y leer resultados Allure
```

### Detección de modo

| Palabras clave en la petición | Modo |
|---|---|
| "agregar", "nuevo escenario", "cubrir", "crear test" | Escritura nueva → `new-spec.md` |
| "cambió", "actualizar", "falló", "selector", "mantener" | Mantenimiento → `maintain-spec.md` |

### Modo escritura nueva (`new-spec.md`)

1. Redactar el bloque Gherkin en el `.feature` correspondiente bajo `features/`
2. Implementar los step definitions en TypeScript bajo `steps/`
3. Actualizar `GastosPage.ts` si el escenario requiere nuevos métodos o selectores
4. Verificar que el nuevo escenario no rompe los existentes

### Modo mantenimiento (`maintain-spec.md`)

1. Localizar todos los steps afectados con `grep` sobre `steps/`
2. Aplicar el cambio mínimo necesario (selectores, lógica de aserción)
3. No modificar steps no relacionados
4. Documentar qué archivos fueron modificados

---

## Agente `automatizador`

Vive en `.claude/agents/automatizador.md`. Recibe peticiones en lenguaje natural y gestiona el ciclo completo de cambio + verificación.

### Ciclo de feedback

```
Petición del usuario
      ↓
Invoca /automator (detecta modo automáticamente)
      ↓
Genera o modifica archivos en e2e/
      ↓
Ejecuta: cd e2e && npm test
      ↓
¿Tests pasan?
  ├── SÍ → Genera reporte Allure → Reporta éxito al usuario
  └── NO → Analiza línea de error y step fallido
              ↓
           Invoca /automator en modo mantenimiento con el error como contexto
              ↓
           Reintento (máximo 3 ciclos)
              ↓
           Si tras 3 intentos persiste → Reporta error exacto al usuario
```

### Ejemplos de peticiones válidas

- `"agregar escenario para editar un gasto existente"`
- `"el botón eliminar cambió de icono, actualiza los steps"`
- `"cubrir el filtro por período mensual en el gráfico de barras"`

---

## Lo que NO cubre esta suite

- Tests de API (no hay backend)
- Tests unitarios de funciones JS (fuera de scope — no hay framework de unit tests)
- Visual regression testing (no incluido en esta iteración)
- Integración CI/CD (fuera de scope inicial — se puede agregar después)
