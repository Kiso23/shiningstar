#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# GitHub Setup Helper
# ═══════════════════════════════════════════════════════════════════

GREEN='\033[0;32m'
BLUE='\033[0;34m'
ORANGE='\033[0;33m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${BLUE}${BOLD}📤 GitHub Push Helper${NC}"
echo -e "${BLUE}════════════════════════${NC}"
echo ""

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo -e "${GREEN}✓ Remote 'origin' already configured${NC}"
    git remote -v
    echo ""
    echo -e "${ORANGE}Ready to push!${NC}"
    echo -e "Run: ${BOLD}git push -u origin main${NC}"
    exit 0
fi

echo -e "${ORANGE}You need to:${NC}"
echo ""
echo "1. Create a repository on GitHub:"
echo "   → Go to https://github.com/new"
echo "   → Name: shining-star-united"
echo "   → Don't initialize with README"
echo "   → Click 'Create repository'"
echo ""
echo "2. Copy your repository URL"
echo "   Example: https://github.com/username/shining-star-united.git"
echo ""
echo -e "${BLUE}3. Run this command with YOUR repository URL:${NC}"
echo ""
echo -e "${BOLD}git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git${NC}"
echo -e "${BOLD}git push -u origin main${NC}"
echo ""
echo -e "${ORANGE}Or use GitHub CLI (easier):${NC}"
echo ""
echo "# Install GitHub CLI"
echo "sudo apt install gh"
echo ""
echo "# Login and create repo"
echo "gh auth login"
echo "gh repo create shining-star-united --public --source=. --push"
echo ""
