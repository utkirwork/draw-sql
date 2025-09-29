<?php

namespace xbsoft\blog\models;

use xbsoft\blog\models\getter\PostsGetterTrait;
use xbsoft\blog\models\relation\PostsRelationTrait;
use xbsoft\blog\models\scope\PostsScopeTrait;
use xbsoft\blog\models\setter\PostsSetterTrait;
use xbsoft\blog\models\query\PostsQuery;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "posts".
 *
 * @property string $id 
 * @property string $title 
 * @property string $content 
 * @property string $author_id 
 * @property string $category_id 
 * @property string $published_at 
 */
class Posts extends ActiveRecord
{
    use PostsGetterTrait;
    use PostsRelationTrait;
    use PostsScopeTrait;
    use PostsSetterTrait;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'posts';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['id'], 'string'],
            [['title'], 'required'],
            [['title'], 'string'],
            [['content'], 'required'],
            [['content'], 'string'],
            [['author_id'], 'required'],
            [['author_id'], 'string'],
            [['category_id'], 'required'],
            [['category_id'], 'string'],
            [['published_at'], 'string'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'Id',
            'title' => 'Title',
            'content' => 'Content',
            'author_id' => 'Author Id',
            'category_id' => 'Category Id',
            'published_at' => 'Published At',
        ];
    }

    /**
     * {@inheritdoc}
     * @return PostsQuery the active query used by this AR class.
     */
    public static function find(): PostsQuery
    {
        return new PostsQuery(get_called_class());
    }
} 