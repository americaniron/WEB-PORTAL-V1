# Known Vulnerabilities Assessment

## Date: 2026-02-08

### npm audit findings:

#### tar <=7.5.6 (2 high severity issues)
- **Status**: Accepted Risk
- **Reason**: 
  - Vulnerability is in transitive dependency (@mapbox/node-pre-gyp) used only during bcrypt native module compilation
  - Not exploitable in production runtime
  - Only affects the build/install process, not deployed application
  - bcrypt is a critical dependency for password hashing security
  
- **Mitigation**:
  - Build/install process runs in isolated CI/CD environment
  - Package lock file ensures deterministic builds
  - Monitor for bcrypt updates that remove the vulnerable dependency
  
- **Exploitation Risk**: Minimal - would require compromising the build environment

### Action Items:
1. ✅ Documented in security notes
2. ⏳ Monitor bcrypt for updates
3. ⏳ Re-evaluate when bcrypt@6.x is available

---

This file should be reviewed and updated with each deployment.
