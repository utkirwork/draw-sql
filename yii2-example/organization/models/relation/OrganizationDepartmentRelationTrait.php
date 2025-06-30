<?php

namespace xbsoft\organization\models\relation;

use xbsoft\organization\models\Organization;
use xbsoft\employee\models\Department;

/**
 * This is the Relation Trait class for [[\xbsoft\organization\models\OrganizationDepartment]].
 *
 * @see \xbsoft\organization\models\OrganizationDepartment
 */
trait OrganizationDepartmentRelationTrait
{
    /**
     * Gets query for [[Organization]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getOrganization()
    {
        return $this->hasOne(Organization::class, ['id' => 'organization_id']);
    }

    /**
     * Gets query for [[Department]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getDepartment()
    {
        return $this->hasOne(Department::class, ['id' => 'department_id']);
    }
} 