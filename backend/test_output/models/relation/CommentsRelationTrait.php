<?php

namespace xbsoft\blog\models\relation;

use xbsoft\blog\models\Posts;
use xbsoft\blog\models\Users;

/**
 * Trait CommentsRelationTrait
 * @package xbsoft\blog\models\relation
 */
trait CommentsRelationTrait
{
    /**
     * Gets query for [[Postses]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getPostses()
    {
        return $this->hasOne(Posts::class, ['post_id' => 'id']);
    }

    /**
     * Gets query for [[Userses]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getUserses()
    {
        return $this->hasOne(Users::class, ['author_id' => 'id']);
    }

} 