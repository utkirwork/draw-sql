<?php

namespace xbsoft\organization\models\relation;

use xbsoft\organization\models\OrganizationBoard;
use xbsoft\organization\models\OrganizationDepartment;

/**
 * Trait OrganizationRelationTrait
 * @package xbsoft\organization\models\relation
 */
trait OrganizationRelationTrait
{
    /**
     * Gets query for [[OrganizationBoards]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getOrganizationBoards()
    {
        return $this->hasMany(OrganizationBoard::class, ['organization_id' => 'id']);
    }

    /**
     * Gets query for [[OrganizationDepartments]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getOrganizationDepartments()
    {
        return $this->hasMany(OrganizationDepartment::class, ['organization_id' => 'id']);
    }
} 