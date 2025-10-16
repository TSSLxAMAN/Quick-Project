#!/bin/bash

echo "🚀 Deploying AssignMatch..."

echo "Stopping existing containers..."
docker-compose down

echo "Building and starting containers..."
docker-compose up -d --build

echo "Waiting for services to start..."
sleep 10

echo "Checking service status..."
docker-compose ps

echo "Showing logs..."
docker-compose logs --tail=50

echo "✅ Deployment complete!"
echo ""
echo "Access your application at:"
echo "Frontend: http://YOUR_EC2_IP"
echo "Backend API: http://YOUR_EC2_IP:8000"
echo "Django Admin: http://YOUR_EC2_IP:8000/admin"