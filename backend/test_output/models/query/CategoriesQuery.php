<?php

namespace xbsoft\blog\models\query;

/**
 * This is the ActiveQuery class for [[xbsoft\blog\models\Categories]].
 *
 * @see xbsoft\blog\models\Categories
 */
class CategoriesQuery extends \yii\db\ActiveQuery
{
    public function name($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[name]]' => $value]);
    }

    public function slug($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[slug]]' => $value]);
    }

    /**
     * {@inheritdoc}
     * @return xbsoft\blog\models\Categories[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * {@inheritdoc}
     * @return xbsoft\blog\models\Categories|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
} 