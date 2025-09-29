<?php

namespace xbsoft\blog\models\relation;

use xbsoft\blog\models\Users;
use xbsoft\blog\models\Categories;

/**
 * Trait PostsRelationTrait
 * @package xbsoft\blog\models\relation
 */
trait PostsRelationTrait
{
    /**
     * Gets query for [[Userses]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getUserses()
    {
        return $this->hasOne(Users::class, ['author_id' => 'id']);
    }

    /**
     * Gets query for [[Categorieses]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getCategorieses()
    {
        return $this->hasOne(Categories::class, ['category_id' => 'id']);
    }

} 