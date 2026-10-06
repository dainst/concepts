import * as fs from "node:fs";

const files = {
  'realm': fs.readFileSync('../keycloak/realm.json', 'utf8'),
  'user-profile': fs.readFileSync('../keycloak/user-profile.json', 'utf8')
};

const resolveReferences = reference =>
  (reference.startsWith('stringify:'))
    ? JSON.stringify(JSON.stringify(JSON.parse(resolveReferences(reference.substring('stringify:'.length)))))
    : files[reference]
      .replaceAll(/"\$REF:(.*?:)(.*?)"/g, m => resolveReferences(m.substring('"$REF:'.length, m.length - 1)));


fs.writeFileSync('../keycloak/realm/realm.json', resolveReferences('realm'));
