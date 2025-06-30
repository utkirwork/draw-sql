<?php

namespace xbsoft\organization\tests\api;

use ApiTester;
use Codeception\Util\HttpCode;

/**
 * Class OrganizationAPICest
 * API Integration tests for Organization endpoints
 */
class OrganizationAPICest
{
    /**
     * @var string
     */
    private $baseUrl = '/v1/organization/organization';

    /**
     * @var array
     */
    private $headers = [
        'Accept' => 'application/json',
        'Content-Type' => 'application/json'
    ];

    /**
     * @var string
     */
    private $authToken = 'test-token'; // Should be replaced with actual test token

    /**
     * Set up before each test
     */
    public function _before(ApiTester $I)
    {
        // Set auth headers
        $I->haveHttpHeader('Authorization', 'Bearer ' . $this->authToken);
        $I->haveHttpHeader('Accept', 'application/json');
    }

    /**
     * Test GET /v1/organization/organization (Index) - List organizations
     */
    public function testIndexOrganizations(ApiTester $I)
    {
        $I->wantTo('get list of organizations');
        $I->sendGET($this->baseUrl);
        
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseIsJson();
        
        // Verify response structure
        $I->seeResponseMatchesJsonType([
            'allModels' => 'array',
            'pagination' => [
                'page' => 'integer',
                'pageSize' => 'integer',
                'pageCount' => 'integer',
                'totalCount' => 'integer'
            ]
        ]);
    }

    /**
     * Test GET /v1/organization/organization with pagination
     */
    public function testIndexOrganizationsWithPagination(ApiTester $I)
    {
        $I->wantTo('get list of organizations with pagination');
        $I->sendGET($this->baseUrl, [
            'page' => 1,
            'per-page' => 5
        ]);
        
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseIsJson();
        
        // Verify pagination parameters
        $I->seeResponseContainsJson([
            'pagination' => [
                'pageSize' => 5
            ]
        ]);
    }

    /**
     * Test GET /v1/organization/organization with search filters
     */
    public function testIndexOrganizationsWithFilters(ApiTester $I)
    {
        $I->wantTo('get filtered list of organizations');
        $I->sendGET($this->baseUrl, [
            'OrganizationSearch[status]' => 1,
            'OrganizationSearch[name]' => 'Test'
        ]);
        
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseIsJson();
    }

    /**
     * Test POST /v1/organization/organization (Create) - Create organization
     */
    public function testCreateOrganization(ApiTester $I)
    {
        $I->wantTo('create a new organization');
        
        $organizationData = [
            'name' => 'Test Organization ' . time(),
            'description' => 'Test Description for API',
            'status' => 1
        ];
        
        $I->sendPOST($this->baseUrl, $organizationData);
        
        $I->seeResponseCodeIs(HttpCode::CREATED);
        $I->seeResponseIsJson();
        
        // Verify response contains created organization data
        $I->seeResponseContainsJson([
            'name' => $organizationData['name'],
            'description' => $organizationData['description'],
            'status' => $organizationData['status']
        ]);
        
        // Save created organization ID for cleanup
        $response = $I->grabResponse();
        $data = json_decode($response, true);
        $I->comment('Created organization ID: ' . $data['id']);
        
        return $data['id'];
    }

    /**
     * Test POST /v1/organization/organization with invalid data
     */
    public function testCreateOrganizationWithInvalidData(ApiTester $I)
    {
        $I->wantTo('fail to create organization with invalid data');
        
        $invalidData = [
            'name' => '', // Empty name should fail
            'description' => 'Test Description',
            'status' => 'invalid' // Invalid status
        ];
        
        $I->sendPOST($this->baseUrl, $invalidData);
        
        $I->seeResponseCodeIs(HttpCode::UNPROCESSABLE_ENTITY);
        $I->seeResponseIsJson();
        
        // Verify validation errors are returned
        $I->seeResponseMatchesJsonType([
            'name' => 'string',
            'message' => 'string',
            'code' => 'integer'
        ]);
    }

    /**
     * Test GET /v1/organization/organization/{id} (View) - View organization
     * @depends testCreateOrganization
     */
    public function testViewOrganization(ApiTester $I, $organizationId)
    {
        $I->wantTo('view specific organization');
        $I->sendGET($this->baseUrl . '/' . $organizationId);
        
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseIsJson();
        
        // Verify response contains organization data
        $I->seeResponseContainsJson([
            'id' => $organizationId
        ]);
        
        $I->seeResponseMatchesJsonType([
            'id' => 'integer',
            'name' => 'string',
            'description' => 'string',
            'status' => 'integer',
            'created_at' => 'string',
            'updated_at' => 'string'
        ]);
    }

    /**
     * Test GET /v1/organization/organization/{id} with non-existent ID
     */
    public function testViewNonExistentOrganization(ApiTester $I)
    {
        $I->wantTo('fail to view non-existent organization');
        $I->sendGET($this->baseUrl . '/99999');
        
        $I->seeResponseCodeIs(HttpCode::NOT_FOUND);
        $I->seeResponseIsJson();
        
        $I->seeResponseMatchesJsonType([
            'name' => 'string',
            'message' => 'string',
            'code' => 'integer',
            'status' => 'integer'
        ]);
    }

    /**
     * Test PUT /v1/organization/organization/{id} (Update) - Update organization
     * @depends testCreateOrganization
     */
    public function testUpdateOrganization(ApiTester $I, $organizationId)
    {
        $I->wantTo('update existing organization');
        
        $updateData = [
            'name' => 'Updated Organization Name',
            'description' => 'Updated Description',
            'status' => 1
        ];
        
        $I->sendPUT($this->baseUrl . '/' . $organizationId, $updateData);
        
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseIsJson();
        
        // Verify response contains updated data
        $I->seeResponseContainsJson([
            'id' => $organizationId,
            'name' => $updateData['name'],
            'description' => $updateData['description'],
            'status' => $updateData['status']
        ]);
    }

    /**
     * Test PUT /v1/organization/organization/{id} with invalid data
     * @depends testCreateOrganization
     */
    public function testUpdateOrganizationWithInvalidData(ApiTester $I, $organizationId)
    {
        $I->wantTo('fail to update organization with invalid data');
        
        $invalidData = [
            'name' => '', // Empty name should fail
            'status' => 'invalid'
        ];
        
        $I->sendPUT($this->baseUrl . '/' . $organizationId, $invalidData);
        
        $I->seeResponseCodeIs(HttpCode::UNPROCESSABLE_ENTITY);
        $I->seeResponseIsJson();
    }

    /**
     * Test PATCH /v1/organization/organization/{id} (Partial Update)
     * @depends testCreateOrganization
     */
    public function testPartialUpdateOrganization(ApiTester $I, $organizationId)
    {
        $I->wantTo('partially update organization');
        
        $patchData = [
            'description' => 'Partially Updated Description'
        ];
        
        $I->sendPATCH($this->baseUrl . '/' . $organizationId, $patchData);
        
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseIsJson();
        
        // Verify only description was updated
        $I->seeResponseContainsJson([
            'id' => $organizationId,
            'description' => $patchData['description']
        ]);
    }

    /**
     * Test DELETE /v1/organization/organization/{id} (Delete) - Soft delete organization
     * @depends testCreateOrganization
     */
    public function testDeleteOrganization(ApiTester $I, $organizationId)
    {
        $I->wantTo('soft delete organization');
        $I->sendDELETE($this->baseUrl . '/' . $organizationId);
        
        $I->seeResponseCodeIs(HttpCode::NO_CONTENT);
        
        // Verify organization is soft deleted (should still exist but with deleted status)
        $I->sendGET($this->baseUrl . '/' . $organizationId);
        $I->seeResponseCodeIs(HttpCode::NOT_FOUND); // Soft deleted items are not accessible
    }

    /**
     * Test DELETE /v1/organization/organization/{id} with non-existent ID
     */
    public function testDeleteNonExistentOrganization(ApiTester $I)
    {
        $I->wantTo('fail to delete non-existent organization');
        $I->sendDELETE($this->baseUrl . '/99999');
        
        $I->seeResponseCodeIs(HttpCode::NOT_FOUND);
        $I->seeResponseIsJson();
    }

    /**
     * Test OPTIONS /v1/organization/organization (Options) - Get allowed methods
     */
    public function testOptionsOrganization(ApiTester $I)
    {
        $I->wantTo('get allowed HTTP methods for organization endpoint');
        $I->sendOPTIONS($this->baseUrl);
        
        $I->seeResponseCodeIs(HttpCode::OK);
        
        // Verify CORS headers are set
        $I->seeHttpHeader('Allow');
        $I->seeHttpHeaderContains('Allow', 'GET');
        $I->seeHttpHeaderContains('Allow', 'POST');
        $I->seeHttpHeaderContains('Allow', 'PUT');
        $I->seeHttpHeaderContains('Allow', 'PATCH');
        $I->seeHttpHeaderContains('Allow', 'DELETE');
        $I->seeHttpHeaderContains('Allow', 'OPTIONS');
    }

    /**
     * Test unauthorized access
     */
    public function testUnauthorizedAccess(ApiTester $I)
    {
        $I->wantTo('fail to access organization endpoint without authentication');
        
        // Remove auth header
        $I->deleteHeader('Authorization');
        
        $I->sendGET($this->baseUrl);
        
        $I->seeResponseCodeIs(HttpCode::UNAUTHORIZED);
        $I->seeResponseIsJson();
        
        $I->seeResponseMatchesJsonType([
            'name' => 'string',
            'message' => 'string',
            'code' => 'integer',
            'status' => 'integer'
        ]);
    }

    /**
     * Test content negotiation
     */
    public function testContentNegotiation(ApiTester $I)
    {
        $I->wantTo('test content negotiation with different Accept headers');
        
        // Test with XML accept header
        $I->haveHttpHeader('Accept', 'application/xml');
        $I->sendGET($this->baseUrl);
        
        // Should still return JSON as it's the default
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseIsJson();
    }

    /**
     * Test rate limiting (if implemented)
     */
    public function testRateLimiting(ApiTester $I)
    {
        $I->wantTo('test rate limiting behavior');
        
        // Make multiple rapid requests
        for ($i = 0; $i < 10; $i++) {
            $I->sendGET($this->baseUrl);
        }
        
        // Should not be rate limited for reasonable number of requests
        $I->seeResponseCodeIs(HttpCode::OK);
    }

    /**
     * Test organization creation with full workflow
     */
    public function testFullOrganizationWorkflow(ApiTester $I)
    {
        $I->wantTo('test complete organization CRUD workflow');
        
        // 1. Create organization
        $organizationData = [
            'name' => 'Workflow Test Organization ' . time(),
            'description' => 'Test workflow description',
            'status' => 1
        ];
        
        $I->sendPOST($this->baseUrl, $organizationData);
        $I->seeResponseCodeIs(HttpCode::CREATED);
        
        $response = $I->grabResponse();
        $createdOrg = json_decode($response, true);
        $orgId = $createdOrg['id'];
        
        // 2. Verify organization was created
        $I->sendGET($this->baseUrl . '/' . $orgId);
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseContainsJson(['name' => $organizationData['name']]);
        
        // 3. Update organization
        $updateData = ['name' => 'Updated Workflow Organization'];
        $I->sendPUT($this->baseUrl . '/' . $orgId, array_merge($organizationData, $updateData));
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseContainsJson($updateData);
        
        // 4. Verify update
        $I->sendGET($this->baseUrl . '/' . $orgId);
        $I->seeResponseCodeIs(HttpCode::OK);
        $I->seeResponseContainsJson($updateData);
        
        // 5. Delete organization
        $I->sendDELETE($this->baseUrl . '/' . $orgId);
        $I->seeResponseCodeIs(HttpCode::NO_CONTENT);
        
        // 6. Verify deletion
        $I->sendGET($this->baseUrl . '/' . $orgId);
        $I->seeResponseCodeIs(HttpCode::NOT_FOUND);
    }
} 