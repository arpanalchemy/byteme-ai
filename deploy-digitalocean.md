# DigitalOcean Deployment Guide

## Health Check Troubleshooting

### Common Issues and Solutions

#### 1. **Port Configuration Issues**

**Problem**: DigitalOcean expects port 8080, but your app runs on 3000
**Solution**:

- Set `PORT=8080` in your environment variables
- Update DigitalOcean App Platform configuration

#### 2. **Application Not Starting**

**Problem**: App crashes during startup
**Solutions**:

- Check database connection
- Verify environment variables
- Review application logs

#### 3. **Health Check Endpoint Not Responding**

**Problem**: `/healthcheck` returns 404 or doesn't respond
**Solution**:

- Ensure the endpoint is properly configured
- Check if the app is actually running

#### 4. **Database Connection Issues**

**Problem**: App can't connect to PostgreSQL
**Solutions**:

- Verify database credentials
- Check network connectivity
- Ensure SSL configuration is correct

## Deployment Steps

### 1. **Prepare Your Application**

```bash
# Build the application
npm run build

# Test locally
npm run start:prod
```

### 2. **Configure Environment Variables**

Set these environment variables in DigitalOcean App Platform:

```env
NODE_ENV=production
PORT=8080
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
REDIS_URL=your-redis-url
JWT_SECRET=your-jwt-secret
VECHAIN_NETWORK=mainnet
VECHAIN_NODE_URL=https://mainnet.vechain.org
B3TR_CONTRACT_ADDRESS=your-contract-address
ADMIN_PRIVATE_KEY=your-admin-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
OPENAI_API_KEY=your-openai-key
```

### 3. **Deploy to DigitalOcean**

1. Connect your GitHub repository to DigitalOcean App Platform
2. Use the `.do/app.yaml` configuration
3. Set environment variables
4. Deploy

### 4. **Verify Deployment**

```bash
# Check if the app is running
curl https://your-app-url.ondigitalocean.app/healthcheck

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "port": 8080
}
```

## Troubleshooting Commands

### Check Application Logs

```bash
# In DigitalOcean App Platform dashboard
# Go to your app → Logs tab
# Look for error messages
```

### Test Health Check Locally

```bash
# Start your app locally
npm run start:prod

# Test health check
curl http://localhost:3000/healthcheck
```

### Test Database Connection

```bash
# Add this to your app temporarily for debugging
@Get('/test-db')
async testDatabase() {
  try {
    await this.dataSource.query('SELECT 1');
    return { status: 'Database connected' };
  } catch (error) {
    return { status: 'Database error', error: error.message };
  }
}
```

### Common Error Messages

1. **"Connection refused"**: Database not accessible
2. **"Invalid credentials"**: Wrong database password
3. **"Port already in use"**: Another process using the port
4. **"Module not found"**: Missing dependencies

## Health Check Configuration

### DigitalOcean App Platform

```yaml
health_check:
  http_path: /healthcheck
  initial_delay_seconds: 30
  interval_seconds: 10
  timeout_seconds: 5
  success_threshold: 1
  failure_threshold: 3
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthcheck', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

## Monitoring and Alerts

### Set up monitoring:

1. **Application Metrics**: Response time, error rate
2. **Database Metrics**: Connection pool, query performance
3. **Infrastructure Metrics**: CPU, memory, disk usage

### Configure alerts for:

1. Health check failures
2. High error rates
3. Database connection issues
4. Memory/CPU usage spikes

## Rollback Strategy

If deployment fails:

1. **Immediate Rollback**: Use DigitalOcean's rollback feature
2. **Database Rollback**: Restore from backup if needed
3. **Environment Rollback**: Revert environment variables

## Security Considerations

1. **Environment Variables**: Use DigitalOcean's encrypted environment variables
2. **Database Access**: Restrict database access to app instances only
3. **API Keys**: Rotate keys regularly
4. **SSL/TLS**: Ensure HTTPS is enabled

## Performance Optimization

1. **Database Connection Pooling**: Configure proper pool size
2. **Redis Caching**: Use Redis for session storage
3. **CDN**: Use DigitalOcean Spaces for static assets
4. **Load Balancing**: Scale horizontally if needed
