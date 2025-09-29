<?php

namespace xbsoft\blog\models\query;

/**
 * This is the ActiveQuery class for [[xbsoft\blog\models\Comments]].
 *
 * @see xbsoft\blog\models\Comments
 */
class CommentsQuery extends \yii\db\ActiveQuery
{
    public function post_id($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[post_id]]' => $value]);
    }

    public function author_id($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[author_id]]' => $value]);
    }

    public function content($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[content]]' => $value]);
    }

    public function created_at($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[created_at]]' => $value]);
    }

    /**
     * {@inheritdoc}
     * @return xbsoft\blog\models\Comments[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * {@inheritdoc}
     * @return xbsoft\blog\models\Comments|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
} 