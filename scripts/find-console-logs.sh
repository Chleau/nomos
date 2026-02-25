#!/bin/bash

# Script pour trouver les console.log restants dans le code source
# Usage: ./scripts/find-console-logs.sh

echo "🔍 Recherche des console.log/error/warn dans le code source..."
echo ""

# Exclure node_modules, .next, et les fichiers de test
grep -rn --color=always \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --exclude-dir="coverage" \
  --exclude-dir="__tests__" \
  --exclude="*.test.ts" \
  --exclude="*.test.tsx" \
  --exclude="logger.ts" \
  "console\.\(log\|error\|warn\|debug\)" src/ || echo "✅ Aucun console.log trouvé !"

echo ""
echo "💡 Remplacez ces occurrences par:"
echo "   import { logger } from '@/lib/logger'"
echo "   logger.log() / logger.error() / logger.warn() / logger.debug()"
