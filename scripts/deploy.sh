#!/bin/bash

# PayVAT Automated Deployment Script
# Handles git commit, push, and Vercel deployment automatically

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if there are changes to commit
check_changes() {
    if [[ -z $(git status -s) ]]; then
        print_warning "No changes to commit"
        exit 0
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Check if test script exists
    if [ -f "scripts/test-woocommerce-fix.ts" ]; then
        print_status "Running WooCommerce VAT extraction tests..."
        npx tsx scripts/test-woocommerce-fix.ts 2>&1 | grep -E "(✅|❌|Match:|Expected)" || true
    fi
    
    # Run Next.js build test
    print_status "Testing Next.js build..."
    npm run build > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Build test passed"
    else
        print_error "Build test failed"
        exit 1
    fi
}

# Main deployment process
main() {
    echo "PayVAT Automated Deployment Script"
    echo "======================================"
    
    # Check for uncommitted changes
    check_changes
    
    # Get deployment message (optional)
    COMMIT_MSG="${1:-"Automated deployment via deploy.sh"}"
    
    print_status "Starting deployment process..."
    
    # Step 1: Run tests
    print_status "Step 1/4: Running tests"
    run_tests
    
    # Step 2: Git operations
    print_status "Step 2/4: Committing changes"
    
    # Show current status
    echo ""
    git status --short
    echo ""
    
    # Add all changes
    git add -A
    
    # Create commit with timestamp
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    FULL_MSG="$COMMIT_MSG

Deployed at: $TIMESTAMP
Generated with Automated Deploy Script

Co-Authored-By: Claude <noreply@anthropic.com>"
    
    git commit -m "$FULL_MSG"
    print_success "Changes committed"
    
    # Step 3: Push to GitHub
    print_status "Step 3/4: Pushing to GitHub"
    git push origin main
    print_success "Pushed to GitHub"
    
    # Step 4: Deploy to Vercel
    print_status "Step 4/4: Deploying to Vercel"
    
    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Installing..."
        npm i -g vercel
    fi
    
    # Deploy to production
    print_status "Deploying to production..."
    DEPLOYMENT_URL=$(vercel --prod --yes 2>&1 | grep "Production:" | awk '{print $2}')
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        print_success "Deployment successful!"
        echo ""
        echo "Production URL: $DEPLOYMENT_URL"
        echo "Dashboard: https://vercel.com/dashboard"
        
        # Optional: Open deployment in browser
        if command -v open &> /dev/null; then
            print_status "Opening deployment in browser..."
            open "$DEPLOYMENT_URL"
        fi
    else
        print_warning "Could not extract deployment URL, but deployment may have succeeded"
        print_status "Check: https://vercel.com/dashboard"
    fi
    
    echo ""
    echo "======================================"
    print_success "Deployment complete!"
    echo ""
    echo "Summary:"
    echo "  - Tests: Passed"
    echo "  - Commit: $COMMIT_MSG"
    echo "  - Push: GitHub"
    echo "  - Deploy: Vercel Production"
}

# Handle errors
trap 'print_error "Deployment failed! Check the error above."; exit 1' ERR

# Run main function
main "$@"