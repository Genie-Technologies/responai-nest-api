!#/bin/bash

# Script for re-deploying app to the backend ec2 server until deployment is automated fully. 

git pull 

# Get a list of all running container IDs
container_ids=$(docker ps -q)

# Check if there are running containers
if [ -n "$container_ids" ]; then
    echo "Stopping and removing running containers:"
    
    # Iterate over each container ID
    for container_id in $container_ids; do
        # Stop the container
        docker stop $container_id
        
        # Remove the container
        docker rm $container_id

        echo "Container $container_id stopped and removed."
    done
else
    echo "No running containers found."
fi

docker build -t chat-ai-backend . 

docker run -dit -p 3001:3001 chat-ai-backend 