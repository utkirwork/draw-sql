<?php

namespace xbsoft\organization\tests\unit\models;

use Codeception\Test\Unit;
use xbsoft\organization\models\search\OrganizationSearch;
use xbsoft\organization\models\Organization;
use yii\data\ActiveDataProvider;

/**
 * Class OrganizationSearchTest
 * Unit tests for Organization Search model
 */
class OrganizationSearchTest extends Unit
{
    /**
     * @var \UnitTester
     */
    protected $tester;

    /**
     * @var OrganizationSearch
     */
    protected $searchModel;

    /**
     * Set up test environment
     */
    protected function _before()
    {
        parent::_before();
        $this->searchModel = new OrganizationSearch();
    }

    /**
     * Clean up after each test
     */
    protected function _after()
    {
        parent::_after();
    }

    /**
     * Test that OrganizationSearch extends Organization
     */
    public function testOrganizationSearchExtendsOrganization()
    {
        $this->assertInstanceOf(Organization::class, $this->searchModel);
    }

    /**
     * Test search rules
     */
    public function testSearchRules()
    {
        $rules = $this->searchModel->rules();
        
        $this->assertIsArray($rules);
        
        // Extract all fields from rules
        $ruleFields = [];
        foreach ($rules as $rule) {
            if (isset($rule[0]) && is_array($rule[0])) {
                $ruleFields = array_merge($ruleFields, $rule[0]);
            } elseif (isset($rule[0])) {
                $ruleFields[] = $rule[0];
            }
        }
        
        // Check that search fields are present
        $this->assertContains('name', $ruleFields);
        $this->assertContains('status', $ruleFields);
    }

    /**
     * Test search scenarios
     */
    public function testSearchScenarios()
    {
        $scenarios = $this->searchModel->scenarios();
        
        $this->assertIsArray($scenarios);
        $this->assertArrayHasKey('default', $scenarios);
        
        // Check that search scenario includes searchable fields
        $searchFields = $scenarios['default'];
        $this->assertContains('name', $searchFields);
        $this->assertContains('description', $searchFields);
        $this->assertContains('status', $searchFields);
    }

    /**
     * Test search method returns ActiveDataProvider
     */
    public function testSearchReturnsActiveDataProvider()
    {
        $params = [];
        $dataProvider = $this->searchModel->search($params);
        
        $this->assertInstanceOf(ActiveDataProvider::class, $dataProvider);
    }

    /**
     * Test search method with empty parameters
     */
    public function testSearchWithEmptyParameters()
    {
        $params = [];
        $dataProvider = $this->searchModel->search($params);
        
        $this->assertInstanceOf(ActiveDataProvider::class, $dataProvider);
        
        $query = $dataProvider->query;
        $this->assertInstanceOf(\yii\db\ActiveQuery::class, $query);
    }

    /**
     * Test search method with name filter
     */
    public function testSearchWithNameFilter()
    {
        $params = [
            'OrganizationSearch' => [
                'name' => 'Test Organization'
            ]
        ];
        
        $dataProvider = $this->searchModel->search($params);
        
        $this->assertInstanceOf(ActiveDataProvider::class, $dataProvider);
        
        // Verify that search model loaded the parameters
        $this->assertEquals('Test Organization', $this->searchModel->name);
    }

    /**
     * Test search method with status filter
     */
    public function testSearchWithStatusFilter()
    {
        $params = [
            'OrganizationSearch' => [
                'status' => 1
            ]
        ];
        
        $dataProvider = $this->searchModel->search($params);
        
        $this->assertInstanceOf(ActiveDataProvider::class, $dataProvider);
        
        // Verify that search model loaded the parameters
        $this->assertEquals(1, $this->searchModel->status);
    }

    /**
     * Test search method with description filter
     */
    public function testSearchWithDescriptionFilter()
    {
        $params = [
            'OrganizationSearch' => [
                'description' => 'Test Description'
            ]
        ];
        
        $dataProvider = $this->searchModel->search($params);
        
        $this->assertInstanceOf(ActiveDataProvider::class, $dataProvider);
        
        // Verify that search model loaded the parameters
        $this->assertEquals('Test Description', $this->searchModel->description);
    }

    /**
     * Test search method with multiple filters
     */
    public function testSearchWithMultipleFilters()
    {
        $params = [
            'OrganizationSearch' => [
                'name' => 'Test Organization',
                'status' => 1,
                'description' => 'Test Description'
            ]
        ];
        
        $dataProvider = $this->searchModel->search($params);
        
        $this->assertInstanceOf(ActiveDataProvider::class, $dataProvider);
        
        // Verify that search model loaded all parameters
        $this->assertEquals('Test Organization', $this->searchModel->name);
        $this->assertEquals(1, $this->searchModel->status);
        $this->assertEquals('Test Description', $this->searchModel->description);
    }

    /**
     * Test search method with invalid parameters
     */
    public function testSearchWithInvalidParameters()
    {
        $params = [
            'OrganizationSearch' => [
                'invalid_field' => 'invalid_value',
                'status' => 'invalid_status'
            ]
        ];
        
        $dataProvider = $this->searchModel->search($params);
        
        $this->assertInstanceOf(ActiveDataProvider::class, $dataProvider);
        
        // Invalid fields should not be loaded
        $this->assertNull($this->searchModel->getAttribute('invalid_field'));
    }

    /**
     * Test search method with date range filters (if supported)
     */
    public function testSearchWithDateFilters()
    {
        $params = [
            'OrganizationSearch' => [
                'created_at' => '2023-01-01'
            ]
        ];
        
        $dataProvider = $this->searchModel->search($params);
        
        $this->assertInstanceOf(ActiveDataProvider::class, $dataProvider);
    }

    /**
     * Test search validation
     */
    public function testSearchValidation()
    {
        // Test with valid search parameters
        $this->searchModel->name = 'Valid Name';
        $this->searchModel->status = 1;
        $this->searchModel->description = 'Valid Description';
        
        $this->assertTrue($this->searchModel->validate());
        
        // Test with invalid status
        $this->searchModel->status = 'invalid';
        $this->assertFalse($this->searchModel->validate(['status']));
    }

    /**
     * Test search pagination
     */
    public function testSearchPagination()
    {
        $params = [
            'page' => 1,
            'per-page' => 10
        ];
        
        $dataProvider = $this->searchModel->search([]);
        
        // Set pagination parameters
        $dataProvider->pagination->page = $params['page'] - 1; // 0-based
        $dataProvider->pagination->pageSize = $params['per-page'];
        
        $this->assertEquals($params['per-page'], $dataProvider->pagination->pageSize);
        $this->assertEquals($params['page'] - 1, $dataProvider->pagination->page);
    }

    /**
     * Test search sorting
     */
    public function testSearchSorting()
    {
        $dataProvider = $this->searchModel->search([]);
        
        // Test that sort is configured
        $sort = $dataProvider->sort;
        $this->assertInstanceOf(\yii\data\Sort::class, $sort);
        
        // Test default sort attributes
        $sortAttributes = $sort->attributes;
        $this->assertArrayHasKey('name', $sortAttributes);
        $this->assertArrayHasKey('status', $sortAttributes);
        $this->assertArrayHasKey('created_at', $sortAttributes);
        $this->assertArrayHasKey('updated_at', $sortAttributes);
    }

    /**
     * Test search query building
     */
    public function testSearchQueryBuilding()
    {
        $params = [
            'OrganizationSearch' => [
                'name' => 'Test',
                'status' => 1
            ]
        ];
        
        $dataProvider = $this->searchModel->search($params);
        $query = $dataProvider->query;
        
        $this->assertInstanceOf(\yii\db\ActiveQuery::class, $query);
        
        // Verify the query has the correct model class
        $this->assertEquals(Organization::class, $query->modelClass);
    }

    /**
     * Test attribute labels in search model
     */
    public function testSearchAttributeLabels()
    {
        $labels = $this->searchModel->attributeLabels();
        
        $this->assertIsArray($labels);
        $this->assertArrayHasKey('name', $labels);
        $this->assertArrayHasKey('description', $labels);
        $this->assertArrayHasKey('status', $labels);
    }
} 