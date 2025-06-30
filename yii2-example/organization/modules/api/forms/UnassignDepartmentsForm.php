<?php

namespace xbsoft\organization\modules\api\forms;

use yii\base\Model;

/**
 * Unassign Departments Form
 * 
 * @OA\Schema(
 *     schema="UnassignDepartmentsForm",
 *     type="object",
 *     title="Unassign Departments Form",
 *     description="Form for unassigning departments from organization",
 *     required={"department_ids"}
 * )
 */
class UnassignDepartmentsForm extends Model
{
    /**
     * @OA\Property(
     *     property="department_ids",
     *     type="array",
     *     description="Array of department IDs to unassign",
     *     @OA\Items(type="integer"),
     *     example={1, 2, 3}
     * )
     */
    public $department_ids;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['department_ids'], 'required'],
            [['department_ids'], 'each', 'rule' => ['integer', 'min' => 1]],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'department_ids' => 'Department IDs',
        ];
    }
} 