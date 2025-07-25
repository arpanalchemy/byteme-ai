# DigitalOcean Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000` (DigitalOcean expects this port)
- [ ] `DB_HOST` (PostgreSQL host)
- [ ] `DB_PORT=5432`
- [ ] `DB_USERNAME` (Database username)
- [ ] `DB_PASSWORD` (Database password)
- [ ] `DB_NAME` (Database name)
- [ ] `REDIS_URL` (Redis connection string)
- [ ] `JWT_SECRET` (Secure JWT secret)
- [ ] `VECHAIN_NETWORK=mainnet`
- [ ] `VECHAIN_NODE_URL=https://mainnet.vechain.org`
- [ ] `B3TR_CONTRACT_ADDRESS` (Your smart contract address)
- [ ] `ADMIN_PRIVATE_KEY` (Admin wallet private key)
- [ ] `AWS_ACCESS_KEY_ID` (AWS access key)
- [ ] `AWS_SECRET_ACCESS_KEY` (AWS secret key)
- [ ] `AWS_REGION=us-east-1`
- [ ] `AWS_S3_BUCKET` (S3 bucket name)
- [ ] `OPENAI_API_KEY` (OpenAI API key)

### ✅ Application Configuration
- [ ] Health check endpoint `/healthcheck` is working
- [ ] Root endpoint `/` is accessible
- [ ] Application builds successfully (`npm run build`)
- [ ] Application starts in production mode (`npm run start:prod`)
- [ ] Database connection is working
- [ ] All required dependencies are installed

### ✅ DigitalOcean Configuration
- [ ] GitHub repository is connected
- [ ] `.do/app.yaml` configuration is correct
- [ ] Environment variables are set in DigitalOcean dashboard
- [ ] Health check path is set to `/healthcheck`
- [ ] Port is set to 3000
- [ ] Database and Redis are provisioned

## Deployment Steps

### 1. Local Testing
```bash
# Run diagnostic tool
npm run diagnose

# Test health check locally
npm run health-check

# Build and test production build
npm run build
npm run start:prod
```

### 2. DigitalOcean Deployment
1. Go to DigitalOcean App Platform
2. Create new app from GitHub repository
3. Configure environment variables
4. Set health check path to `/healthcheck`
5. Deploy the application

### 3. Post-Deployment Verification
```bash
# Test the deployed application
curl https://your-app-url.ondigitalocean.app/healthcheck

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "port": 3000
}
```

## Troubleshooting

### If Health Check Fails:

1. **Check Application Logs**
   - Go to DigitalOcean App Platform dashboard
   - Navigate to your app → Logs tab
   - Look for error messages

2. **Common Issues:**
   - Port mismatch (should be 3000, not 3000)
   - Database connection failure
   - Missing environment variables
   - Application crashes during startup

3. **Quick Fixes:**
   - Set `PORT=3000` in environment variables
   - Verify database credentials
   - Check all required environment variables are set
   - Ensure application builds successfully

### If Application Won't Start:

1. **Check Build Logs**
   - Look for TypeScript compilation errors
   - Check for missing dependencies
   - Verify Node.js version compatibility

2. **Check Runtime Logs**
   - Look for database connection errors
   - Check for missing environment variables
   - Verify file permissions

### If Database Connection Fails:

1. **Verify Database Credentials**
   - Check host, port, username, password
   - Ensure database exists
   - Verify network connectivity

2. **Check SSL Configuration**
   - Production databases often require SSL
   - Verify SSL certificates

## Monitoring

### Set up monitoring for:
- [ ] Application response time
- [ ] Error rates
- [ ] Database connection pool
- [ ] Memory usage
- [ ] CPU usage

### Configure alerts for:
- [ ] Health check failures
- [ ] High error rates (>5%)
- [ ] Memory usage >80%
- [ ] Database connection failures

## Security Checklist

- [ ] JWT secret is secure and unique
- [ ] Database passwords are strong
- [ ] API keys are properly secured
- [ ] HTTPS is enabled
- [ ] Environment variables are encrypted
- [ ] Database access is restricted

## Performance Checklist

- [ ] Database connection pooling is configured
- [ ] Redis caching is enabled
- [ ] Static assets are served via CDN
- [ ] API responses are optimized
- [ ] Database queries are indexed

## Rollback Plan

If deployment fails:
1. Use DigitalOcean's rollback feature
2. Check previous deployment logs
3. Fix issues identified
4. Redeploy with fixes

## Support

If you continue to have issues:
1. Check DigitalOcean documentation
2. Review application logs thoroughly
3. Test locally with production environment variables
4. Contact DigitalOcean support if needed 