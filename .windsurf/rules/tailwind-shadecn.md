---
trigger: model_decision
description: 
globs: 
---
## Tailwind + shadcn conventions (CSS-only tokens)

1. Never emit literal color utilities like bg-gray-*, text-gray-*.
2. Always replace them with the semantic classes declared under @layer utilities
   (bg-muted, text-muted-foreground, bg-primary, etc.).
3. Extract repeated class clusters into class-variance-authority (cva) helpers.