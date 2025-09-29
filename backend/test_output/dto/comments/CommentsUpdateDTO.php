<?php

namespace xbsoft\blog\dto\comments;

use yii\base\BaseObject;

/**
 * Class CommentsUpdateDTO
 * DTO for updating Comments model
 */
class CommentsUpdateDTO extends BaseObject
{
    public $post_id;
    public $author_id;
    public $content;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['post_id'], 'required'],
            [['post_id'], 'string'],
            [['author_id'], 'required'],
            [['author_id'], 'string'],
            [['content'], 'required'],
            [['content'], 'string'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'post_id' => 'Post Id',
            'author_id' => 'Author Id',
            'content' => 'Content',
        ];
    }
} 