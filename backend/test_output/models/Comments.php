<?php

namespace xbsoft\blog\models;

use xbsoft\blog\models\getter\CommentsGetterTrait;
use xbsoft\blog\models\relation\CommentsRelationTrait;
use xbsoft\blog\models\scope\CommentsScopeTrait;
use xbsoft\blog\models\setter\CommentsSetterTrait;
use xbsoft\blog\models\query\CommentsQuery;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "comments".
 *
 * @property string $id 
 * @property string $post_id 
 * @property string $author_id 
 * @property string $content 
 * @property string $created_at 
 */
class Comments extends ActiveRecord
{
    use CommentsGetterTrait;
    use CommentsRelationTrait;
    use CommentsScopeTrait;
    use CommentsSetterTrait;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'comments';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['id'], 'string'],
            [['post_id'], 'required'],
            [['post_id'], 'string'],
            [['author_id'], 'required'],
            [['author_id'], 'string'],
            [['content'], 'required'],
            [['content'], 'string'],
            [['created_at'], 'required'],
            [['created_at'], 'string'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'Id',
            'post_id' => 'Post Id',
            'author_id' => 'Author Id',
            'content' => 'Content',
            'created_at' => 'Created At',
        ];
    }

    /**
     * {@inheritdoc}
     * @return CommentsQuery the active query used by this AR class.
     */
    public static function find(): CommentsQuery
    {
        return new CommentsQuery(get_called_class());
    }
} 