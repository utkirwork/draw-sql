<?php

namespace xbsoft\organization\modules\api\forms;

use yii\base\Model;

/**
 * Unassign Projects Form
 * 
 * @OA\Schema(
 *     schema="UnassignProjectsForm",
 *     type="object",
 *     title="Unassign Projects Form",
 *     description="Form for unassigning projects from organization",
 *     required={"project_ids"}
 * )
 */
class UnassignProjectsForm extends Model
{
    /**
     * @OA\Property(
     *     property="project_ids",
     *     oneOf={
     *         @OA\Schema(type="array", @OA\Items(type="integer")),
     *         @OA\Schema(type="string", description="Comma-separated project IDs", example="1,2,3")
     *     },
     *     description="Array of project IDs or comma-separated string",
     *     example={1, 2, 3}
     * )
     */
    public $project_ids;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['project_ids'], 'required'],
            [['project_ids'], 'prepareProjectIds'],
            [['project_ids'], 'each', 'rule' => ['integer', 'min' => 1]],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'project_ids' => 'Project IDs',
        ];
    }

    /**
     * Prepare project IDs - convert string to array if needed
     */
    public function prepareProjectIds($attribute, $params)
    {
        if (is_string($this->project_ids)) {
            // Convert comma-separated string to array
            $this->project_ids = array_map('trim', explode(',', $this->project_ids));
            // Remove empty values
            $this->project_ids = array_filter($this->project_ids, function($value) {
                return $value !== '';
            });
            // Convert to integers
            $this->project_ids = array_map('intval', $this->project_ids);
        }
    }
} 