#!/bin/sh

LOCK_FILE="../.build.lock"

if [ ! -f "$LOCK_FILE" ]; then

  echo "====================================================================="
  echo "====== CHECKING AUTO DEPLOY FOR $(date) ========"
  echo "====================================================================="

  echo "=== creating build lock file in $LOCK_FILE"
  touch $LOCK_FILE 

  if git pull | grep -q "Updating"; then
    echo "=== Updating to the most recent CC version"

    ./deploy.sh || echo "ERROR DURING BUILD :( "
  else
    echo "CC is up to date :)"
  fi

  echo "=== removing build lock file in $LOCK_FILE"
  rm $LOCK_FILE

fi