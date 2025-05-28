# PianoLab Project

## Tech Stack
- **Frontend Framework**: React
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Build Tool**: Vite
- **Language**: TypeScript

## Current Features

### Core Features
- **Music piece management** - Create, edit, delete, and browse pieces with composer/style/tags
- **Recording sessions** - Track practice sessions with performer info and linked pieces  
- **Audio/MIDI player** - Play audio files with transport controls and timeline scrubbing
- **Chord progression tools** - Visual chord display, editing, and analysis on timeline

### Player & Timeline
- **Zoomable timeline** with playhead visualization and click-to-seek
- **Loop/selection system** - Create practice loops with visual selection overlay
- **Real-time chord tracking** - Shows current chord during playback
- **Timeline editing** - Drag/resize chord blocks, insert/delete chords

### Interface & Controls  
- **Virtual piano keyboard** - Interactive keyboard with MIDI note visualization
- **Keyboard shortcuts** - Space bar play/pause, arrow seeking, delete for chords
- **Responsive UI** - Card layouts, modals, dark theme with Tailwind/shadcn

### Data & Backend
- **Supabase integration** - Full CRUD operations with typed database schema
- **File upload system** - Audio/MIDI file handling
- **Many-to-many relationships** - Link pieces to multiple sessions

The app is designed as a piano practice and chord analysis tool for studying musical pieces and tracking practice sessions.