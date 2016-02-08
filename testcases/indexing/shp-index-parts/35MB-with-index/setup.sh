#!/usr/bin/env bash

export CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd ${CURRENT_DIR}

FILENAME=35MB-with-index

if [[ ! -f ./${FILENAME} ]]; then
    aws s3 cp s3://mapbox/tmp/carol/shp/index/${FILENAME} ./${FILENAME} --recursive
else
    echo "done: already downloaded ${FILENAME}"
fi