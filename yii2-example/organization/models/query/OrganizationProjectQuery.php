<?php

namespace xbsoft\organization\models\query;

use common\models\query\DefaultEntityQueryTrait;

/**
 * This is the ActiveQuery class for [[\xbsoft\organization\models\OrganizationProject]].
 *
 * @see \xbsoft\organization\models\OrganizationProject
 */
class OrganizationProjectQuery extends \yii\db\ActiveQuery
{
    use DefaultEntityQueryTrait;

    public function organizationId($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[organization_id]]' => $value]);
    }

    public function projectId($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[project_id]]' => $value]);
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\OrganizationProject[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\OrganizationProject|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
} 