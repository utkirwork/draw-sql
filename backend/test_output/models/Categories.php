<?php

namespace xbsoft\blog\models;

use xbsoft\blog\models\getter\CategoriesGetterTrait;
use xbsoft\blog\models\relation\CategoriesRelationTrait;
use xbsoft\blog\models\scope\CategoriesScopeTrait;
use xbsoft\blog\models\setter\CategoriesSetterTrait;
use xbsoft\blog\models\query\CategoriesQuery;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "categories".
 *
 * @property string $id 
 * @property string $name 
 * @property string $slug 
 */
class Categories extends ActiveRecord
{
    use CategoriesGetterTrait;
    use CategoriesRelationTrait;
    use CategoriesScopeTrait;
    use CategoriesSetterTrait;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'categories';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['id'], 'string'],
            [['name'], 'required'],
            [['name'], 'string'],
            [['slug'], 'required'],
            [['slug'], 'string'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'Id',
            'name' => 'Name',
            'slug' => 'Slug',
        ];
    }

    /**
     * {@inheritdoc}
     * @return CategoriesQuery the active query used by this AR class.
     */
    public static function find(): CategoriesQuery
    {
        return new CategoriesQuery(get_called_class());
    }
} 