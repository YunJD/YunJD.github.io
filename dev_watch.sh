#!/bin/bash

trap "exit" INT TERM ERR
trap "kill 0" EXIT

#Try compiling first, then watch.
./node_modules/.bin/node-sass --include-path node_modules _src/sass/css.scss scripts/css/css.css
./node_modules/.bin/node-sass -w -r --include-path node_modules _src/sass/css.scss scripts/css/css.css &

webpack --watch &

bundle exec jekyll serve
