<?php

namespace xbsoft\organization\dto\organizationDepartment;

use yii\base\Model;

/**
 * Class OrganizationDepartmentCreateDTO
 * @package xbsoft\organization\dto\organizationDepartment
 */
class OrganizationDepartmentCreateDTO extends Model
{
    public $organization_id;
    public $department_id;
    public $status;

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['organization_id', 'department_id'], 'required'],
            [['organization_id', 'department_id', 'status'], 'integer'],
            [['status'], 'in', 'range' => [0, 1]], // 0=Inactive, 1=Active
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'organization_id' => 'Organization ID',
            'department_id' => 'Department ID',
            'status' => 'Status',
        ];
    }
} 