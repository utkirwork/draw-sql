# Organization API Unit Tests

Bu papka Organization API module'i uchun unit va integration testlarni o'z ichiga oladi.

## Test Structure

```
tests/
├── unit/
│   ├── controllers/
│   │   └── OrganizationControllerTest.php  # Controller unit tests
│   ├── models/
│   │   ├── OrganizationTest.php           # Model unit tests
│   │   └── OrganizationSearchTest.php     # Search model tests
├── api/
│   └── OrganizationAPICest.php           # API integration tests
├── _support/
├── _output/
├── codeception.yml                        # Test configuration
└── README.md                             # Bu fayl
```

## Test Types

### 1. Unit Tests (`tests/unit/`)

**OrganizationControllerTest.php**
- Controller initialization
- Actions configuration
- Behaviors setup  
- HTTP verbs validation

**OrganizationTest.php**
- Model validation rules
- Attribute labels
- Data serialization
- Field types validation
- Business logic

**OrganizationSearchTest.php**
- Search functionality
- Filtering and pagination
- Query building
- Sort configuration

### 2. API Integration Tests (`tests/api/`)

**OrganizationAPICest.php**
- Complete CRUD operations
- HTTP status codes
- Response structure validation
- Authentication testing
- Error handling
- Full workflow testing

## Running Tests

### Prerequisites

1. Yii2 application configured
2. Codeception installed
3. Test database configured
4. Organization API module enabled

### Commands

```bash
# Navigate to organization module tests
cd application/common/modules/organization/tests

# Run all tests
codecept run

# Run only unit tests
codecept run unit

# Run only API tests  
codecept run api

# Run specific test file
codecept run unit/controllers/OrganizationControllerTest

# Run with detailed output
codecept run --debug

# Generate test coverage (if enabled)
codecept run --coverage
```

## Test Coverage

Tests cover the following functionality:

### API Endpoints
- `GET /v1/organization/organization` - List organizations
- `GET /v1/organization/organization/{id}` - View organization
- `POST /v1/organization/organization` - Create organization
- `PUT /v1/organization/organization/{id}` - Update organization
- `PATCH /v1/organization/organization/{id}` - Partial update
- `DELETE /v1/organization/organization/{id}` - Delete organization
- `OPTIONS /v1/organization/organization` - Get allowed methods

### Test Scenarios
- ✅ Valid data processing
- ✅ Invalid data validation
- ✅ Authentication/Authorization
- ✅ HTTP status codes
- ✅ Response format validation
- ✅ Pagination and filtering
- ✅ Error handling
- ✅ Complete CRUD workflow

### Validation Testing
- ✅ Required fields
- ✅ Field length limits
- ✅ Data type validation
- ✅ Business rules
- ✅ Status validation

## Configuration

Test configuration is in `codeception.yml`:

```yaml
namespace: xbsoft\organization\tests
suites:
    unit:
        actor: UnitTester
        modules: [Asserts, Yii2]
    api:
        actor: ApiTester  
        modules: [REST, Yii2]
```

## Sample Test Output

```
Organization API Unit Tests

Unit Tests:
✓ OrganizationControllerTest: Controller initialization (0.05s)
✓ OrganizationControllerTest: Actions configuration (0.03s)
✓ OrganizationTest: Valid organization creation (0.02s)
✓ OrganizationTest: Name is required (0.02s)
✓ OrganizationSearchTest: Search returns data provider (0.04s)

API Tests:
✓ OrganizationAPICest: Index organizations (0.15s)
✓ OrganizationAPICest: Create organization (0.12s)
✓ OrganizationAPICest: View organization (0.08s)
✓ OrganizationAPICest: Update organization (0.10s)
✓ OrganizationAPICest: Delete organization (0.09s)
✓ OrganizationAPICest: Full organization workflow (0.25s)

Time: 1.02s, Memory: 32.00MB
OK (11 tests, 45 assertions)
```

## Environment Setup

Testlar uchun alohida environment configuration:

```php
// config/test-local.php
return [
    'components' => [
        'db' => [
            'dsn' => 'mysql:host=localhost;dbname=test_db',
            // Test database configuration
        ],
        'mailer' => [
            'useFileTransport' => true,
        ],
    ],
];
```

## Notes

- Testlar test database'da ishlaydi
- Har bir test o'zining clean state'ni maintain qiladi
- API testlarda authentication token kerak
- Integration testlar real HTTP requests yuboradi
- Unit testlar faqat class logic'ini test qiladi

## Contributing

Yangi testlar qo'shishda:

1. Naming convention'ni follow qiling
2. Setup va teardown methodlarini ishlating
3. Assertions'ni descriptive qiling
4. Edge case'larni test qiling
5. Documentation'ni yangilang 