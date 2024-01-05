# This is only for local development. 

docker-compose down
sleep 2
docker-compose build
docker-compose up -d
sleep 2
npm run seed
sleep 5
npm run dev
