docker-compose build
docker-compose up -d
sleep 2
npm run seed
sleep 5
npm run dev
