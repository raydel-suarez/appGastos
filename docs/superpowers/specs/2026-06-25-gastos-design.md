# Diseño: appGastos — Aplicación de gastos personales

**Fecha:** 2026-06-25
**Stack:** HTML + CSS + Vanilla JS + Chart.js (CDN)
**Almacenamiento:** localStorage (navegador)
**Usuarios:** uno solo, sin autenticación
**Moneda:** DOP (pesos dominicanos)
**Responsive:** no requerido (solo desktop)

---

## Objetivo

Aplicación web estática (sin servidor, sin build step) que permite registrar gastos personales diarios, visualizarlos en un dashboard con filtros temporales (semanal/mensual/anual), gráficos por categoría y leyendas comparativas automáticas.

---

## Estructura de archivos

```
appGastos/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── storage.js    — leer/escribir gastos en localStorage
    ├── ui.js         — renderizar listas, formulario, leyendas
    ├── charts.js     — inicializar y actualizar gráficos con Chart.js
    └── app.js        — punto de entrada, conecta eventos y módulos
```

Chart.js se carga desde CDN. Los módulos JS usan `import/export` con `type="module"` en el HTML. No requiere Node.js ni build step.

---

## Modelo de datos

Clave en localStorage: `appGastos_gastos`

Valor: array JSON de objetos con la siguiente forma:

```json
{
  "id": "uuid-generado-con-crypto.randomUUID()",
  "fecha": "2026-06-25",
  "monto": 1500,
  "categoria": "Alimentación",
  "descripcion": "Almuerzo en restaurante"
}
```

### Categorías fijas

`Alimentación`, `Transporte`, `Ocio`, `Salud`, `Ropa`, `Servicios`, `Otros`

---

## Pantallas y componentes

La app tiene **una sola página** dividida en dos zonas:

### Zona izquierda — Formulario de registro

| Campo       | Tipo        | Validación                        |
|-------------|-------------|-----------------------------------|
| Fecha       | date        | Requerido, por defecto hoy        |
| Monto (DOP) | number      | Requerido, mayor que 0            |
| Categoría   | select      | Requerido, una de las 7 fijas     |
| Descripción | text        | Opcional, texto libre             |

Botón "Agregar gasto" — deshabilitado si monto o categoría están vacíos.

### Zona derecha — Dashboard

**Selector de período:** pestañas `Semanal | Mensual | Anual`

**Gráfico de dona** — acumulado DOP por categoría en el período activo. Cada color representa una categoría. Leyenda lateral derecha.

**Gráfico de barras** — evolución del gasto total en el tiempo:
- Semanal → una barra por día (lunes a domingo)
- Mensual → una barra por semana del mes (semanas calendario lunes–domingo)
- Anual → una barra por mes

**Panel de leyendas comparativas** — 2 o 3 frases generadas automáticamente comparando el período actual con el anterior. Ejemplos:
- "Este mes gastaste RD$4,200 en Alimentación, un 18% más que el mes pasado."
- "Tu mayor gasto esta semana fue Transporte con RD$1,800."
- Si no hay datos del período anterior: muestra solo resumen del período actual.

**Lista de gastos recientes** — tabla con columnas `Fecha | Categoría | Descripción | Monto (DOP) | Eliminar`, ordenada del más reciente al más antiguo.

---

## Flujo de datos

### Agregar un gasto

1. Usuario completa el formulario y hace clic en "Agregar gasto"
2. `app.js` valida monto > 0 y categoría seleccionada
3. `storage.js` genera ID con `crypto.randomUUID()`, agrega al array y guarda en localStorage
4. `ui.js` actualiza la lista de gastos recientes
5. `charts.js` recalcula y redibuja dona y barras con los datos del período activo

### Cambiar filtro de período

1. Usuario hace clic en `Semanal | Mensual | Anual`
2. `app.js` calcula el rango de fechas (inicio/fin) según la pestaña
3. `storage.js` devuelve solo los gastos dentro de ese rango
4. `charts.js` redibuja ambos gráficos
5. `ui.js` regenera las leyendas comparativas

### Eliminar un gasto

1. Clic en el botón eliminar en la tabla
2. `storage.js` filtra el array por ID y persiste el resultado
3. Dashboard se actualiza automáticamente (mismos pasos que al agregar)

### Lógica de leyendas comparativas

- Calcula total por categoría en el período actual
- Calcula el mismo total en el período inmediatamente anterior (ej. mes actual vs mes anterior)
- Genera texto con delta porcentual: `((actual - anterior) / anterior) * 100`
- Si `anterior === 0`, omite el porcentaje y muestra solo el total actual

---

## Manejo de errores

- Formulario con validación en cliente antes de guardar (campos requeridos, monto > 0)
- Si localStorage no está disponible (modo privado bloqueado), mostrar mensaje de error al cargar
- Si no hay gastos en el período seleccionado, los gráficos muestran estado vacío con mensaje "Sin gastos en este período"
- Eliminar es inmediato (sin confirmación) dado que los datos están en localStorage y son fácilmente recuperables en una sesión activa

---

## Decisiones de diseño

- **Sin backend ni autenticación** — app completamente estática, cero infraestructura
- **Categorías fijas** — reduce complejidad de UI y garantiza consistencia en los gráficos
- **Chart.js vía CDN** — sin npm, sin build, funciona con doble clic en el HTML
- **Módulos ES6** — `import/export` mantiene el código organizado sin necesitar bundler
- **Solo desktop** — sin media queries ni diseño responsive
