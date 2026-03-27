# Noted

A lightweight note-taking web app that **saves notes as Markdown (`.md`) files** on disk.

## Features

- **Create / edit notes** in a simple editor
- **Live Markdown preview** while you type
- **Notes are stored as files** in the local `notes/` folder (one `.md` file per note)
- **List and open saved notes** from the sidebar

## Tech

- Node.js + Express (`server.js`)
- [`marked`](https://www.npmjs.com/package/marked) for Markdown → HTML preview
- Vanilla HTML/CSS/JS frontend (`index.html`, `style.css`, `app.js`)

## Getting started running local on your system

### Requirements For Running Local

- Node.js (LTS recommended)

### Install

```bash
npm install
```

### Run

```bash
node server.js
```

Then open `http://localhost:3000` in your browser.

## Run with Docker

### Requirements

- Docker
- Docker Compose (or `docker compose` plugin)

### Option A: Docker Compose (recommended)

```bash
docker compose up -d
```

Open `http://localhost:3000`.

To stop:

```bash
docker compose down
```

### Option B: Plain Docker

Build the image:

```bash
docker build -t noted .
```

Run the container with notes persisted to your local `notes/` folder:

```bash
docker run --rm -p 3000:3000 -v "$(pwd)/notes:/app/notes" noted
```

Open `http://localhost:3000`.

## Where notes are saved

- **Folder**: `notes/` (created automatically on first server start)
- **Format**: Markdown files ending in `.md`
- **Filename rule**: the note title is lowercased, spaces become `-`, and `.md` is appended  
  Example: `My First Note` → `my-first-note.md`
- **Docker persistence**: `docker-compose.yml` mounts `./notes` to `/app/notes` inside the container

## API (for reference)

- `GET /notes` → list all `.md` files in `notes/`
- `GET /notes/:filename` → fetch one note’s raw Markdown content
- `POST /notes` → save/update a note (`{ "title": "...", "content": "..." }`)
- `DELETE /notes/:filename` → delete a note
- `POST /preview` → Markdown preview (`{ "content": "..." }` → `{ "html": "..." }`)

## Project structure

```text
noted/
  index.html
  style.css
  app.js
  server.js
  Dockerfile
  docker-compose.yml
  .dockerignore
  notes/            # created automatically; your .md notes live here
  package.json
```

