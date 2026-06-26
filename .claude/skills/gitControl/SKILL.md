---
name: gitControl
description: Gestión completa de operaciones Git y GitHub para el proyecto appGastos. Úsalo para inicializar el repo, crear commits, manejar ramas, abrir PRs, publicar en GitHub Pages, y cualquier operación de control de versiones. Invócalo con /gitControl seguido de la acción deseada (ej: /gitControl init, /gitControl commit, /gitControl deploy).
---

# gitControl — Control de versiones para appGastos

Skill centralizado para todas las operaciones Git y GitHub del proyecto. Usa `gh` CLI y `git` para ejecutar las acciones. Siempre verifica el estado actual antes de actuar.

## Acciones disponibles

El usuario puede invocar este skill con una acción específica o sin argumentos. Si no especifica acción, muestra el estado actual del repo y lista las acciones disponibles.

---

## 1. Estado del repositorio (`status`)

```bash
git status
git log --oneline -10
git branch -a
```

Muestra: rama actual, archivos modificados, últimos commits, ramas locales y remotas.

---

## 2. Inicializar el repositorio (`init`)

Si el directorio no es un repo git:

```bash
git init
git add .
git commit -m "feat: commit inicial de appGastos"
```

Luego pregunta si crear el repositorio remoto en GitHub (ver acción `create-repo`).

---

## 3. Crear repositorio en GitHub (`create-repo`)

```bash
gh repo create appGastos --public --description "Aplicación de gestión de gastos personales" --source . --remote origin --push
```

Si el usuario prefiere privado, usar `--private` en lugar de `--public`.

---

## 4. Commit (`commit`)

Flujo seguro de commit:

```bash
git status                          # ver qué cambió
git diff --stat                     # resumen de cambios
git add <archivos específicos>      # nunca `git add -A` sin revisar
git commit -m "<mensaje>"
```

**Reglas para el mensaje de commit:**
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `style:` cambios de CSS/UI sin lógica
- `refactor:` reorganización sin cambio de comportamiento
- `docs:` solo documentación
- Siempre en español, conciso, describe el *por qué* no el *qué*.

Nunca hacer commit de `.env`, credenciales, o archivos con datos sensibles.

---

## 5. Ramas (`branch`)

```bash
# Crear y cambiar a nueva rama
git checkout -b <nombre-rama>

# Listar ramas
git branch -a

# Cambiar de rama
git checkout <rama>

# Eliminar rama local (solo tras merge)
git branch -d <rama>
```

Convención de nombres: `feature/<descripcion>`, `fix/<descripcion>`, `hotfix/<descripcion>`.

---

## 6. Sincronizar con remoto (`sync`)

```bash
git fetch origin
git status
git pull origin <rama-actual>   # solo si no hay conflictos pendientes
git push origin <rama-actual>
```

Antes de hacer push, siempre verificar que no hay commits sin resolver.

---

## 7. Pull Request (`pr`)

```bash
# Crear PR
gh pr create --title "<título>" --body "<descripción>" --base main

# Listar PRs abiertos
gh pr list

# Ver PR específico
gh pr view <número>

# Merge PR
gh pr merge <número> --squash --delete-branch
```

El título del PR debe describir el cambio en términos del usuario, no del código.

---

## 8. Desplegar en GitHub Pages (`deploy`)

Activa GitHub Pages sobre la rama `main` (la app es HTML/CSS/JS estático, no necesita build):

```bash
# Asegurar que el código está en main y pusheado
git checkout main
git push origin main

# Activar GitHub Pages via gh CLI
gh api repos/{owner}/{repo}/pages \
  --method POST \
  -f source[branch]=main \
  -f source[path]=/

# Ver URL del sitio
gh api repos/{owner}/{repo}/pages --jq '.html_url'
```

Tras activar, esperar ~1 minuto para que GitHub propague el despliegue. La URL será `https://<usuario>.github.io/appGastos/`.

Para forzar un redespliegue (sin cambios de código), basta con hacer un push vacío:

```bash
git commit --allow-empty -m "chore: forzar redespliegue en GitHub Pages"
git push origin main
```

---

## 9. Ver historial (`log`)

```bash
git log --oneline --graph --all   # vista compacta con grafo de ramas
git log --stat -5                  # últimos 5 commits con archivos cambiados
git show <commit-hash>             # detalle de un commit específico
```

---

## 10. Deshacer cambios (`undo`)

Opciones según el caso, **siempre explicar al usuario qué hará antes de ejecutar**:

```bash
# Descartar cambios en un archivo (no staged)
git checkout -- <archivo>

# Quitar archivo del staging (sin perder cambios)
git reset HEAD <archivo>

# Revertir el último commit (mantiene cambios en working tree)
git reset --soft HEAD~1

# PELIGROSO — solo con confirmación explícita del usuario
git reset --hard HEAD~1
```

Nunca usar `--hard` o `--force-push` sin confirmación explícita.

---

## Flujo típico completo (primera vez)

```
/gitControl init          → inicializar repo local
/gitControl create-repo   → crear repo en GitHub y subir código
/gitControl deploy        → activar GitHub Pages
```

Tras el despliegue, la URL de GitHub Pages puede usarse como `--target-url` en TestSprite para ejecutar pruebas E2E.

---

## Reglas de seguridad

- **Nunca** hacer `git push --force` a `main` sin confirmación del usuario.
- **Nunca** commitear archivos con credenciales o tokens.
- **Siempre** mostrar `git diff --stat` antes de un commit para que el usuario vea qué se incluye.
- **Siempre** pedir confirmación antes de operaciones destructivas (`reset --hard`, `branch -D`, `force push`).
- En caso de conflictos de merge, mostrar los archivos en conflicto y preguntar cómo resolverlos.
