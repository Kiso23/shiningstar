#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
# Security Audit Script — Shining Star United
# Checks for common security issues before deployment
# ══════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

ISSUES=0
WARNINGS=0

echo ""
echo -e "${BLUE}${BOLD}🔒 Security Audit — Shining Star United${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# ── Check 1: .gitignore exists ─────────────────────────────────────────────────
echo -e "${BLUE}[1/10]${NC} Checking .gitignore..."
if [ -f .gitignore ]; then
    if grep -q "\.env" .gitignore && grep -q "uploads/" .gitignore; then
        echo -e "  ${GREEN}✓${NC} .gitignore properly configured"
    else
        echo -e "  ${RED}✗${NC} .gitignore missing .env or uploads/ entries"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "  ${RED}✗${NC} .gitignore not found"
    ISSUES=$((ISSUES + 1))
fi

# ── Check 2: .env files not in git ─────────────────────────────────────────────
echo -e "${BLUE}[2/10]${NC} Checking for .env files in git..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    ENV_IN_GIT=$(git ls-files | grep -E "\.env$|\.env\.production$" || true)
    if [ -z "$ENV_IN_GIT" ]; then
        echo -e "  ${GREEN}✓${NC} No .env files tracked in git"
    else
        echo -e "  ${RED}✗${NC} Found .env files in git:"
        echo "$ENV_IN_GIT" | sed 's/^/    /'
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Not a git repository (skipping)"
    WARNINGS=$((WARNINGS + 1))
fi

# ── Check 3: SECRET_KEY not a placeholder ─────────────────────────────────────
echo -e "${BLUE}[3/10]${NC} Checking SECRET_KEY in backend/.env.production..."
if [ -f backend/.env.production ]; then
    if grep -q "SECRET_KEY=REPLACE_WITH\|SECRET_KEY=your-secret-key\|SECRET_KEY=$" backend/.env.production; then
        echo -e "  ${RED}✗${NC} SECRET_KEY is still a placeholder"
        ISSUES=$((ISSUES + 1))
    else
        SECRET_KEY=$(grep "^SECRET_KEY=" backend/.env.production | cut -d'=' -f2)
        if [ ${#SECRET_KEY} -ge 64 ]; then
            echo -e "  ${GREEN}✓${NC} SECRET_KEY is set and strong (${#SECRET_KEY} chars)"
        else
            echo -e "  ${YELLOW}⚠${NC} SECRET_KEY is short (${#SECRET_KEY} chars, recommend 64+)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo -e "  ${YELLOW}⚠${NC} backend/.env.production not found"
    WARNINGS=$((WARNINGS + 1))
fi

# ── Check 4: Database password not default ─────────────────────────────────────
echo -e "${BLUE}[4/10]${NC} Checking database credentials..."
if [ -f backend/.env.production ]; then
    if grep -q "CHANGE_PASSWORD\|password123\|admin123" backend/.env.production; then
        echo -e "  ${RED}✗${NC} Database password is a placeholder or weak"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "  ${GREEN}✓${NC} Database password appears to be set"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} backend/.env.production not found"
    WARNINGS=$((WARNINGS + 1))
fi

# ── Check 5: CORS origins configured ───────────────────────────────────────────
echo -e "${BLUE}[5/10]${NC} Checking CORS configuration..."
if [ -f backend/.env.production ]; then
    if grep -q "yourdomain.com" backend/.env.production; then
        echo -e "  ${YELLOW}⚠${NC} CORS_ORIGINS still contains placeholder 'yourdomain.com'"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "  ${GREEN}✓${NC} CORS_ORIGINS appears configured"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} backend/.env.production not found"
    WARNINGS=$((WARNINGS + 1))
fi

# ── Check 6: File permissions on .env files ────────────────────────────────────
echo -e "${BLUE}[6/10]${NC} Checking .env file permissions..."
PERM_ISSUES=0
for file in backend/.env backend/.env.production; do
    if [ -f "$file" ]; then
        PERMS=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%A" "$file" 2>/dev/null)
        if [ "$PERMS" = "600" ] || [ "$PERMS" = "400" ]; then
            echo -e "  ${GREEN}✓${NC} $file has secure permissions ($PERMS)"
        else
            echo -e "  ${YELLOW}⚠${NC} $file has loose permissions ($PERMS, recommend 600)"
            echo -e "    Fix with: chmod 600 $file"
            WARNINGS=$((WARNINGS + 1))
            PERM_ISSUES=$((PERM_ISSUES + 1))
        fi
    fi
done
if [ $PERM_ISSUES -eq 0 ] && [ -f backend/.env ]; then
    echo -e "  ${GREEN}✓${NC} All .env files have appropriate permissions"
fi

# ── Check 7: Uploads directory exists ──────────────────────────────────────────
echo -e "${BLUE}[7/10]${NC} Checking uploads directory..."
if [ -d backend/uploads ]; then
    if [ -d backend/uploads/logos ] && [ -d backend/uploads/payment_proofs ]; then
        echo -e "  ${GREEN}✓${NC} Uploads directory structure exists"
    else
        echo -e "  ${YELLOW}⚠${NC} Uploads subdirectories missing"
        echo -e "    Fix with: mkdir -p backend/uploads/logos backend/uploads/payment_proofs"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Uploads directory not found"
    echo -e "    Fix with: mkdir -p backend/uploads/logos backend/uploads/payment_proofs"
    WARNINGS=$((WARNINGS + 1))
fi

# ── Check 8: Dependencies installed ────────────────────────────────────────────
echo -e "${BLUE}[8/10]${NC} Checking Python dependencies..."
if [ -d backend/.venv ]; then
    if backend/.venv/bin/python -c "import fastapi, sqlalchemy, jose" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Core Python dependencies installed"
    else
        echo -e "  ${YELLOW}⚠${NC} Some Python dependencies missing"
        echo -e "    Fix with: cd backend && source .venv/bin/activate && pip install -r requirements.txt"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Python virtual environment not found"
    echo -e "    Fix with: cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    WARNINGS=$((WARNINGS + 1))
fi

# ── Check 9: Frontend dependencies ─────────────────────────────────────────────
echo -e "${BLUE}[9/10]${NC} Checking frontend dependencies..."
if [ -d frontend/node_modules ]; then
    echo -e "  ${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "  ${YELLOW}⚠${NC} Frontend dependencies not installed"
    echo -e "    Fix with: cd frontend && npm install"
    WARNINGS=$((WARNINGS + 1))
fi

# ── Check 10: Hardcoded secrets in code ────────────────────────────────────────
echo -e "${BLUE}[10/10]${NC} Scanning for hardcoded secrets..."
SECRETS_FOUND=0
# Check Python files for potential secrets
if command -v grep &> /dev/null; then
    PATTERNS=(
        "password.*=.*['\"][^'\"]{8,}['\"]"
        "api[_-]?key.*=.*['\"][^'\"]{8,}['\"]"
        "secret.*=.*['\"][^'\"]{8,}['\"]"
        "token.*=.*['\"][^'\"]{20,}['\"]"
    )
    
    for pattern in "${PATTERNS[@]}"; do
        MATCHES=$(grep -rniE "$pattern" backend/app/ frontend/src/ 2>/dev/null | grep -v "\.pyc\|node_modules\|\.git" || true)
        if [ ! -z "$MATCHES" ]; then
            SECRETS_FOUND=$((SECRETS_FOUND + 1))
        fi
    done
    
    if [ $SECRETS_FOUND -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} No obvious hardcoded secrets found"
    else
        echo -e "  ${YELLOW}⚠${NC} Potential hardcoded secrets detected (manual review needed)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠${NC} grep not available (skipping)"
fi

# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ Security audit passed!${NC}"
    echo -e "${GREEN}  No critical issues or warnings found.${NC}"
    exit 0
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}${BOLD}⚠ Security audit completed with warnings${NC}"
    echo -e "${YELLOW}  Found $WARNINGS warning(s). Review and fix before production deployment.${NC}"
    exit 0
else
    echo -e "${RED}${BOLD}✗ Security audit failed${NC}"
    echo -e "${RED}  Found $ISSUES critical issue(s) and $WARNINGS warning(s).${NC}"
    echo -e "${RED}  Fix all issues before deploying to production.${NC}"
    exit 1
fi
