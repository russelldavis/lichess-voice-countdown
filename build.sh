#!/usr/local/bin/bash
set -PEeuo pipefail
shopt -s failglob inherit_errexit

cd ext
zip -r ../dist.zip .
