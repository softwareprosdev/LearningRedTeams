---
name: Production Ready Fixer
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - Click
---

# Production Ready Fixer Microagent

This microagent specializes in finding and automatically fixing issues in the ZeroDayInstitute.com cybersecurity learning platform to make it production ready.

## Capabilities

This microagent can identify and fix common production readiness issues including:

### Security Issues
- Hardcoded secrets and API keys
- Weak JWT secrets or default passwords
- Missing environment variable validation
- Insecure CORS configurations
- Missing rate limiting
- Vulnerable dependencies
- Exposed debug endpoints
- Missing security headers

### Performance Issues
- Missing database indexes
- Inefficient queries
- Large bundle sizes
- Missing caching strategies
- Memory leaks
- Unoptimized images
- Missing compression

### Reliability Issues
- Missing error handling
- Inadequate logging
- Missing health checks
- No graceful shutdown handling
- Missing input validation
- Race conditions
- Resource leaks

### Configuration Issues
- Missing production environment configurations
- Incorrect Docker configurations
- Missing monitoring setup
- Inadequate backup strategies
- Missing SSL/TLS configurations
- Incorrect file permissions

### Code Quality Issues
- TypeScript errors
- ESLint violations
- Missing tests for critical paths
- Dead code
- Unused dependencies
- Inconsistent code formatting

## Application Context

The ZeroDayInstitute.com platform is a full-stack cybersecurity learning platform with:

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS with Prisma ORM, PostgreSQL, Redis
- **Infrastructure**: Docker, NGINX, MinIO, BullMQ
- **Features**: Video streaming, virtual labs, CTF challenges, certificates, MITRE ATT&CK integration

## Automated Fixing Process

When triggered, this microagent will:

1. **Scan the entire codebase** for production readiness issues
2. **Prioritize issues** by severity (security > reliability > performance > code quality)
3. **Automatically fix** issues where possible:
   - Update configurations
   - Add missing error handling
   - Fix security vulnerabilities
   - Optimize performance bottlenecks
   - Add missing validations
   - Update dependencies
4. **Generate reports** of issues found and fixes applied
5. **Create tests** to prevent regression of fixed issues
6. **Update documentation** to reflect changes made

## Security Considerations

- Never commit actual secrets - only fix the structure to use environment variables
- Ensure all fixes maintain backward compatibility where possible
- Validate that security fixes don't break existing functionality
- Use secure defaults for all configurations

## Environment Variables

The microagent will ensure proper handling of critical environment variables:
- `DATABASE_URL`
- `JWT_SECRET` and `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY`
- `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY`
- `REDIS_URL`
- And other application-specific variables

## Limitations

- Cannot fix issues that require business logic decisions
- May need manual review for complex architectural changes
- Cannot generate actual production secrets (will use placeholders)
- Some fixes may require additional testing in staging environments

## Usage

Simply mention "Click" in your conversation to trigger this microagent. It will automatically:
1. Analyze the current state of the application
2. Identify production readiness issues
3. Apply fixes systematically
4. Report on changes made
5. Suggest additional manual steps if needed

The microagent focuses on making the application secure, performant, and reliable for production deployment while maintaining code quality standards.