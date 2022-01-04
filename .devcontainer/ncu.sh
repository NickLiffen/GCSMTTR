#!/usr/bin/env bash

function setup {
    for d in */ ; do
        [ -L "${d%/}" ] && continue
        echo "Upgrading Dependencies in: $d"
        cd "$d"
        ncu -u
        npm install
        cd ..
    done
}

cd /workspaces/GCSMTTR/functions/helpers

setup

cd /workspaces/GCSMTTR/functions/authorizers

setup




