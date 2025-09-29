<?php

namespace xbsoft\blog\models\query;

/**
 * This is the ActiveQuery class for [[xbsoft\blog\models\Users]].
 *
 * @see xbsoft\blog\models\Users
 */
class UsersQuery extends \yii\db\ActiveQuery
{
    public function username($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[username]]' => $value]);
    }

    public function email($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[email]]' => $value]);
    }

    public function password_hash($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[password_hash]]' => $value]);
    }

    public function role($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[role]]' => $value]);
    }

    /**
     * {@inheritdoc}
     * @return xbsoft\blog\models\Users[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * {@inheritdoc}
     * @return xbsoft\blog\models\Users|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
} 