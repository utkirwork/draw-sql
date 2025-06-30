<?php

namespace xbsoft\organization\modules\api\forms;

use yii\base\Model;

/**
 * Unassign Boards Form
 * 
 * @OA\Schema(
 *     schema="UnassignBoardsForm",
 *     type="object",
 *     title="Unassign Boards Form",
 *     description="Form for unassigning boards from organization",
 *     required={"board_ids"}
 * )
 */
class UnassignBoardsForm extends Model
{
    /**
     * @OA\Property(
     *     property="board_ids",
     *     type="array",
     *     description="Array of board IDs to unassign",
     *     @OA\Items(type="integer"),
     *     example={1, 2, 3}
     * )
     */
    public $board_ids;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['board_ids'], 'required'],
            [['board_ids'], 'each', 'rule' => ['integer', 'min' => 1]],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'board_ids' => 'Board IDs',
        ];
    }
} 