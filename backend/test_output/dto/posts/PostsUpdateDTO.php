<?php

namespace xbsoft\blog\dto\posts;

use yii\base\BaseObject;

/**
 * Class PostsUpdateDTO
 * DTO for updating Posts model
 */
class PostsUpdateDTO extends BaseObject
{
    public $title;
    public $content;
    public $author_id;
    public $category_id;
    public $published_at;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
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
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'title' => 'Title',
            'content' => 'Content',
            'author_id' => 'Author Id',
            'category_id' => 'Category Id',
            'published_at' => 'Published At',
        ];
    }
} 