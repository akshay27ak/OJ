#!/bin/bash

# Build all language containers for the Online Judge

echo "Building Online Judge language containers..."

# Build Python container
echo "Building Python container..."
docker build -t oj-python:3.9 ./docker/python/

# Build JavaScript container
echo "Building JavaScript container..."
docker build -t oj-javascript:18 ./docker/javascript/

# Build C++ container
echo "Building C++ container..."
docker build -t oj-cpp:9 ./docker/cpp/

# Build Java container
echo "Building Java container..."
docker build -t oj-java:11 ./docker/java/

# Build C container
echo "Building C container..."
docker build -t oj-c:9 ./docker/c/

echo "All containers built successfully!"

# List built images
echo "Built images:"
docker images | grep "oj-"
