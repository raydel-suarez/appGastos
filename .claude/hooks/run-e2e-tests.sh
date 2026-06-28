#!/bin/bash
# PostToolUse: ejecuta la suite E2E después de modificaciones en ramas feature.
# asyncRewake: corre en background; exit 2 despierta al modelo con el resultado.

REPO_ROOT="/Users/raydelsuarez/Desktop/proyectos/appGastos"
DEBOUNCE_FILE="$REPO_ROOT/.claude/.e2e_last_run"
E2E_DIR="$REPO_ROOT/e2e"

# Leer stdin antes de cualquier otra operación
HOOK_DATA=$(cat)
FILE_PATH=$(echo "$HOOK_DATA" | jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")

# No ejecutar si se está editando la suite e2e/ misma
[[ "$FILE_PATH" == *"/e2e/"* ]] && exit 0

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

# Verificar servidor local
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "⚠️  E2E omitido: servidor no disponible en localhost:3000. Ejecuta: npx serve . -p 3000"
  exit 0
fi

# Ejecutar suite
cd "$E2E_DIR"
TEST_OUTPUT=$(npm test 2>&1)
TEST_EXIT=$?

# Generar reporte Allure siempre
npx allure generate allure-results -o allure-report --clean 2>/dev/null || true

if [ $TEST_EXIT -eq 0 ]; then
  PASSED=$(echo "$TEST_OUTPUT" | grep -oE '[0-9]+ passed' | head -1)
  echo "✅ E2E — $PASSED en rama $BRANCH. Reporte: e2e/allure-report/"
  exit 0
fi

# Tests fallando — exit 2 despierta al modelo
RESUMEN=$(echo "$TEST_OUTPUT" | grep -E "passed|failed" | tail -1)
ERRORES=$(echo "$TEST_OUTPUT" | grep -E "(Error:|TimeoutError:|expect\()" | head -8)
ESCENARIOS=$(echo "$TEST_OUTPUT" | grep -E "(✗|×|\[chromium\].*FAILED)" | head -6)

printf "❌ PRUEBAS E2E FALLANDO — rama: %s\n\n" "$BRANCH"
printf "Resumen: %s\n\n" "$RESUMEN"
if [[ -n "$ESCENARIOS" ]]; then
  printf "Escenarios fallidos:\n%s\n\n" "$ESCENARIOS"
fi
if [[ -n "$ERRORES" ]]; then
  printf "Errores detectados:\n%s\n\n" "$ERRORES"
fi
printf "Reporte Allure generado en: e2e/allure-report/\n"
printf "Para ver el detalle completo: cd e2e && npm run report\n\n"
printf "¿Deseas abrir el PR con estos resultados, o prefieres corregir los fallos primero?\n"
exit 2
