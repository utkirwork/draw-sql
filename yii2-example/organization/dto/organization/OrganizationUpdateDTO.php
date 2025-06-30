<?php

namespace xbsoft\organization\dto\organization;

use yii\base\Model;

/**
 * Class OrganizationUpdateDTO
 * @package xbsoft\organization\dto\organization
 */
class OrganizationUpdateDTO extends Model
{
    public $title;
    public $description;
    public $status;

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['title'], 'required'],
            [['description'], 'string'],
            [['status'], 'integer'],
            [['title'], 'string', 'max' => 255],
            [['status'], 'in', 'range' => [0, 1, 2]], // 0=Inactive, 1=Active, 2=Suspended
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'title' => 'Organization Title',
            'description' => 'Description',
            'status' => 'Status',
        ];
    }
} 