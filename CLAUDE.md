# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BlockDrop is a Tetris clone with amazing 2D graphics built using Next.js and PixiJS. Designed for zero-config deployment to Vercel.

## Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Graphics**: PixiJS for hardware-accelerated 2D graphics and effects
- **Deployment**: Vercel (auto-builds from GitHub)
- **Styling**: Inline styles for game UI

## Development Commands

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable React components
└── game/         # Tetris game logic and PixiJS components
```

## Architecture

- **Next.js App Router**: Modern routing and server components
- **PixiJS Integration**: Client-side rendering with useEffect hooks
- **Game Loop**: Managed through PixiJS Application ticker
- **TypeScript**: Full type safety for game logic and components

## Vercel Deployment

Project is configured for automatic deployment to Vercel when pushed to GitHub. No additional configuration needed.