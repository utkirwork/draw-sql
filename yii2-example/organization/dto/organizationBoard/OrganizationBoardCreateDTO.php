<?php

namespace xbsoft\organization\dto\organizationBoard;

use yii\base\Model;

/**
 * Class OrganizationBoardCreateDTO
 * @package xbsoft\organization\dto\organizationBoard
 */
class OrganizationBoardCreateDTO extends Model
{
    public $organization_id;
    public $board_id;
    public $status;

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['organization_id', 'board_id'], 'required'],
            [['organization_id', 'board_id', 'status'], 'integer'],
            [['status'], 'in', 'range' => [0, 1]], // 0=Inactive, 1=Active
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'organization_id' => 'Organization ID',
            'board_id' => 'Board ID',
            'status' => 'Status',
        ];
    }
} 