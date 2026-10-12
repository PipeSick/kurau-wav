# kurau.wav v2.11.1-kurau.5 - GHCR release plan

Fecha: 2026-10-12

## Repositorio final

- GitHub owner detectado localmente: `PipeSick`
- Repositorio final propuesto: `PipeSick/kurau-wav`
- Imagen GHCR final: `ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.5`

Nota: Docker/GHCR requiere nombres de imagen en minusculas, por eso `PipeSick` se normaliza como `pipesick`.

## Codigo validado

El Dockerfile definitivo usa Node.js 22.16.0 con digest verificado:

```text
node:22.16.0-alpine3.22@sha256:41e4389f3d988d2ed55392df4db1420ad048ae53324a8e2b7c6d19508288107e
```

La prueba Docker controlada en Wings confirmo:

- runtime Node.js `v22.16.0`
- usuario `container`
- directorio `/home/container`
- `/entrypoint.sh` ejecutable
- `STARTUP='node src/index.js'` respetado
- fallo esperado solo por `TokenInvalid` con token dummy
- `OOMKilled=false`

## Publicacion GHCR

Workflow:

```text
.github/workflows/docker-publish.yml
```

Ejecucion manual en GitHub Actions:

1. Abrir `Publish kurau.wav Docker Image`.
2. Ejecutar `Run workflow`.
3. Ingresar exactamente:

```text
publish
```

El workflow:

- publica en `ghcr.io/pipesick/kurau-wav`
- genera tag versionado `v2.11.1-kurau.5`
- genera tag adicional con SHA
- no publica `latest`
- falla si el tag versionado ya existe
- usa `GITHUB_TOKEN` con permiso `packages: write`

Comprobacion posterior:

```bash
docker buildx imagetools inspect ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.5
```

Registrar el digest resultante:

```text
ghcr.io/pipesick/kurau-wav@sha256:DIGEST_PUBLICADO
```

## Egg de Pelican

Archivo:

```text
pelican/egg-kurau-wav.json
```

Imagen configurada:

```text
ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.5
```

Despues de publicar, se recomienda reemplazar el tag por el digest inmutable:

```text
ghcr.io/pipesick/kurau-wav@sha256:DIGEST_PUBLICADO
```

## Checklist de despliegue Pelican

1. Confirmar que la imagen GHCR existe y es descargable.
2. Importar `pelican/egg-kurau-wav.json` en Pelican.
3. Crear servidor nuevo de pruebas, no reemplazar produccion directamente.
4. Configurar variables:
   - `TOKEN`
   - `LAVALINK_HOST`
   - `LAVALINK_PORT=30002`
   - `LAVALINK_PASSWORD`
   - `DEFAULT_LANGUAGE=es`
   - `BRAND_PROFILE=kurau`
   - `KURAU_PERSONALITY_ENABLED=true`
   - `KURAU_VARIANTS_ENABLED=true`
   - `KURAU_PUBLIC_EVENT_MESSAGES=false`
   - `KURAU_PRESENCE_ROTATION=true`
   - `KURAU_THEME_COLOR=#B45CFF`
   - `KURAU_SARCASM_LEVEL=medium`
   - `KURAU_EVENT_COOLDOWN_SECONDS=300`
   - `KURAU_PRESENCE_INTERVAL_SECONDS=900`
5. No ejecutar dos instancias con el mismo token de Discord.
6. Arrancar el servidor de pruebas.
7. Verificar logs de Discord y Lavalink.
8. Probar `/play`, `/search`, seleccion interactiva, botones, `/queue`, `/skip`, `/pause`, `/autoplay` y enlaces Spotify si esta habilitado.

## Rollback

Antes del despliegue, guardar:

- imagen actual o digest actual
- variables Pelican actuales, sin imprimir secretos
- estado de Spotify y autoplay

Rollback recomendado:

1. Detener el servidor kurau.wav fallido.
2. Cambiar la imagen a la anterior conocida:

```text
ghcr.io/pipesick/kurau-wav@sha256:PREVIOUS_DIGEST
```

o, si no hay digest:

```text
ghcr.io/pipesick/kurau-wav:v2.11.1-kurau.2
```

3. Restaurar variables previas.
4. Arrancar el servidor.
5. Verificar Discord, Lavalink y comandos basicos.
6. Publicar una nueva version correctiva en vez de mover o sobrescribir `v2.11.1-kurau.5`.

## Estado

Preparado para publicar en GHCR, pendiente de autorizacion explicita.

No se publico, no se desplego y no se usaron credenciales de produccion.
