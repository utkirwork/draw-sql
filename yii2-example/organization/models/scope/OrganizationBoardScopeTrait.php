<?php

namespace xbsoft\organization\models\scope;

use yii\behaviors\BlameableBehavior;
use yii\behaviors\TimestampBehavior;
use yii\helpers\ArrayHelper;
use yii2tech\ar\softdelete\SoftDeleteBehavior;

/**
 * This is the Scope Trait class for [[\xbsoft\organization\models\OrganizationBoard]].
 *
 * @see \xbsoft\organization\models\OrganizationBoard
 */
trait OrganizationBoardScopeTrait
{
    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['organization_id', 'board_id'], 'required'],
            [['organization_id', 'board_id', 'created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at', 'deleted_by', 'status'], 'integer'],
            [['is_deleted'], 'boolean'],
            [['organization_id', 'board_id'], 'unique', 'targetAttribute' => ['organization_id', 'board_id'], 'message' => 'This board is already assigned to this organization.'],
            [['status'], 'in', 'range' => [0, 1]], // 0=Inactive, 1=Active
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
            'organization_id' => 'Organization ID',
            'board_id' => 'Board ID',
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