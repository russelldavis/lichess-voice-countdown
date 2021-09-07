#!/usr/local/bin/bash
set -PEeuo pipefail
shopt -s failglob inherit_errexit

cd ext
rm  -f ../dist.zip
zip -r ../dist.zip .
