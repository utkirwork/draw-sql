<?php

namespace xbsoft\organization\modules\api\forms;

use yii\base\Model;

/**
 * Assign Projects Form
 * 
 * @OA\Schema(
 *     schema="AssignProjectsForm",
 *     type="object",
 *     title="Assign Projects Form",
 *     description="Form for assigning projects to organization",
 *     required={"project_ids"}
 * )
 */
class AssignProjectsForm extends Model
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
            [['project_ids'], 'validateProjectsExist'],
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

    /**
     * Validate that projects exist
     */
    public function validateProjectsExist($attribute, $params)
    {
        if (!empty($this->project_ids)) {
            $projectRepository = \Yii::$container->get(\xbsoft\project\repository\ProjectRepository::class);
            
            foreach ($this->project_ids as $projectId) {
                $project = $projectRepository->getById($projectId);
                if (!$project) {
                    $this->addError($attribute, "Project with ID {$projectId} does not exist.");
                    break;
                }
            }
        }
    }
} 