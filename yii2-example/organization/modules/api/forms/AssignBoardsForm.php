<?php

namespace xbsoft\organization\modules\api\forms;

use yii\base\Model;

/**
 * Assign Boards Form
 * 
 * @OA\Schema(
 *     schema="AssignBoardsForm",
 *     type="object",
 *     title="Assign Boards Form",
 *     description="Form for assigning boards to organization",
 *     required={"board_ids"}
 * )
 */
class AssignBoardsForm extends Model
{
    /**
     * @OA\Property(
     *     property="board_ids",
     *     oneOf={
     *         @OA\Schema(type="array", @OA\Items(type="integer")),
     *         @OA\Schema(type="string", description="Comma-separated board IDs", example="1,2,3")
     *     },
     *     description="Array of board IDs or comma-separated string",
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
            [['board_ids'], 'prepareBoardIds'],
            [['board_ids'], 'each', 'rule' => ['integer', 'min' => 1]],
            [['board_ids'], 'validateBoardsExist'],
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

    /**
     * Prepare board IDs - convert string to array if needed
     */
    public function prepareBoardIds($attribute, $params)
    {
        if (is_string($this->board_ids)) {
            // Convert comma-separated string to array
            $this->board_ids = array_map('trim', explode(',', $this->board_ids));
            // Remove empty values
            $this->board_ids = array_filter($this->board_ids, function($value) {
                return $value !== '';
            });
            // Convert to integers
            $this->board_ids = array_map('intval', $this->board_ids);
        }
    }

    /**
     * Validate that boards exist
     */
    public function validateBoardsExist($attribute, $params)
    {
        if (!empty($this->board_ids)) {
            $boardRepository = \Yii::$container->get(\xbsoft\board\repository\BoardRepository::class);
            
            foreach ($this->board_ids as $boardId) {
                $board = $boardRepository->getById($boardId);
                if (!$board) {
                    $this->addError($attribute, "Board with ID {$boardId} does not exist.");
                    break;
                }
            }
        }
    }
} 