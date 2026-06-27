---
name: automator
description: Escribe nuevos escenarios Gherkin con sus step definitions en TypeScript, o actualiza specs y steps existentes. Detecta automáticamente el modo según la petición. Stack: playwright-bdd + @playwright/test + Allure. Suite en e2e/.
---

# Skill: automator

Gestiona la suite de automatización E2E de appGastos en `e2e/`.

**Stack:** `playwright-bdd` + `@playwright/test` + TypeScript + Allure Reports  
**Suite:** `e2e/` en la raíz del repo  
**Estructura:** `features/` (Gherkin) · `steps/` (TypeScript) · `pages/` (Page Objects)

---

## Detección de modo

Analiza la petición del usuario y determina el modo:

| La petición menciona... | Modo |
|---|---|
| "agregar", "nuevo escenario", "crear test", "cubrir X", "escribir feature" | **Escritura nueva** → leer `scripts/new-spec.md` |
| "cambió", "actualizar", "falló", "selector roto", "mantener", "corregir step" | **Mantenimiento** → leer `scripts/maintain-spec.md` |

En caso de duda, preguntar: ¿Es un escenario nuevo o una corrección de uno existente?

---

## Archivos clave de la suite

```
e2e/
├── playwright.config.ts        # baseURL, allure reporter, bdd config
├── features/gastos/            # archivos .feature en Gherkin (español)
├── steps/gastos/               # step definitions en TypeScript
├── pages/GastosPage.ts         # Page Object — única fuente de selectores
└── support/fixtures.ts         # fixture gastosPage + exports Given/When/Then/Before
```

**Regla de oro:** Los selectores CSS/IDs solo van en `GastosPage.ts`. Los steps nunca contienen selectores directamente.

---

## Después de cualquier cambio

Ejecutar los tests para verificar que nada se rompió. Ver `scripts/run-tests.md`.

Si los tests fallan: analizar el output, identificar el step fallido, y volver al modo mantenimiento con el error como contexto.
