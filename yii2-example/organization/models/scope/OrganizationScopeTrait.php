<?php

namespace xbsoft\organization\models\scope;

use yii\behaviors\BlameableBehavior;
use yii\behaviors\TimestampBehavior;
use yii\helpers\ArrayHelper;
use yii2tech\ar\softdelete\SoftDeleteBehavior;

/**
 * This is the Scope Trait class for [[\xbsoft\organization\models\Organization]].
 *
 * @see \xbsoft\organization\models\Organization
 */
trait OrganizationScopeTrait
{
    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['title'], 'required'],
            [['description'], 'string'],
            [['created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at', 'deleted_by', 'status'], 'default', 'value' => null],
            [['created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at', 'deleted_by', 'status'], 'integer'],
            [['is_deleted'], 'boolean'],
            [['title'], 'string', 'max' => 255],
            [['title'], 'unique', 'targetAttribute' => ['title'], 'message' => 'This organization title has already been taken.'],
            [['status'], 'in', 'range' => [0, 1, 2]], // 0=Inactive, 1=Active, 2=Suspended
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'time' => [
                'class' => TimestampBehavior::class,
            ],
            'by' => [
                'class' => BlameableBehavior::class
            ],
            'delete' => [
                'class' => SoftDeleteBehavior::className(),
                'softDeleteAttributeValues' => [
                    'is_deleted' => true,
                    'deleted_at' => time(),
                    'deleted_by' => \Yii::$app->user->id ?? null
                ],
                'replaceRegularDelete' => true
            ],
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'title' => 'Organization Title',
            'description' => 'Description',
            'created_by' => 'Created By',
            'updated_by' => 'Updated By',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
            'deleted_at' => 'Deleted At',
            'deleted_by' => 'Deleted By',
            'is_deleted' => 'Is Deleted',
            'status' => 'Status',
        ];
    }
} 