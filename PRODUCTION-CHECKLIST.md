# ✅ Production Deployment Checklist

Use this checklist to ensure everything is ready before going live.

---

## Pre-Deployment

### Security
- [ ] Run security audit: `./security-audit.sh`
- [ ] All security issues resolved
- [ ] `.env` files have 600 permissions
- [ ] `.gitignore` properly configured
- [ ] No sensitive files in git history
- [ ] Strong passwords generated (16+ characters)
- [ ] SECRET_KEY is unique and secure (64+ characters)

### Configuration
- [ ] `backend/.env.production` created and configured
- [ ] Database credentials set
- [ ] CORS origins updated with production domain
- [ ] SMTP credentials configured (if using email)
- [ ] Upload directories exist with correct permissions
- [ ] Frontend environment variables set

### Database
- [ ] PostgreSQL installed (if using PostgreSQL)
- [ ] Database created
- [ ] Database user created with strong password
- [ ] Database tables initialized: `python -m scripts.init_db`
- [ ] Admin account created: `python -m scripts.create_admin`
- [ ] Database backup strategy in place

### Dependencies
- [ ] Python 3.12+ installed
- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed: `pip install -r requirements.txt`
- [ ] Frontend dependencies installed: `npm install`
- [ ] Frontend built: `npm run build`

### Testing
- [ ] All backend tests pass: `pytest backend/tests/ -v`
- [ ] All frontend tests pass: `npm run test` (if applicable)
- [ ] Integration tests pass
- [ ] Manual testing of registration flow completed
- [ ] Admin dashboard tested
- [ ] File uploads tested
- [ ] Email notifications tested (if enabled)

---

## Deployment

### Server Setup
- [ ] Server provisioned (VPS/Cloud/Local)
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] SSH access configured
- [ ] Non-root user created
- [ ] Fail2ban installed (optional but recommended)

### Application Deployment
- [ ] Code deployed to server
- [ ] Environment files copied (not committed to git)
- [ ] File permissions set correctly
- [ ] Upload directories created
- [ ] Application starts without errors: `./prod.sh`
- [ ] Health check passes: `curl http://localhost:8000/health`

### Web Server (Nginx/Apache)
- [ ] Web server installed
- [ ] Virtual host configured
- [ ] Reverse proxy configured for backend API
- [ ] Static files served correctly
- [ ] Gzip compression enabled
- [ ] Security headers configured

### SSL/HTTPS
- [ ] Domain DNS configured
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] HTTPS enabled
- [ ] HTTP to HTTPS redirect configured
- [ ] SSL certificate auto-renewal configured
- [ ] SSL test passed (https://www.ssllabs.com/ssltest/)

### Process Management
- [ ] Systemd service created (or PM2/Supervisor)
- [ ] Service enabled to start on boot
- [ ] Service starts successfully
- [ ] Service restarts on failure
- [ ] Logs configured and rotating

---

## Post-Deployment

### Verification
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] API documentation accessible
- [ ] Admin login works
- [ ] Registration flow works end-to-end
- [ ] File uploads work
- [ ] Email notifications work (if enabled)
- [ ] Export functionality works
- [ ] Mobile responsiveness verified

### Monitoring
- [ ] Application logs accessible
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring configured
- [ ] Performance monitoring configured
- [ ] Disk space monitoring configured
- [ ] Database monitoring configured

### Backup
- [ ] Database backup script created
- [ ] Backup cron job configured
- [ ] Backup restoration tested
- [ ] Backup retention policy set
- [ ] Off-site backup configured (optional)

### Documentation
- [ ] Production credentials documented (securely)
- [ ] Server access documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Emergency contacts documented

---

## Security Hardening

### Application
- [ ] Debug mode disabled
- [ ] Error messages don't expose sensitive info
- [ ] Rate limiting configured (optional)
- [ ] CSRF protection enabled
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] File upload validation working

### Server
- [ ] SSH password authentication disabled
- [ ] SSH key-only authentication enabled
- [ ] Root login disabled
- [ ] Firewall rules configured
- [ ] Automatic security updates enabled
- [ ] Unnecessary services disabled
- [ ] Server hardening completed

### Database
- [ ] Database not exposed to internet
- [ ] Strong database password set
- [ ] Database user has minimal privileges
- [ ] Database backups encrypted (optional)

---

## Performance Optimization

### Backend
- [ ] Gunicorn workers configured (2 × CPU cores + 1)
- [ ] Database connection pooling configured
- [ ] Static file serving optimized
- [ ] Caching configured (optional)

### Frontend
- [ ] Production build created
- [ ] Assets minified
- [ ] Images optimized
- [ ] Lazy loading implemented (if applicable)

### Server
- [ ] Adequate resources allocated (CPU, RAM, Disk)
- [ ] Swap configured
- [ ] File descriptors limit increased (if needed)

---

## Compliance & Legal

- [ ] Privacy policy created (if collecting personal data)
- [ ] Terms of service created
- [ ] Cookie consent implemented (if applicable)
- [ ] GDPR compliance verified (if applicable)
- [ ] Data retention policy defined
- [ ] User data deletion process defined

---

## Launch

### Final Checks
- [ ] All checklist items completed
- [ ] Stakeholders notified
- [ ] Support team briefed
- [ ] Rollback plan ready
- [ ] Monitoring dashboards open

### Go Live
- [ ] DNS updated to production server
- [ ] DNS propagation verified
- [ ] Application accessible via production domain
- [ ] SSL certificate valid for production domain
- [ ] All functionality tested on production domain

### Post-Launch
- [ ] Monitor logs for errors
- [ ] Monitor performance metrics
- [ ] Monitor user registrations
- [ ] Respond to any issues immediately
- [ ] Document any issues and resolutions

---

## Maintenance Schedule

### Daily
- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Verify backups completed

### Weekly
- [ ] Review security logs
- [ ] Check disk space
- [ ] Review performance metrics
- [ ] Test backup restoration

### Monthly
- [ ] Update dependencies
- [ ] Review and rotate logs
- [ ] Security audit
- [ ] Performance review

### Quarterly
- [ ] Rotate credentials
- [ ] Security penetration test (optional)
- [ ] Disaster recovery drill
- [ ] Review and update documentation

---

## Emergency Procedures

### Application Down
1. Check server status
2. Check process status: `systemctl status ssu-backend`
3. Check logs: `journalctl -u ssu-backend -n 100`
4. Restart service: `systemctl restart ssu-backend`
5. If issue persists, check database connectivity
6. Notify stakeholders

### Database Issues
1. Check PostgreSQL status: `systemctl status postgresql`
2. Check database logs
3. Verify database connectivity
4. Check disk space
5. Restore from backup if necessary

### Security Breach
1. Immediately take application offline
2. Assess the breach
3. Rotate all credentials
4. Review logs for unauthorized access
5. Patch vulnerabilities
6. Restore from clean backup
7. Notify affected users (if required by law)
8. Document incident

---

## Rollback Procedure

If deployment fails:

1. Stop the application: `./stop.sh`
2. Restore previous code version
3. Restore database backup (if schema changed)
4. Restore previous environment files
5. Start application: `./prod.sh`
6. Verify functionality
7. Investigate and fix issues
8. Plan redeployment

---

## Sign-Off

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________  
**Approved By:** _______________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Checklist Version:** 1.0  
**Last Updated:** May 2, 2026
