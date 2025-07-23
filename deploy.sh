#!/bin/bash

# Black Market Alien Store - Production Deployment Script

set -e  # Exit on any error

echo "🚀 Starting Black Market Alien Store deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your production values before continuing."
    exit 1
fi

# Load environment variables
source .env

print_status "Building production images..."

# Build the application
docker-compose -f docker-compose.production.yml build --no-cache

print_status "Starting services..."

# Start the services
docker-compose -f docker-compose.production.yml up -d

print_status "Waiting for services to be ready..."

# Wait for API to be ready
timeout=60
counter=0
while ! curl -f http://localhost:5000/api/health &> /dev/null; do
    if [ $counter -eq $timeout ]; then
        print_error "API failed to start within $timeout seconds"
        docker-compose -f docker-compose.production.yml logs api
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

print_status "API is ready!"

# Wait for client to be ready
timeout=30
counter=0
while ! curl -f http://localhost/health &> /dev/null; do
    if [ $counter -eq $timeout ]; then
        print_error "Client failed to start within $timeout seconds"
        docker-compose -f docker-compose.production.yml logs client
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

print_status "Client is ready!"

# Seed database if requested
if [ "$1" = "--seed" ]; then
    print_status "Seeding database..."
    docker-compose -f docker-compose.production.yml exec api npm run seed:production
fi

print_status "Deployment completed successfully! 🎉"
print_status "Application is running at:"
print_status "  Frontend: http://localhost"
print_status "  API: http://localhost:5000"
print_status "  Health Check: http://localhost:5000/api/health"

echo ""
print_status "To view logs:"
echo "  docker-compose -f docker-compose.production.yml logs -f"
echo ""
print_status "To stop the application:"
echo "  docker-compose -f docker-compose.production.yml down"