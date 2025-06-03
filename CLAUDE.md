# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: TailwindCSS with shadcn/ui components
- **Build Tool**: Vite
- **State Management**: Zustand with persistence
- **Backend**: Supabase (PostgreSQL database with real-time subscriptions)
- **Audio/MIDI**: Tone.js, @tonejs/midi for audio processing
- **Testing**: Vitest with React Testing Library

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production (TypeScript check + Vite build)
npm run lint         # Run ESLint
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with Vitest UI
npm run format       # Format code with Prettier
npm run preview      # Preview production build
```

## Architecture Overview

### State Management

- **Zustand stores** in `src/stores/`:
    - `chordsStore.ts` - Chord progression state with persistence and undo/redo
    - `historyStore.ts` - Global undo/redo system for all state changes
- **React Query** hooks in `src/hooks/queries/` for server state management
- **Context providers** for component-specific state (PlayerContext, TransportContext)

### Key Patterns

- **Provider pattern**: PlayerProvider wraps session views, combining audio/MIDI player state
- **Custom hooks**: Extract complex logic (usePlayer, useMidiNotes, useTransportState)
- **Store actions**: All state mutations go through action functions for consistency
- **Collision-aware updates**: Chord timeline prevents overlapping with `applyNoOverlapRule`

### Data Flow

1. **Supabase client** (`src/supabase.ts`) handles all backend communication
2. **Entity types** (`src/types/entities.types.ts`) from generated database schema
3. **React Query hooks** manage caching, mutations, and optimistic updates
4. **Zustand stores** handle complex local state with persistence

### Component Structure

- **Pages** (`src/pages/`) - Route-level components
- **Feature components** (`src/components/`) organized by domain:
    - `Player/` - Audio player, timeline, keyboard, controls
    - `Pieces/` - Music piece management
    - `Recordings/` - Session recording management
- **Shared components** (`src/components/ui/`) - shadcn/ui components
- **Layout components** - Navbar, theme provider

### Key Features

- **Timeline editing**: Drag/resize chord blocks with collision detection
- **Real-time audio**: Sync timeline playhead with audio playback
- **MIDI visualization**: Parse MIDI files and display notes on virtual keyboard
- **Keyboard shortcuts**: Global shortcuts for play/pause, seeking, chord editing
- **Persistent state**: Chord progressions auto-save to localStorage
- **Undo/redo system**: Global history with tagged snapshots
