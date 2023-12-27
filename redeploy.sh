!#/bin/bash

# Script for re-deploying app to the backend ec2 server until deployment is automated fully. 

git pull 

cd deploy/
docker compose build
docker compose down
docker compose up -d
