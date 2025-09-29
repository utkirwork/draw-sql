<?php

namespace xbsoft\blog\dto\categories;

use yii\base\BaseObject;

/**
 * Class CategoriesCreateDTO
 * DTO for creating Categories model
 */
class CategoriesCreateDTO extends BaseObject
{
    public $name;
    public $slug;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['name'], 'string'],
            [['slug'], 'required'],
            [['slug'], 'string'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'name' => 'Name',
            'slug' => 'Slug',
        ];
    }
} 