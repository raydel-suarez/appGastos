#!/bin/bash
# Consume stdin JSON del hook para evitar bloqueos
cat > /dev/null

BRANCH=$(git branch --show-current 2>/dev/null)

if [ "$BRANCH" = "main" ]; then
  TS=$(date +%Y%m%d-%H%M%S)
  NEW_BRANCH="feature/$TS"

  if git checkout -b "$NEW_BRANCH" 2>/dev/null; then
    echo "{\"systemMessage\": \"[gitFlow] Rama '${NEW_BRANCH}' creada desde main. Renómbrala con: git branch -m feature/<nombre-descriptivo>\"}"
  else
    echo "{\"systemMessage\": \"[gitFlow] No se pudo crear la rama feature. Verifica el estado del repositorio.\"}"
  fi
fi

exit 0
