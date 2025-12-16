#!/usr/bin/env bash

set -e

if [ "$1" != "prod" ] && [ "$1" != "dev" ]; then
    echo "Usage: $0 <prod|dev> <jp|us>"
    exit 1
fi

if [ "$2" != "jp" ] && [ "$2" != "us" ]; then
    echo "Usage: $0 <prod|dev> <jp|us>"
    exit 1
fi

cd "$(dirname "$0")/../"

ENV="$1"
LOCALE="$2"

if [ "$ENV" == "dev" ]; then
    cp "manifest.${LOCALE}.dev.json" manifest.json
    npx kintone-plugin-packer \
        --out "plugin/dev/chobiitPlugin-dev-${LOCALE}.zip" \
        --ppk plugin/dev/ipmblgnejlffkgipejlcdpacemjplofc.private.ppk .
fi

if [ "$ENV" == "prod" ]; then
    cp "manifest.${LOCALE}.prod.json" manifest.json
    npx kintone-plugin-packer \
        --out "plugin/prod/chobiitPlugin-prod-${LOCALE}.zip" \
        --ppk plugin/prod/ajblhiocoadmlnjljhloimhacpohbpak.private.ppk .
fi

rm -f manifest.json

exit 0