# AutoC4 Lumen

Web interface for controlling the Chaos Computer Club Cologne's infrastructure: lighting, DMX, HDMI matrix, music, presets, and more. Communicates with devices via MQTT over WebSockets.

## Tech Stack

- React 19, TypeScript, Vite
- Tailwind CSS v4, shadcn/ui
- mqtt.js (MQTT over WebSocket)
- Zustand (MQTT state store)
- React Router (hash-based routing)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Setup

```sh
pnpm install
cp .env.example .env
```

Edit `.env` to point at your MQTT broker:

```
VITE_MQTT_SERVER=localhost
VITE_MQTT_PORT=9001
```

### Development

```sh
pnpm dev
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

### Build

```sh
pnpm build
```

Output goes to `dist/`. Serve it with any static file server.

### Production

The `.env.production` file is loaded automatically during `pnpm build`. It points at the production MQTT broker. Override by setting environment variables before building.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_MQTT_SERVER` | `localhost` | MQTT broker hostname |
| `VITE_MQTT_PORT` | `9001` | MQTT WebSocket port |
| `VITE_MQTT_CLIENT_PREFIX` | `lumen_` | Client ID prefix for MQTT connections |

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
