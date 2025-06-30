<?php

namespace xbsoft\organization\models\query;

use common\models\query\DefaultEntityQueryTrait;

/**
 * This is the ActiveQuery class for [[\xbsoft\organization\models\OrganizationDepartment]].
 *
 * @see \xbsoft\organization\models\OrganizationDepartment
 */
class OrganizationDepartmentQuery extends \yii\db\ActiveQuery
{
    use DefaultEntityQueryTrait;

    public function organizationId($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[organization_id]]' => $value]);
    }

    public function departmentId($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[department_id]]' => $value]);
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\OrganizationDepartment[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\OrganizationDepartment|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
} 