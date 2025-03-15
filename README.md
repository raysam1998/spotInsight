# SpotInsight

SpotInsight is a Spotify analytics and playlist modifier app that allows users to gain insights about their listening habits and modify their playlists.

## Project Structure

The project is organized as a monorepo with two main packages:

- `client`: React/TypeScript frontend application
- `server`: Node.js/Express/TypeScript backend API

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Yarn
- Spotify Developer Account

### Environment Variables

1. Create a `.env` file in the `client` directory using the `.env.example` as a template.
2. Create a `.env` file in the `server` directory using the `.env.example` as a template.

### Installation

```bash
# Install dependencies for client and server
yarn install

# Start development servers
yarn dev
```

## Development

- Client: [http://localhost:3000](http://localhost:3000)
- Server: [http://localhost:4000](http://localhost:4000)

## License

MIT
