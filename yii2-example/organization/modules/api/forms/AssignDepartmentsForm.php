<?php

namespace xbsoft\organization\modules\api\forms;

use yii\base\Model;

/**
 * Assign Departments Form
 * 
 * @OA\Schema(
 *     schema="AssignDepartmentsForm",
 *     type="object",
 *     title="Assign Departments Form",
 *     description="Form for assigning departments to organization",
 *     required={"department_ids"}
 * )
 */
class AssignDepartmentsForm extends Model
{
    /**
     * @OA\Property(
     *     property="department_ids",
     *     oneOf={
     *         @OA\Schema(type="array", @OA\Items(type="integer")),
     *         @OA\Schema(type="string", description="Comma-separated department IDs", example="1,2,3")
     *     },
     *     description="Array of department IDs or comma-separated string",
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
            [['department_ids'], 'prepareDepartmentIds'],
            [['department_ids'], 'each', 'rule' => ['integer', 'min' => 1]],
            [['department_ids'], 'validateDepartmentsExist'],
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

    /**
     * Prepare department IDs - convert string to array if needed
     */
    public function prepareDepartmentIds($attribute, $params)
    {
        if (is_string($this->department_ids)) {
            // Convert comma-separated string to array
            $this->department_ids = array_map('trim', explode(',', $this->department_ids));
            // Remove empty values
            $this->department_ids = array_filter($this->department_ids, function($value) {
                return $value !== '';
            });
            // Convert to integers
            $this->department_ids = array_map('intval', $this->department_ids);
        }
    }

    /**
     * Validate that departments exist
     */
    public function validateDepartmentsExist($attribute, $params)
    {
        if (!empty($this->department_ids)) {
            $departmentRepository = \Yii::$container->get(\xbsoft\employee\repository\DepartmentRepository::class);
            
            foreach ($this->department_ids as $departmentId) {
                $department = $departmentRepository->getById($departmentId);
                if (!$department) {
                    $this->addError($attribute, "Department with ID {$departmentId} does not exist.");
                    break;
                }
            }
        }
    }
} 