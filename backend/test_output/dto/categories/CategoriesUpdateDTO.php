<?php

namespace xbsoft\blog\dto\categories;

use yii\base\BaseObject;

/**
 * Class CategoriesUpdateDTO
 * DTO for updating Categories model
 */
class CategoriesUpdateDTO extends BaseObject
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