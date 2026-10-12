#!/bin/bash
set -euo pipefail

CURRENT_VERSION=$(git describe --tags --abbrev=0)
NEXT_VERSION=$((CURRENT_VERSION + 1))

echo "# Create Distribution - Version $NEXT_VERSION"



echo "## 0. Checking State..."

branch="$(git branch --show-current)"
if [[ "$branch" != "main" ]]; then
  echo "Error: Expected branch 'main', currently on '$branch'." >&2
  exit 1
fi

if [[ -n "$(git tag --points-at HEAD)" ]]; then
  echo "Error: Current commit has one or more tags." >&2
  exit 1
fi


if [[ -n "$(git status --porcelain)" ]]; then
  echo "Warning: Git working tree is not clean."
  read -r -p "Continue anyway? [y/N] " answer
  case "$answer" in [yY]|[yY][eE][sS]) ;;
    *) echo "Aborted." >&2; exit 1 ;;
  esac
fi


echo "## 1. Build & Upload images"

#echo "$GHCR_PW" | docker login ghcr.io -u "$GHCR_UN" --password-stdin
#
#docker build . \
#  --file backend/Dockerfile \
#  --no-cache \
#  --target production \
#  --tag ghcr.io/dainst/concepts-backend:latest \
#  --tag ghcr.io/dainst/concepts-backend:"$NEXT_VERSION" \
#  --label "org.opencontainers.image.description=Concepts Backend" \
#  --label "org.opencontainers.image.licenses=MIT"
##  --label "org.opencontainers.image.source=https://github.com/dainst/concepts" \ TODO when we're ready for public
#docker push ghcr.io/dainst/concepts-backend:latest
#docker push ghcr.io/dainst/concepts-backend:"$NEXT_VERSION"
#
#docker build . \
#  --file frontend/Dockerfile \
#  --no-cache \
#  --target production \
#  --tag ghcr.io/dainst/concepts-frontend:latest \
#  --tag ghcr.io/dainst/concepts-frontend:"$NEXT_VERSION" \
#  --label "org.opencontainers.image.description=Concepts Frontend" \
#  --label "org.opencontainers.image.licenses=MIT"
#  #  --label "org.opencontainers.image.source=https://github.com/dainst/concepts" \ TODO when we're ready for public
#docker push ghcr.io/dainst/concepts-frontend:latest
#docker push ghcr.io/dainst/concepts-frontend:"$NEXT_VERSION"

echo "Done."

git tag "$NEXT_VERSION"
git push --follow-tags
