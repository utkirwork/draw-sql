<?php

namespace xbsoft\blog\models\query;

/**
 * This is the ActiveQuery class for [[xbsoft\blog\models\Posts]].
 *
 * @see xbsoft\blog\models\Posts
 */
class PostsQuery extends \yii\db\ActiveQuery
{
    public function title($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[title]]' => $value]);
    }

    public function content($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[content]]' => $value]);
    }

    public function author_id($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[author_id]]' => $value]);
    }

    public function category_id($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[category_id]]' => $value]);
    }

    public function published_at($value): self
    {
        return $this->andWhere([$this->getTableName() . '.[[published_at]]' => $value]);
    }

    /**
     * {@inheritdoc}
     * @return xbsoft\blog\models\Posts[]|array
     */
    public function all($db = null)
    {
        return parent::all($db);
    }

    /**
     * {@inheritdoc}
     * @return xbsoft\blog\models\Posts|array|null
     */
    public function one($db = null)
    {
        return parent::one($db);
    }
} 