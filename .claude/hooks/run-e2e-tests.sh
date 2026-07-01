#!/bin/bash
# PostToolUse: ejecuta pruebas unitarias y luego E2E después de modificaciones en ramas feature.
# Flujo: unit tests → (si pasan) E2E tests
# asyncRewake: corre en background; exit 2 despierta al modelo con el resultado.

REPO_ROOT="/Users/raydelsuarez/Desktop/proyectos/appGastos"
DEBOUNCE_FILE="$REPO_ROOT/.claude/.e2e_last_run"
UNIT_DIR="$REPO_ROOT/unit"
E2E_DIR="$REPO_ROOT/e2e"

# Leer stdin antes de cualquier otra operación
HOOK_DATA=$(cat)
FILE_PATH=$(echo "$HOOK_DATA" | jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")

# No ejecutar si se está editando la suite e2e/ o unit/ misma
[[ "$FILE_PATH" == *"/e2e/"* ]] && exit 0
[[ "$FILE_PATH" == *"/unit/"* ]] && exit 0

# Solo en ramas feature/*
BRANCH=$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo "")
[[ ! "$BRANCH" =~ ^feature/ ]] && exit 0

# Debounce: evitar ejecuciones múltiples en edits consecutivos (ventana de 60s)
if [ -f "$DEBOUNCE_FILE" ]; then
  LAST_RUN=$(cat "$DEBOUNCE_FILE" 2>/dev/null || echo 0)
  NOW=$(date +%s)
  [[ $((NOW - LAST_RUN)) -lt 60 ]] && exit 0
fi
date +%s > "$DEBOUNCE_FILE"

# ── PASO 1: Pruebas unitarias ──────────────────────────────────────────────────
echo "🧪 Ejecutando pruebas unitarias..."
cd "$UNIT_DIR"
UNIT_OUTPUT=$(npm test 2>&1)
UNIT_EXIT=$?

if [ $UNIT_EXIT -ne 0 ]; then
  UNIT_RESUMEN=$(echo "$UNIT_OUTPUT" | grep -E "Tests.*failed|failed" | tail -1)
  UNIT_ERRORES=$(echo "$UNIT_OUTPUT" | grep -E "^( ×| ❯|AssertionError|Error:)" | head -8)

  printf "❌ PRUEBAS UNITARIAS FALLANDO — rama: %s\n\n" "$BRANCH"
  printf "Resumen: %s\n\n" "$UNIT_RESUMEN"
  if [[ -n "$UNIT_ERRORES" ]]; then
    printf "Tests fallidos:\n%s\n\n" "$UNIT_ERRORES"
  fi
  printf "Las pruebas E2E no se ejecutaron hasta que las unitarias pasen.\n"
  printf "Corrige los fallos en unit/tests/ y vuelve a guardar el archivo.\n"
  exit 2
fi

UNIT_PASSED=$(echo "$UNIT_OUTPUT" | grep -oE '[0-9]+ passed' | head -1)
echo "✅ Unitarias — $UNIT_PASSED. Continuando con E2E..."

# ── PASO 2: Pruebas E2E ────────────────────────────────────────────────────────
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "⚠️  E2E omitido: servidor no disponible en localhost:3000. Ejecuta: npx serve . -p 3000"
  exit 0
fi

cd "$E2E_DIR"

# Limpiar resultados y reporte previos para que Allure no mezcle evidencia de corridas anteriores
rm -rf allure-results allure-report

TEST_OUTPUT=$(npm test 2>&1)
TEST_EXIT=$?

# Generar reporte Allure siempre
npx allure generate allure-results -o allure-report --clean 2>/dev/null || true

if [ $TEST_EXIT -eq 0 ]; then
  E2E_PASSED=$(echo "$TEST_OUTPUT" | grep -oE '[0-9]+ passed' | head -1)
  printf "✅ Unitarias — %s  |  ✅ E2E — %s\n" "$UNIT_PASSED" "$E2E_PASSED"
  printf "Rama: %s  |  Reporte: e2e/allure-report/\n" "$BRANCH"
  exit 0
fi

# E2E fallando — exit 2 despierta al modelo
RESUMEN=$(echo "$TEST_OUTPUT" | grep -E "passed|failed" | tail -1)
ERRORES=$(echo "$TEST_OUTPUT" | grep -E "(Error:|TimeoutError:|expect\()" | head -8)
ESCENARIOS=$(echo "$TEST_OUTPUT" | grep -E "(✗|×|\[chromium\].*FAILED)" | head -6)

printf "✅ Unitarias — %s  |  ❌ E2E FALLANDO — rama: %s\n\n" "$UNIT_PASSED" "$BRANCH"
printf "Resumen: %s\n\n" "$RESUMEN"
if [[ -n "$ESCENARIOS" ]]; then
  printf "Escenarios fallidos:\n%s\n\n" "$ESCENARIOS"
fi
if [[ -n "$ERRORES" ]]; then
  printf "Errores detectados:\n%s\n\n" "$ERRORES"
fi
printf "Reporte Allure generado en: e2e/allure-report/\n"
printf "Para ver el detalle completo: cd e2e && npm run report\n\n"
printf "¿Deseas corregir los fallos E2E antes de abrir el PR?\n"
exit 2
