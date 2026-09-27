# AutoC4 Lumen

Web interface for controlling the Chaos Computer Club Cologne's infrastructure: lighting, DMX, HDMI matrix, music, presets, and more. Communicates with devices via MQTT over WebSockets.

## Tech Stack

- React 19, TypeScript
- Vite+ (Vite, Oxlint, Oxfmt)
- Tailwind CSS v4, shadcn/ui
- mqtt.js (MQTT over WebSocket)
- Zustand (MQTT state store)
- React Router (hash-based routing)

## Getting Started

### Prerequisites

- [Vite+](https://viteplus.dev) (`vp`). It downloads the Node.js and pnpm versions pinned in `package.json` automatically.
- Docker (optional, for the local MQTT broker)

### Setup

```sh
vp install
cp .env.example .env
```

`vp install` also sets up the pre-commit hook, which runs `vp check --fix` on staged files.

Edit `.env` to point at your MQTT broker:

```
VITE_MQTT_SERVER_URL=ws://localhost:9001
```

### Local MQTT Broker

A Docker Compose file is included to run a local Mosquitto broker:

```sh
docker compose up -d
```

This starts Mosquitto with:

- MQTT on port `1883`
- WebSockets on port `9001` (what the UI connects to)
- Anonymous access enabled

The defaults in `.env.example` already point at this broker.

### Development

```sh
vp dev
```

### Checks

```sh
vp check        # format, lint and typecheck
vp check --fix  # apply fixes
```

### Build

Use `vpr build` instead of `vp build` otherwise typechecking will not run. This will not just ignore type warnings but also errors because typescript is never run. `vp build` will only do typestripping and will not check anything for validity.

```sh
vpr build
```

Output goes to `dist/`. Serve it with any static file server.

### Production

The `.env.production` file is loaded automatically during `vp build`. It points at the production MQTT broker. Override by setting environment variables before building.

## Environment Variables

| Variable                  | Default  | Description                                                                              |
| ------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `VITE_MQTT_SERVER_URL`    | required | MQTT WebSocket URL. May be relative to the page; `http(s)://` is rewritten to `ws(s)://` |
| `VITE_MQTT_CLIENT_PREFIX` | `lumen_` | Client ID prefix for MQTT connections                                                    |

## Project Structure

```
src/
  app/          Navbar, route layout, tab pages
  components/
    ui/         shadcn/ui components
    lights/     LightButton, TasmotaButton, PairedLightButton, room panels
    dmx/        ColorPicker, DMXLamp, DMXMaster, DMXControls, DMXRoomContext
    aten/       Aten HDMI matrix routing grid
    busleiste/  LED bus module controller
    music/      MPD music player controls
    presets/    Preset buttons per room
    kitchenlight/ Kitchenlight screen selector
    status/     Window sensors, infrastructure heartbeat
    admin/      Club status, gate, shutdown, busleiste
  lib/
    mqtt/       MQTT client, Zustand store, hooks, config, topic matching
    hooks/      useKeySequence
    *.tsx       Admin context, cyber context, theme context, dialog system
```

## Licensing

This project is licensed under the MIT license, as reproduced in `LICENSE`.