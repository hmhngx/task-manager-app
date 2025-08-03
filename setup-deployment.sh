#!/bin/bash

# 🚀 Complete Free Deployment Setup Script
# Task Manager App - 100% Free Stack

echo "🚀 Setting up Task Manager App Deployment (100% Free Stack)"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_status "All prerequisites are installed!"
}

# Install Railway CLI
install_railway_cli() {
    print_info "Installing Railway CLI..."
    
    if ! command -v railway &> /dev/null; then
        npm install -g @railway/cli
        print_status "Railway CLI installed successfully!"
    else
        print_status "Railway CLI is already installed!"
    fi
}

# Install Vercel CLI
install_vercel_cli() {
    print_info "Installing Vercel CLI..."
    
    if ! command -v vercel &> /dev/null; then
        npm install -g vercel
        print_status "Vercel CLI installed successfully!"
    else
        print_status "Vercel CLI is already installed!"
    fi
}

# Setup backend deployment
setup_backend() {
    print_info "Setting up backend deployment (Railway)..."
    
    cd task-manager-backend
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install
    
    # Build the application
    print_info "Building backend application..."
    npm run build
    
    print_warning "Backend setup complete!"
    print_info "Next steps:"
    print_info "1. Go to https://railway.app"
    print_info "2. Sign up with GitHub"
    print_info "3. Create new project and connect this repository"
    print_info "4. Set root directory to 'task-manager-backend'"
    print_info "5. Configure environment variables in Railway dashboard"
    
    cd ..
}

# Setup frontend deployment
setup_frontend() {
    print_info "Setting up frontend deployment (Vercel)..."
    
    cd task-manager-frontend
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm install
    
    # Make deployment script executable
    chmod +x deploy-vercel.sh
    
    print_warning "Frontend setup complete!"
    print_info "Next steps:"
    print_info "1. Run: vercel login"
    print_info "2. Run: ./deploy-vercel.sh"
    print_info "3. Set environment variables in Vercel dashboard"
    
    cd ..
}

# Generate VAPID keys
generate_vapid_keys() {
    print_info "Generating VAPID keys for push notifications..."
    
    if ! command -v web-push &> /dev/null; then
        npm install -g web-push
    fi
    
    print_info "Generating VAPID keys..."
    web-push generate-vapid-keys
    
    print_warning "VAPID keys generated!"
    print_info "Save these keys and set them as environment variables:"
    print_info "VAPID_PUBLIC_KEY=your-public-key"
    print_info "VAPID_PRIVATE_KEY=your-private-key"
}

# Create environment files
create_env_files() {
    print_info "Creating environment example files..."
    
    # Backend env example
    if [ ! -f "task-manager-backend/.env" ]; then
        cp task-manager-backend/env.example task-manager-backend/.env
        print_status "Created backend .env file"
    fi
    
    # Frontend env example
    if [ ! -f "task-manager-frontend/.env" ]; then
        cp task-manager-frontend/env.example task-manager-frontend/.env
        print_status "Created frontend .env file"
    fi
    
    print_warning "Please update the .env files with your actual credentials!"
}

# Display deployment checklist
show_checklist() {
    echo ""
    echo "📋 DEPLOYMENT CHECKLIST"
    echo "======================="
    echo ""
    echo "🔧 Prerequisites:"
    echo "  □ GitHub account"
    echo "  □ Vercel account (vercel.com)"
    echo "  □ Railway account (railway.app)"
    echo "  □ MongoDB Atlas account (mongodb.com/atlas)"
    echo "  □ Brevo account (brevo.com) - for email"
    echo "  □ Cloudinary account (cloudinary.com) - for file uploads"
    echo "  □ OpenAI account (platform.openai.com) - for AI features"
    echo ""
    echo "🚀 Deployment Steps:"
    echo "  1. □ Setup MongoDB Atlas database"
    echo "  2. □ Deploy backend to Railway"
    echo "  3. □ Deploy frontend to Vercel"
    echo "  4. □ Configure email service (Brevo)"
    echo "  5. □ Setup file uploads (Cloudinary)"
    echo "  6. □ Configure push notifications (VAPID)"
    echo "  7. □ Setup AI features (OpenAI)"
    echo "  8. □ Configure CI/CD (GitHub Actions)"
    echo ""
    echo "🔗 URLs to configure:"
    echo "  Backend: https://task-manager-backend-production.up.railway.app"
    echo "  Frontend: https://task-manager-frontend.vercel.app"
    echo "  Database: MongoDB Atlas cluster"
    echo ""
    echo "📚 Documentation:"
    echo "  Full guide: DEPLOYMENT_GUIDE.md"
    echo "  Backend docs: task-manager-backend/README.md"
    echo "  Frontend docs: task-manager-frontend/README.md"
}

# Main execution
main() {
    echo ""
    print_info "Starting Task Manager App deployment setup..."
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Install CLI tools
    install_railway_cli
    install_vercel_cli
    
    # Setup deployments
    setup_backend
    setup_frontend
    
    # Generate VAPID keys
    generate_vapid_keys
    
    # Create environment files
    create_env_files
    
    # Show checklist
    show_checklist
    
    echo ""
    print_status "Setup complete! Follow the checklist above to complete deployment."
    echo ""
    print_info "For detailed instructions, see: DEPLOYMENT_GUIDE.md"
}

# Run main function
main 