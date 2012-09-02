#!/bin/bash

# Get the current size of the app's JS, Jade, and LESS files for reporting as an interesting statistic.

echo "Lines in .js files (not including packages):"
cat `find app -path "*.js"` | wc -l

echo "Lines in .jade files:"
cat `find app -path "*.jade"` | wc -l

echo "Lines in .less files (substract ~250 to account for legit.less):"
cat `find static -path "*.less"` | wc -l