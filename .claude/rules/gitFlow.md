# Git Flow — appGastos

Toda modificación al código debe realizarse en una rama dedicada. Nunca se trabaja directamente en `main`.

## Nomenclatura de ramas

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Función nueva | `feature/<verbo>-<descripción>` | `feature/add-expense-filter` |
| Corrección de bug | `fix/<descripción-del-bug>` | `fix/chart-render-error` |
| Mejora de UI/UX | `ui/<descripción>` | `ui/update-dashboard-colors` |
| Documentación | `docs/<descripción>` | `docs/update-readme` |
| Refactorización | `refactor/<descripción>` | `refactor/storage-module` |

## Reglas

1. **Partir siempre de `main` actualizado** — `git checkout main && git pull`
2. **Nombres en kebab-case** — sin mayúsculas, tildes ni caracteres especiales
3. **Nombres descriptivos pero concisos** — máximo 5 palabras después del prefijo
4. **Una tarea = una rama** — no acumules cambios no relacionados en la misma rama
5. **Al terminar**: abrir PR hacia `main` con `gh pr create`, nunca push directo a `main`

## Flujo estándar

```
main
  └─→ feature/descripcion-breve
           └─→ commits del cambio
                    └─→ PR a main (gh pr create)
                              └─→ merge + delete branch
```

## Hook automático

El hook `PreToolUse` en `settings.json` detecta cuando estás en `main` antes de editar un archivo y crea automáticamente una rama con el patrón `feature/YYYYMMDD-HHmmss`.

**Renombra la rama antes de hacer push** para que sea descriptiva:
```bash
git branch -m feature/nombre-descriptivo-del-cambio
```
