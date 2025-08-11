#!/bin/bash

# SonarCloud Setup Script for HC-Lisp
# This script helps configure SonarCloud integration

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "☁️ HC-Lisp SonarCloud Setup"
echo "==========================="
echo ""

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Not in a git repository${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Git repository detected${NC}"
}

# Function to check GitHub repository
check_github_repo() {
    local remote_url=$(git config --get remote.origin.url 2>/dev/null || echo "")
    if [[ $remote_url == *"github.com"* ]]; then
        echo -e "${GREEN}✅ GitHub repository detected${NC}"
        # Extract owner and repo name
        if [[ $remote_url =~ github\.com[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
            GITHUB_OWNER="${BASH_REMATCH[1]}"
            GITHUB_REPO="${BASH_REMATCH[2]}"
            echo "Repository: ${GITHUB_OWNER}/${GITHUB_REPO}"
        fi
    else
        echo -e "${RED}❌ GitHub repository not detected${NC}"
        echo "Remote URL: $remote_url"
        exit 1
    fi
}

# Function to show setup instructions
show_setup_instructions() {
    echo -e "${BLUE}📋 SonarCloud Setup Instructions${NC}"
    echo ""
    echo "1. 🌐 Create SonarCloud Account:"
    echo "   • Go to: https://sonarcloud.io"
    echo "   • Sign in with your GitHub account"
    echo ""
    echo "2. 📊 Import Project:"
    echo "   • Click 'Import project from GitHub'"
    echo "   • Select: ${GITHUB_OWNER}/${GITHUB_REPO}"
    echo "   • Project key will be: HectorIFC_hc-lisp"
    echo ""
    echo "3. 🔑 Generate Token:"
    echo "   • Go to: https://sonarcloud.io/account/security"
    echo "   • Generate a new token (name: HC-Lisp CI)"
    echo "   • Copy the token value"
    echo ""
    echo "4. ⚙️  Configure GitHub Secret:"
    echo "   • Go to: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/settings/secrets/actions"
    echo "   • Click 'New repository secret'"
    echo "   • Name: SONAR_TOKEN"
    echo "   • Value: [paste your token]"
    echo "   • ⚠️  Important: Without this token, the GitHub Action will fail!"
    echo ""
    echo "5. 🚀 Trigger Analysis:"
    echo "   • Push a commit to master branch"
    echo "   • Check GitHub Actions tab for workflow status"
    echo "   • View results at: https://sonarcloud.io/project/overview?id=HectorIFC_hc-lisp"
    echo ""
}

# Function to verify configuration files
verify_config_files() {
    echo -e "${BLUE}🔍 Verifying configuration files...${NC}"
    
    local files_ok=true
    
    # Check sonar-project.properties
    if [ -f "sonar-project.properties" ]; then
        echo -e "${GREEN}✅ sonar-project.properties exists${NC}"
        
        # Check if project key is correctly set
        if grep -q "sonar.projectKey=HectorIFC_hc-lisp" sonar-project.properties; then
            echo -e "${GREEN}✅ Project key configured correctly${NC}"
        else
            echo -e "${YELLOW}⚠️  Project key may need updating${NC}"
        fi
    else
        echo -e "${RED}❌ sonar-project.properties missing${NC}"
        files_ok=false
    fi
    
    # Check GitHub workflow
    if [ -f ".github/workflows/sonarcloud.yml" ]; then
        echo -e "${GREEN}✅ SonarCloud workflow exists${NC}"
    else
        echo -e "${RED}❌ SonarCloud workflow missing${NC}"
        files_ok=false
    fi
    
    # Check Jest configuration for LCOV
    if [ -f "jest.config.js" ] && grep -q "lcov" jest.config.js; then
        echo -e "${GREEN}✅ Jest configured for LCOV coverage${NC}"
    else
        echo -e "${YELLOW}⚠️  Jest may need LCOV coverage configuration${NC}"
    fi
    
    if [ "$files_ok" = true ]; then
        echo -e "${GREEN}✅ All configuration files are ready${NC}"
    else
        echo -e "${RED}❌ Some configuration files are missing${NC}"
    fi
    
    echo ""
}

# Function to test local coverage generation
test_coverage_generation() {
    echo -e "${BLUE}🧪 Testing coverage generation...${NC}"
    
    if npm test -- --coverage --coverageReporters=lcov > /dev/null 2>&1; then
        if [ -f "coverage/lcov.info" ]; then
            local file_size=$(wc -c < coverage/lcov.info)
            echo -e "${GREEN}✅ Coverage generated successfully (${file_size} bytes)${NC}"
        else
            echo -e "${RED}❌ LCOV file not generated${NC}"
        fi
    else
        echo -e "${RED}❌ Tests failed or coverage generation failed${NC}"
    fi
    
    echo ""
}

# Function to show post-setup verification
show_verification_steps() {
    echo -e "${BLUE}🔍 Verification Steps${NC}"
    echo ""
    echo "After completing setup, verify:"
    echo ""
    echo "1. 📊 Check SonarCloud Project:"
    echo "   https://sonarcloud.io/project/overview?id=HectorIFC_hc-lisp"
    echo ""
    echo "2. 🔄 Check GitHub Actions:"
    echo "   https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions"
    echo ""
    echo "3. 📈 Verify Metrics:"
    echo "   • Coverage should be reported"
    echo "   • Code smells analysis"
    echo "   • Security hotspots"
    echo "   • Maintainability rating"
    echo ""
    echo "4. 🎯 Quality Gate:"
    echo "   • Should pass for new code"
    echo "   • Check coverage threshold"
    echo ""
}

# Main execution
main() {
    check_git_repo
    check_github_repo
    echo ""
    verify_config_files
    test_coverage_generation
    show_setup_instructions
    show_verification_steps
    
    echo -e "${GREEN}🎉 SonarCloud setup guide complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Follow the setup instructions above"
    echo "2. Push a commit to trigger the first analysis"
    echo "3. Check the results on SonarCloud"
}

# Show help
show_help() {
    echo "HC-Lisp SonarCloud Setup"
    echo ""
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --verify       Only verify configuration"
    echo "  --test         Only test coverage generation"
    echo ""
    echo "This script helps you set up SonarCloud integration for the HC-Lisp project."
    echo "It will guide you through the process of configuring SonarCloud analysis"
    echo "that runs automatically on every commit to the master branch."
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --verify)
        check_git_repo
        check_github_repo
        verify_config_files
        exit 0
        ;;
    --test)
        test_coverage_generation
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        show_help
        exit 1
        ;;
esac
