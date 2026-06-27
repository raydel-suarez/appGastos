# Guía: Mantenimiento de specs existentes

Sigue estos pasos cuando un step falla, un selector cambia, o la lógica de un escenario necesita ajustarse.

---

## 1. Localizar el problema

Si hay un error de test, leer el output completo:
- ¿Qué escenario falló? (`Escenario:` en el output)
- ¿Qué paso específico falló? (`Given` / `When` / `Then`)
- ¿Es un error de selector (TimeoutError), de aserción (expect failed), o de lógica?

Buscar el step definition afectado:
```bash
grep -rn "texto del paso fallido" e2e/steps/
```

---

## 2. Tipos de fallo y cómo resolverlos

### Selector roto (TimeoutError: waiting for locator...)
El selector en `GastosPage.ts` ya no existe o cambió en el HTML.

1. Revisar `index.html` para encontrar el selector actualizado
2. Editar **solo** `e2e/pages/GastosPage.ts` — cambiar el selector en el constructor o en el método
3. No tocar los steps ni los `.feature`

### Aserción que falla (expect received... to equal expected...)
El comportamiento de la app cambió (texto, formato, estructura DOM).

1. Identificar qué valor recibe Playwright vs. qué espera el step
2. Si el comportamiento de la app es correcto y el test está desactualizado → actualizar el step definition
3. Si la app introdujo un bug → no actualizar el test, reportar el fallo al usuario

### Step definition no encontrado (Step "..." is not defined)
El texto del paso en el `.feature` no coincide con ningún patrón registrado.

1. Revisar el paso en el `.feature` — buscar diferencias de tildes, mayúsculas, comillas
2. Revisar los patrones registrados en `e2e/steps/`
3. Corregir el texto del `.feature` para que coincida, o actualizar el patrón del step

---

## 3. Regla de cambio mínimo

- Cambiar **solo** los archivos necesarios para corregir el fallo
- Si el cambio es en un selector → solo `GastosPage.ts`
- Si el cambio es en la lógica de un step → solo el archivo `.steps.ts` afectado
- Si el cambio es en el texto de un paso → solo el `.feature` afectado
- No refactorizar ni limpiar código no relacionado con el fallo

---

## 4. Documentar qué se cambió

Antes de ejecutar los tests, listar brevemente:
- Archivo(s) modificado(s)
- Qué cambió y por qué

---

## 5. Verificar que el cambio no rompe otros escenarios

Ejecutar **todos** los tests (no solo el que falló):
```bash
cd e2e && npm test
```

Ver `scripts/run-tests.md` para interpretar el output.
