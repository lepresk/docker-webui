# Docker web-ui log-viewer

This AdonisJS web-ui based application allows you to visualize Docker container logs.

## Prerequisites

- Node.js
- [AdonisJS](https://adonisjs.com)
- Docker

## Installation

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Rename the .env.example file to .env
2. Generate a key by typing the command: `node ace generate:key`.

## Configuration

1. Ensure Docker is installed and running on your machine.
2. Configure Docker access if necessary.

## Usage

1. Run the AdonisJS development server with `node ace serve`.
2. Access the corresponding URL to view container information (`/logs`) or logs from a specific container (`/logs/:id/view`).
2. Access the corresponding URL to download  logs from a specific container (`/logs/:id/download`).

## Project Structure

- **app/Controllers/LogsController.ts**: Primary controller for Docker logs management.
- **resources/views/containers.edge**: View to display container information.
- **resources/views/view-log.edge**: View to display logs from a specific container.
