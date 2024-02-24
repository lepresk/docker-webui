# My Application

This AdonisJS-based application allows you to visualize Docker container logs.

## Prerequisites

- Node.js
- AdonisJS
- Docker

## Installation

1. Clone the repository.
2. Install dependencies with `npm install`.

## Configuration

1. Ensure Docker is installed and running on your machine.
2. Configure Docker access if necessary.

## Usage

1. Run the AdonisJS development server with `node ace serve -w`.
2. Access the corresponding URL to view container information (`/logs`) or logs from a specific container (`/logs/:id/view`).

## Project Structure

- **app/Controllers/LogsController.ts**: Primary controller for Docker logs management.
- **resources/views/containers.edge**: View to display container information.
- **resources/views/view-log.edge**: View to display logs from a specific container.