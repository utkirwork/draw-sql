<?php

namespace xbsoft\organization\models\query;

use common\models\query\DefaultEntityQueryTrait;

/**
 * This is the ActiveQuery class for [[\xbsoft\organization\models\Organization]].
 *
 * @see \xbsoft\organization\models\Organization
 */
class OrganizationQuery extends \yii\db\ActiveQuery
{
    use DefaultEntityQueryTrait;

    public function title($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[title]]' => $value]);
    }

    public function description($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[description]]' => $value]);
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\Organization[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\Organization|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
} 