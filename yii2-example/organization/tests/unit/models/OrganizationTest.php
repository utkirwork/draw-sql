<?php

namespace xbsoft\organization\tests\unit\models;

use Codeception\Test\Unit;
use xbsoft\organization\models\Organization;
use yii\db\ActiveRecord;

/**
 * Class OrganizationTest
 * Unit tests for Organization model
 */
class OrganizationTest extends Unit
{
    /**
     * @var \UnitTester
     */
    protected $tester;

    /**
     * @var Organization
     */
    protected $organization;

    /**
     * Set up test environment
     */
    protected function _before()
    {
        parent::_before();
        $this->organization = new Organization();
    }

    /**
     * Clean up after each test
     */
    protected function _after()
    {
        parent::_after();
    }

    /**
     * Test that Organization extends ActiveRecord
     */
    public function testOrganizationExtendsActiveRecord()
    {
        $this->assertInstanceOf(ActiveRecord::class, $this->organization);
    }

    /**
     * Test model validation rules
     */
    public function testValidationRules()
    {
        $rules = $this->organization->rules();
        
        // Verify rules exist
        $this->assertIsArray($rules);
        $this->assertNotEmpty($rules);
        
        // Test specific rule types by examining rule structure
        $ruleFields = [];
        foreach ($rules as $rule) {
            if (isset($rule[0]) && is_array($rule[0])) {
                $ruleFields = array_merge($ruleFields, $rule[0]);
            } elseif (isset($rule[0])) {
                $ruleFields[] = $rule[0];
            }
        }
        
        // Verify important fields have rules
        $this->assertContains('name', $ruleFields);
    }

    /**
     * Test model attribute labels
     */
    public function testAttributeLabels()
    {
        $labels = $this->organization->attributeLabels();
        
        $this->assertIsArray($labels);
        
        // Test that important fields have labels
        $this->assertArrayHasKey('name', $labels);
        $this->assertArrayHasKey('description', $labels);
        $this->assertArrayHasKey('status', $labels);
        $this->assertArrayHasKey('created_at', $labels);
        $this->assertArrayHasKey('updated_at', $labels);
    }

    /**
     * Test valid organization creation
     */
    public function testValidOrganizationCreation()
    {
        $this->organization->name = 'Test Organization';
        $this->organization->description = 'Test Description';
        $this->organization->status = 1;
        
        $this->assertTrue($this->organization->validate());
    }

    /**
     * Test organization name is required
     */
    public function testNameIsRequired()
    {
        $this->organization->name = '';
        $this->organization->description = 'Test Description';
        $this->organization->status = 1;
        
        $this->assertFalse($this->organization->validate());
        $this->assertArrayHasKey('name', $this->organization->getErrors());
    }

    /**
     * Test organization name length validation
     */
    public function testNameLengthValidation()
    {
        // Test name too long (assuming max length is 255)
        $this->organization->name = str_repeat('a', 256);
        $this->organization->description = 'Test Description';
        $this->organization->status = 1;
        
        $this->assertFalse($this->organization->validate());
        $this->assertArrayHasKey('name', $this->organization->getErrors());
    }

    /**
     * Test organization description validation
     */
    public function testDescriptionValidation()
    {
        $this->organization->name = 'Test Organization';
        $this->organization->description = 'Valid Description';
        $this->organization->status = 1;
        
        $this->assertTrue($this->organization->validate());
        
        // Test with empty description (should be allowed)
        $this->organization->description = '';
        $this->assertTrue($this->organization->validate());
        
        // Test with null description (should be allowed)
        $this->organization->description = null;
        $this->assertTrue($this->organization->validate());
    }

    /**
     * Test organization status validation
     */
    public function testStatusValidation()
    {
        $this->organization->name = 'Test Organization';
        $this->organization->description = 'Test Description';
        
        // Test valid status values
        $validStatuses = [0, 1];
        foreach ($validStatuses as $status) {
            $this->organization->status = $status;
            $this->assertTrue($this->organization->validate(['status']), "Status {$status} should be valid");
        }
        
        // Test invalid status values
        $invalidStatuses = [-1, 2, 'invalid', null];
        foreach ($invalidStatuses as $status) {
            $this->organization->status = $status;
            $this->assertFalse($this->organization->validate(['status']), "Status {$status} should be invalid");
        }
    }

    /**
     * Test organization table name
     */
    public function testTableName()
    {
        $tableName = Organization::tableName();
        $this->assertEquals('organization', $tableName);
    }

    /**
     * Test organization behaviors (if any)
     */
    public function testBehaviors()
    {
        $behaviors = $this->organization->behaviors();
        $this->assertIsArray($behaviors);
        
        // If TimestampBehavior is used, test it
        if (isset($behaviors['timestamp'])) {
            $this->assertArrayHasKey('timestamp', $behaviors);
        }
        
        // If BlameableBehavior is used, test it
        if (isset($behaviors['blameable'])) {
            $this->assertArrayHasKey('blameable', $behaviors);
        }
    }

    /**
     * Test organization scenarios (if any)
     */
    public function testScenarios()
    {
        $scenarios = $this->organization->scenarios();
        $this->assertIsArray($scenarios);
        $this->assertArrayHasKey('default', $scenarios);
    }

    /**
     * Test organization data serialization
     */
    public function testSerialization()
    {
        $this->organization->name = 'Test Organization';
        $this->organization->description = 'Test Description';
        $this->organization->status = 1;
        
        $data = $this->organization->toArray();
        
        $this->assertIsArray($data);
        $this->assertArrayHasKey('name', $data);
        $this->assertArrayHasKey('description', $data);
        $this->assertArrayHasKey('status', $data);
        
        $this->assertEquals('Test Organization', $data['name']);
        $this->assertEquals('Test Description', $data['description']);
        $this->assertEquals(1, $data['status']);
    }

    /**
     * Test organization field types
     */
    public function testFieldTypes()
    {
        $this->organization->name = 'Test Organization';
        $this->organization->description = 'Test Description';
        $this->organization->status = 1;
        
        // Verify field types after assignment
        $this->assertIsString($this->organization->name);
        $this->assertIsString($this->organization->description);
        $this->assertIsInt($this->organization->status);
    }

    /**
     * Test organization search functionality
     */
    public function testSearchFunctionality()
    {
        // This would test the search model if it exists
        // For now, just verify the model can be used in queries
        $query = Organization::find();
        $this->assertInstanceOf(\yii\db\ActiveQuery::class, $query);
        
        // Test basic query conditions
        $query->where(['status' => 1]);
        $this->assertInstanceOf(\yii\db\ActiveQuery::class, $query);
    }

    /**
     * Test organization constants (if any)
     */
    public function testConstants()
    {
        // Test status constants if they exist
        if (defined('xbsoft\organization\models\Organization::STATUS_ACTIVE')) {
            $this->assertEquals(1, Organization::STATUS_ACTIVE);
        }
        
        if (defined('xbsoft\organization\models\Organization::STATUS_INACTIVE')) {
            $this->assertEquals(0, Organization::STATUS_INACTIVE);
        }
    }
} 