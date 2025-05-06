# Docker Deployment Guide

This guide explains how to deploy the Holiday Optimizer application using Docker.

## Prerequisites

- Docker Engine installed on your system
- Docker Compose installed on your system

## Deployment Steps

### 1. Build and Start the Container

```bash
# Navigate to the project directory
cd holiday-optimizer

# Build and start the containers in detached mode
docker-compose up -d
```

### 2. Verify Deployment

Once the containers are up and running, you can access the application:

- Open your browser and navigate to `http://localhost:3000`

### 3. View Container Logs

```bash
# View logs from all containers
docker-compose logs

# View logs from a specific container and follow output
docker-compose logs -f app
```

### 4. Stop and Remove Containers

```bash
# Stop the containers
docker-compose down

# To remove volumes as well (caution: this removes persistent data)
docker-compose down -v
```

## Configuration

You can modify the following files to adjust the Docker deployment:

- `Dockerfile`: Container build instructions
- `docker-compose.yml`: Service configuration
- `.dockerignore`: Files to exclude from the build

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   If port 3000 is already in use, you can change the mapping in docker-compose.yml:
   ```yaml
   ports:
     - "8080:3000"  # Map container port 3000 to host port 8080
   ```

2. **Build failures**:
   - Check Docker and system resources
   - Ensure all required files are present and not in .dockerignore
   - Check Docker logs for detailed error messages

3. **Container not starting**:
   - Check the logs: `docker-compose logs app`
   - Verify environment variables are correctly set

## Advanced Configuration

### Environment Variables

You can add environment variables to the `docker-compose.yml` file:

```yaml
services:
  app:
    # ... existing config
    environment:
      - NODE_ENV=production
      - CUSTOM_VARIABLE=value
```

### Volumes for Persistence

If your application needs persistent storage, you can add volumes:

```yaml
services:
  app:
    # ... existing config
    volumes:
      - app-data:/app/data

volumes:
  app-data:
``` 