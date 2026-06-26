---
name: pruebas
description: Ejecuta pruebas E2E de appGastos con TestSprite usando la URL de producción en GitHub Pages. Úsalo después de publicar un cambio para verificar que la funcionalidad funciona en la app real. Invócalo con /pruebas seguido de qué quieres probar (ej: /pruebas registro de gasto, /pruebas flujo completo).
---

# Pruebas E2E — appGastos

URL fija de producción (siempre usar esta):

```
https://raydel-suarez.github.io/appGastos/
```

Nunca pedir al usuario la URL — esta es la URL definitiva del proyecto.

---

## Preflight rápido

```bash
testsprite --version
testsprite auth whoami
```

- Si `--version` falla → decirle al usuario que instale el CLI de TestSprite y parar.
- Si `auth whoami` falla → decirle que ejecute `testsprite auth configure` y parar.

---

## Encontrar el proyecto

```bash
testsprite project list --output json
```

Buscar el proyecto cuyo nombre coincida con `appGastos`. Si hay ambigüedad, listar las opciones y preguntar. Guardar el `projectId` para usarlo en los siguientes comandos.

---

## Decidir qué probar

Antes de crear un test, revisar si ya existe uno que cubra el comportamiento:

```bash
testsprite test list --project <projectId> --output json
```

### Test nuevo (caso más común)

Redactar un `plan.json` en el scratchpad del proyecto con pasos en lenguaje natural:

```jsonc
{
  "projectId": "<projectId>",
  "type": "frontend",
  "name": "<comportamiento assertable: sujeto + verbo + resultado>",
  "description": "<condición + resultado esperado en una oración>",
  "priority": "p1",
  "planSteps": [
    { "type": "action", "description": "Navegar a la app de gastos" },
    // ... pasos de usuario ...
    { "type": "assertion", "description": "Verificar que <resultado concreto y ubicación en pantalla>" }
  ]
}
```

**Reglas para los pasos:**
- Un verbo por paso — si hay "y" entre dos acciones, dividir en dos pasos.
- Describir intención del usuario, nunca selectores CSS ni texto literal de botones.
- `"Navegar a..."` solo en el paso 1; el resto usa clics para navegar (la app es SPA).
- 1–2 assertions al final, verificando que el resultado **funciona**, no solo que existe.
- Las assertions deben nombrar la región de pantalla (panel, lista, tarjeta, total).

**Mostrar el plan al usuario antes de crearlo** — crear escribe en su proyecto TestSprite.

### Test existente

```bash
testsprite test run <test-id> \
  --target-url https://raydel-suarez.github.io/appGastos/ \
  --wait --timeout 600 --output json
```

---

## Ejecutar

```bash
# Test nuevo desde plan
testsprite test create \
  --plan-from /ruta/al/plan.json \
  --run --wait \
  --target-url https://raydel-suarez.github.io/appGastos/ \
  --timeout 600

# Lote de tests (varios planes en plans.jsonl)
testsprite test create-batch \
  --plans plans.jsonl \
  --run --wait \
  --target-url https://raydel-suarez.github.io/appGastos/ \
  --max-concurrency 3 \
  --timeout 600 --output json
```

Nunca wrappear `--wait` en un loop — maneja su propio backoff.

---

## Si falla → descargar artefacto

```bash
testsprite test artifact get <run-id> \
  --out ./.testsprite/runs/<run-id>/
```

Revisar el bundle (paso fallido, video, hipótesis de causa raíz) antes de concluir que es un bug en el código.

---

## Reporte al usuario

Incluir siempre:

1. ID y nombre del test ejecutado.
2. Veredicto: `passed` / `failed` / `blocked` / `inconclusive`.
3. Link al dashboard (`dashboardUrl` en el JSON de salida).
4. Si falló: la hipótesis de causa raíz del bundle y en qué archivo/componente apunta.

No reportar `passed` si el veredicto real es ambiguo — reportar como `inconclusive` con la señal específica que generó la duda.

---

## Flujo típico

```
/pruebas agregar un gasto nuevo
→ buscar test existente o redactar plan.json
→ mostrar plan al usuario para aprobación
→ testsprite test create --plan-from plan.json --run --wait --target-url https://raydel-suarez.github.io/appGastos/ --timeout 600
→ reportar veredicto + link al dashboard
```
