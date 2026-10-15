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



echo "## 1. Update version nr"
sed -i -E 's/("version"[[:space:]]*:[[:space:]]*")[^"]*(")/\1'"$NEXT_VERSION"'\2/' backend/package.json
sed -i -E 's/("version"[[:space:]]*:[[:space:]]*")[^"]*(")/\1'"$NEXT_VERSION"'\2/' frontend/package.json
sed -i -E "s|ghcr.io/dainst/concepts-([^:/]+):${CURRENT_VERSION}|ghcr.io/dainst/concepts-\1:${NEXT_VERSION}|g" docker-compose.prod.yml


echo "## 2. Build & Upload images"
echo "$GHCR_PW" | docker login ghcr.io -u "$GHCR_UN" --password-stdin

docker build . \
  --file backend/Dockerfile \
  --no-cache \
  --target production \
  --tag ghcr.io/dainst/concepts-backend:latest \
  --tag ghcr.io/dainst/concepts-backend:"$NEXT_VERSION" \
  --label "org.opencontainers.image.description=Concepts Backend" \
  --label "org.opencontainers.image.licenses=MIT"
#  --label "org.opencontainers.image.source=https://github.com/dainst/concepts" \ TODO when we're ready for public
docker push ghcr.io/dainst/concepts-backend:latest
docker push ghcr.io/dainst/concepts-backend:"$NEXT_VERSION"

docker build . \
  --file frontend/Dockerfile \
  --no-cache \
  --target production \
  --tag ghcr.io/dainst/concepts-frontend:latest \
  --tag ghcr.io/dainst/concepts-frontend:"$NEXT_VERSION" \
  --label "org.opencontainers.image.description=Concepts Frontend" \
  --label "org.opencontainers.image.licenses=MIT"
  #  --label "org.opencontainers.image.source=https://github.com/dainst/concepts" \ TODO when we're ready for public
docker push ghcr.io/dainst/concepts-frontend:latest
docker push ghcr.io/dainst/concepts-frontend:"$NEXT_VERSION"

echo "images built."

echo "## 2. Build dist"
rm -rf dist/*.tar.gz
mkdir -p dist/tmp
cp docker-compose.prod.yml dist/tmp/docker-compose.yml
cp sample.env dist/tmp/sample.env
node script/create-realm-json.js
mkdir dist/tmp/keycloak
mkdir dist/tmp/keycloak/realm
cp keycloak/realm/realm.json dist/tmp/keycloak/realm/realm.json
cp -r traefik dist/tmp/traefik
cp -r database dist/tmp/database
tar -czf dist/concepts-"$NEXT_VERSION".tar.gz --transform='s|^\./||' -C dist/tmp .
rm -rf dist/tmp

echo "## 3. Commit"
git add keycloak/realm.json
git add backend/package.json
git add frontend/package.json
git add -u -- dist
git commit -m "update version nr to $NEXT_VERSION"
git tag "$NEXT_VERSION"
git push origin tag "$NEXT_VERSION"
