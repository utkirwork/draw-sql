#!/bin/bash

# Organization API Tests Runner Script
# Usage: ./run-tests.sh [test-type] [options]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
VERBOSE=""
COVERAGE=""

# Function to print colored output
print_info() {
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

# Function to show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -t, --type TYPE     Test type: unit, api, all (default: all)"
    echo "  -v, --verbose       Verbose output"
    echo "  -c, --coverage      Generate coverage report"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  # Run all tests"
    echo "  $0 -t unit          # Run only unit tests"
    echo "  $0 -t api -v        # Run API tests with verbose output"
    echo "  $0 -c               # Run all tests with coverage"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE="--debug"
            shift
            ;;
        -c|--coverage)
            COVERAGE="--coverage"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate test type
if [[ ! "$TEST_TYPE" =~ ^(unit|api|all)$ ]]; then
    print_error "Invalid test type: $TEST_TYPE. Must be: unit, api, or all"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_info "Starting Organization API Tests..."
print_info "Test Type: $TEST_TYPE"
print_info "Working Directory: $SCRIPT_DIR"

# Check if codeception is available
if ! command -v codecept &> /dev/null; then
    print_error "Codeception not found. Please install it first."
    print_info "Install with: composer global require codeception/codeception"
    exit 1
fi

# Check if codeception.yml exists
if [[ ! -f "codeception.yml" ]]; then
    print_error "codeception.yml not found in current directory"
    exit 1
fi

# Initialize codeception if needed
if [[ ! -d "_support" ]]; then
    print_info "Initializing Codeception..."
    codecept bootstrap
fi

# Build test helpers
print_info "Building test helpers..."
codecept build

# Function to run tests
run_tests() {
    local test_suite=$1
    local options="$VERBOSE $COVERAGE"
    
    print_info "Running $test_suite tests..."
    
    if [[ "$test_suite" == "all" ]]; then
        codecept run $options
    else
        codecept run $test_suite $options
    fi
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        print_success "$test_suite tests completed successfully!"
    else
        print_error "$test_suite tests failed with exit code: $exit_code"
        return $exit_code
    fi
}

# Create output directory if it doesn't exist
mkdir -p _output

# Run the tests
case $TEST_TYPE in
    "unit")
        run_tests "unit"
        ;;
    "api")
        run_tests "api"
        ;;
    "all")
        print_info "Running all test suites..."
        
        # Run unit tests first
        run_tests "unit"
        unit_result=$?
        
        # Run API tests
        run_tests "api"
        api_result=$?
        
        # Summary
        echo ""
        print_info "=== Test Summary ==="
        if [[ $unit_result -eq 0 ]]; then
            print_success "Unit Tests: PASSED"
        else
            print_error "Unit Tests: FAILED"
        fi
        
        if [[ $api_result -eq 0 ]]; then
            print_success "API Tests: PASSED"
        else
            print_error "API Tests: FAILED"
        fi
        
        # Overall result
        if [[ $unit_result -eq 0 && $api_result -eq 0 ]]; then
            print_success "All tests passed!"
            exit 0
        else
            print_error "Some tests failed!"
            exit 1
        fi
        ;;
esac

print_info "Test execution completed."

# Show coverage report location if generated
if [[ -n "$COVERAGE" && -f "_output/coverage/index.html" ]]; then
    print_info "Coverage report generated: _output/coverage/index.html"
fi 