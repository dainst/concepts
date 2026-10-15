# Certs folder
This folder can contain certificate and keyfiles for SSL. To use it 
* set the environment variable CERTS in .env to true (or any other non-empty value).
* Name them as specified in the traefik/dynamic/tls.yml:
  * certFile: /certs/cert.pem
  * keyFile: /certs/key.pem


## Tip
To create a selfsigned certificate yourself
```
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout traefik/certs/key.pem \
  -out traefik/certs/cert.pem \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```
 
