# kurau.wav v2.11.1-kurau.3 - Fase 5 Docker controlado

Contexto autorizado: VM Wings `192.168.3.131`, usuario `kurau-test`, ruta `/home/kurau-test/kurau-test-build`.

## Estado preparado

Este directorio contiene el contexto Docker completo de `kurau.wav v2.11.1-kurau.3` y dos scripts para ejecutar manualmente como administrador:

- `ops/phase5-docker-admin-test.sh`
- `ops/phase5-docker-cleanup.sh`

Los scripts no publican imagenes, no montan volumenes de produccion, no publican puertos, no montan el socket Docker y no usan privilegios adicionales.

## Comandos manuales

Desde la VM:

```sh
cd /home/kurau-test/kurau-test-build
sh ops/phase5-docker-admin-test.sh
```

El script ejecuta estos pasos:

1. Construye una imagen temporal con tag unico `kurau-wav:v2.11.1-kurau.3-wings-smoke-<timestamp>`.
2. Ejecuta un contenedor efimero sin red para comprobar runtime, usuario, directorio, Node, npm, `/entrypoint.sh` y sintaxis de `src/index.js`.
3. Ejecuta un contenedor estilo Wings con `STARTUP='node src/index.js'` y credenciales dummy.
4. Muestra logs e inspecciona el codigo de salida.
5. Imprime el comando exacto de limpieza para los recursos creados.

## Comandos equivalentes, expandidos

```sh
BUILD_DIR=/home/kurau-test/kurau-test-build
STAMP=$(date +%Y%m%d%H%M%S)
IMAGE_TAG="kurau-wav:v2.11.1-kurau.3-wings-smoke-${STAMP}"
CHECK_CONTAINER="kurau-wav-nodecheck-${STAMP}"
APP_CONTAINER="kurau-wav-dummy-start-${STAMP}"

cd "$BUILD_DIR"

docker build --pull --tag "$IMAGE_TAG" "$BUILD_DIR"

docker run \
  --name "$CHECK_CONTAINER" \
  --rm \
  --network none \
  --cpus 0.50 \
  --memory 256m \
  --pids-limit 128 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  "$IMAGE_TAG" \
  sh -lc 'id && pwd && node --version && npm --version && test -x /entrypoint.sh && node --check src/index.js'

docker run \
  --name "$APP_CONTAINER" \
  --detach \
  --network bridge \
  --cpus 0.50 \
  --memory 512m \
  --pids-limit 128 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --env STARTUP='node src/index.js' \
  --env TOKEN='dummy' \
  --env LAVALINK_HOST='192.168.3.131' \
  --env LAVALINK_PORT='30002' \
  --env LAVALINK_PASSWORD='dummy' \
  --env DEFAULT_LANGUAGE='es' \
  --env BRAND_PROFILE='kurau' \
  --env KURAU_PERSONALITY_ENABLED='true' \
  --env KURAU_VARIANTS_ENABLED='true' \
  --env KURAU_PUBLIC_EVENT_MESSAGES='false' \
  --env KURAU_PRESENCE_ROTATION='true' \
  --env KURAU_SARCASM_LEVEL='medium' \
  --env KURAU_EVENT_COOLDOWN_SECONDS='900' \
  --env KURAU_PRESENCE_INTERVAL_SECONDS='300' \
  --env SPOTIFY_ENABLED='false' \
  --env DEFAULT_VOLUME='80' \
  --env AUTOPLAY_DEFAULT='false' \
  --env DEFAULT_SEARCH_PLATFORM='ytmsearch' \
  "$IMAGE_TAG"

docker wait "$APP_CONTAINER"
docker logs "$APP_CONTAINER"
docker inspect "$APP_CONTAINER" --format 'Name={{.Name}} ExitCode={{.State.ExitCode}} OOMKilled={{.State.OOMKilled}} Error={{.State.Error}}'
```

## Limpieza

Usa exactamente los nombres que imprimio el script:

```sh
IMAGE_TAG='kurau-wav:v2.11.1-kurau.3-wings-smoke-YYYYMMDDHHMMSS' \
APP_CONTAINER='kurau-wav-dummy-start-YYYYMMDDHHMMSS' \
CHECK_CONTAINER='kurau-wav-nodecheck-YYYYMMDDHHMMSS' \
sh /home/kurau-test/kurau-test-build/ops/phase5-docker-cleanup.sh
```

La limpieza solo intenta borrar los dos contenedores y la imagen temporal indicados por esas variables.

## Criterio de lectura del resultado

GO tecnico para imagen local si:

- `docker build` termina OK.
- El smoke run sin red termina OK.
- El run estilo Wings imprime `:/home/container$ node src/index.js`.
- El fallo final, si ocurre, corresponde al token dummy de Discord.
- `docker inspect` no muestra `OOMKilled=true`.
- Los logs no muestran errores de permisos, modulos faltantes, `entrypoint`, rutas inexistentes o fallo de shell.

NO-GO si aparece cualquiera de estos:

- Fallo de build.
- `Cannot find module`.
- `permission denied` sobre `/entrypoint.sh`, `/home/container` o `src/index.js`.
- Error de `tini`, `sh`, `node` o directorio de trabajo.
- El contenedor no respeta `STARTUP`.
- OOM kill.

## Limitacion esperada

Con `TOKEN='dummy'`, no se puede validar login real de Discord ni presencia online. Ese resultado requiere un token de bot de pruebas y debe ejecutarse solo si el administrador decide hacerlo.
