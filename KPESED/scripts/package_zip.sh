#!/usr/bin/env bash
# Package HRMIS project as a ZIP file for delivery.
# Excludes node_modules, .next, dev.log, and other ephemeral build artifacts.

set -e

PROJECT_DIR="/home/z/my-project"
DOWNLOAD_DIR="$PROJECT_DIR/download"
OUTPUT_ZIP="$DOWNLOAD_DIR/hrmis-kpese.zip"
STAGING_DIR="$DOWNLOAD_DIR/hrmis-staging"

rm -rf "$STAGING_DIR" "$OUTPUT_ZIP"
mkdir -p "$STAGING_DIR"

echo "[1/5] Copying project files to staging..."
cd "$PROJECT_DIR"

# Copy project files (rsync-style excludes)
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dev.log' \
  --exclude='server.log' \
  --exclude='.zscripts' \
  --exclude='agent-ctx' \
  --exclude='screenshots' \
  --exclude='skills' \
  --exclude='upload' \
  --exclude='tests' \
  --exclude='custom.db' \
  --exclude='custom.db-journal' \
  --exclude='db/custom.db' \
  --exclude='db/custom.db-journal' \
  --exclude='.git' \
  ./ "$STAGING_DIR/"

echo "[2/5] Cleaning up empty dirs..."
find "$STAGING_DIR" -type d -empty -delete 2>/dev/null || true

echo "[3/5] Verifying key files exist..."
for f in package.json prisma/schema.prisma supabase/schema.sql supabase/seed.sql \
         scripts/seed.ts src/app/page.tsx src/lib/db.ts src/lib/supabase.ts \
         src/types/supabase.ts README.md .env.example; do
  if [ ! -f "$STAGING_DIR/$f" ]; then
    echo "  MISSING: $f"
    exit 1
  else
    echo "  OK: $f"
  fi
done

echo "[4/5] Creating ZIP..."
cd "$DOWNLOAD_DIR"
zip -r "hrmis-kpese.zip" "hrmis-staging" -q
mv hrmis-kpese.zip hrmis-kpese.zip.bak 2>/dev/null || true
cd "$DOWNLOAD_DIR" && rm -rf hrmis-final && mv hrmis-staging hrmis-final
zip -r hrmis-kpese.zip hrmis-final -q
rm -rf hrmis-final hrmis-kpese.zip.bak

echo "[5/5] Done!"
ls -lh "$OUTPUT_ZIP"
unzip -l "$OUTPUT_ZIP" | tail -5