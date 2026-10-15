# Run
## Development
1. Start a Keycloak and a DB container: `docker compose up`
2. Start local Backend *when they are ready*: `cd backend && npm start:dev`
3. Start local Frontend `cd frontend && npm run start`


## Production
1. Get concepts-V.tar.gz from releases or the dist folder.
2. extract on target machine
3. `mv sample.env .env`
4. adjust settings in .env
5. put ssl certifactes under traefik/certs and name them cert.pem and key.pem
6. `docker compose up`
