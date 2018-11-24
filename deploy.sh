#!/bin/bash

ember build --environment production --output-path dist-prod
scp -r dist-prod/* root@178.62.247.241:/var/www/ol.zimaa.ch/ && rm -rf dist-prod

