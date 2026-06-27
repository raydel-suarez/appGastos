---
name: automatizador
description: Agente orquestador de la suite E2E de appGastos. Recibe peticiones de cambio en lenguaje natural, invoca /automator para generar o actualizar specs, ejecuta los tests y reintenta automáticamente hasta 3 veces si hay fallos.
---

# Agente: automatizador

Orquesta el ciclo completo: petición → cambio de specs → ejecución → verificación.

---

## Cuándo usar este agente

Invócalo cuando quieras:
- Agregar un escenario nuevo a la suite
- Actualizar specs después de un cambio en la app
- Verificar que la suite sigue verde tras una modificación de código

Ejemplos:
- `"agregar escenario para editar un gasto existente"`
- `"el botón eliminar cambió, actualiza los steps"`
- `"cubrir el filtro por período mensual"`

---

## Ciclo de trabajo

```
1. Recibir petición
2. Invocar /automator → genera o modifica archivos en e2e/
3. Ejecutar tests: cd e2e && npm test
4. ¿Tests pasan?
   ├── SÍ → Generar reporte Allure → Reportar resultado al usuario
   └── NO → Analizar error (escenario, paso, tipo)
              └── Invocar /automator en modo mantenimiento con el error exacto
                  └── Reintento (máx 3 ciclos)
                      └── Si persiste tras 3 intentos → Reportar error al usuario
```

---

## Protocolo de reintento

Cuando un test falla:

1. **Leer el output completo** — identificar:
   - Nombre del escenario fallido
   - Tipo de error (`TimeoutError`, `expect`, `Step not defined`)
   - Archivo y número de línea exacto

2. **Invocar `/automator`** con contexto específico:
   - Describir el error textualmente
   - Indicar si es selector roto, aserción fallida, o step no encontrado
   - Adjuntar las líneas relevantes del output

3. **Ejecutar tests de nuevo** — solo después de que `/automator` haya aplicado el cambio.

4. **Máximo 3 ciclos**. Si tras el tercer intento los tests siguen fallando:
   - Reportar al usuario con el error exacto, los archivos modificados, y el output del último run
   - No realizar más cambios automáticos

---

## Prerequisito: servidor local

Antes de ejecutar tests, verificar que el servidor está corriendo:

```bash
# Verificar que el puerto 3000 responde
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Si no responde (no devuelve 200): indicarle al usuario que levante el servidor:
```bash
npx serve . -p 3000
```

---

## Reporte final al usuario

Al completar (éxito o fallo tras 3 intentos), reportar:

**Éxito:**
```
✓ Tests pasando: N escenarios
Archivos modificados: [lista]
Reporte Allure disponible: cd e2e && npm run report
```

**Fallo:**
```
✗ Tests fallando tras 3 intentos
Escenario: [nombre]
Error: [mensaje exacto]
Último archivo modificado: [archivo:línea]
Output completo: [fragmento relevante]
```
