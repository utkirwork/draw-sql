<?php

namespace xbsoft\organization\models\query;

use common\models\query\DefaultEntityQueryTrait;

/**
 * This is the ActiveQuery class for [[\xbsoft\organization\models\OrganizationBoard]].
 *
 * @see \xbsoft\organization\models\OrganizationBoard
 */
class OrganizationBoardQuery extends \yii\db\ActiveQuery
{
    use DefaultEntityQueryTrait;

    public function organizationId($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[organization_id]]' => $value]);
    }

    public function boardId($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[board_id]]' => $value]);
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\OrganizationBoard[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\OrganizationBoard|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
} 