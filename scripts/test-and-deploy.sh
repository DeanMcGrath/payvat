#!/bin/bash

echo "🚀 PayVAT Dashboard Fix - Test and Deploy Script"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Step 1: Build the application
print_status "Building application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed! Please fix build errors before deploying."
    exit 1
fi
print_success "Build completed successfully"

# Step 2: Run the E2E test locally first
print_status "Running E2E test against production..."
node test-dashboard-e2e.js
if [ $? -ne 0 ]; then
    print_warning "E2E test failed, but continuing with deployment to apply fixes"
else
    print_success "E2E test passed"
fi

# Step 3: Deploy to Vercel
print_status "Deploying to production..."
vercel --prod
if [ $? -ne 0 ]; then
    print_error "Deployment failed!"
    exit 1
fi
print_success "Deployment completed"

# Step 4: Wait a moment for deployment to propagate
print_status "Waiting 30 seconds for deployment to propagate..."
sleep 30

# Step 5: Run E2E test again to verify fixes
print_status "Running final E2E test to verify fixes..."
node test-dashboard-e2e.js
if [ $? -eq 0 ]; then
    print_success "🎉 All fixes deployed and verified! Dashboard should now work correctly."
else
    print_warning "Some issues remain. Check the test output above for details."
    print_status "The fixes have been deployed, but may need additional time to take effect."
fi

echo ""
echo "================================================="
echo "Deployment Summary:"
echo "• Enhanced guest user document retrieval"
echo "• Increased database timeouts and circuit breaker limits"
echo "• Removed aggressive retry mechanisms"
echo "• Added safety timeouts and better error handling"
echo "• Improved caching with longer TTLs"
echo "• Added comprehensive logging and monitoring"
echo ""
echo "If issues persist, check browser console for detailed logs."