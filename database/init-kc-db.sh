#!/bin/bash
set -e

psql \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=kc_password="$KC_DB_PASSWORD" \
  <<'EOSQL'
CREATE USER keycloak WITH PASSWORD :'kc_password';
CREATE DATABASE keycloak OWNER keycloak;
EOSQL
