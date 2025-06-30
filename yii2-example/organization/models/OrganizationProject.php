<?php

namespace xbsoft\organization\models;

use xbsoft\organization\models\query\OrganizationProjectQuery;
use xbsoft\project\models\Project;
use xbsoft\organization\models\scope\OrganizationProjectScopeTrait;
use xbsoft\organization\models\relation\OrganizationProjectRelationTrait;
use xbsoft\organization\models\getter\OrganizationProjectGetterTrait;
use xbsoft\organization\models\setter\OrganizationProjectSetterTrait;

/**
 * This is the model class for table "organization_projects".
 *
 * @OA\Schema(
 *     description="Organization-Project relationship model"
 * )
 * @property int $id ID
 * @property int $organization_id Organization ID
 * @property int $project_id Project ID
 * @property int|null $created_by Created By
 * @property int|null $updated_by Updated By
 * @property int $created_at Created At
 * @property int $updated_at Updated At
 * @property int|null $deleted_at Deleted At
 * @property int|null $deleted_by Deleted By
 * @property bool $is_deleted Is Deleted
 * @property int|null $status Status
 *
 * @property Organization $organization
 * @property Project $project
 */
class OrganizationProject extends \yii\db\ActiveRecord
{
    use OrganizationProjectScopeTrait;
    use OrganizationProjectRelationTrait;
    use OrganizationProjectGetterTrait;
    use OrganizationProjectSetterTrait;

    /**
     * @OA\Property(
     *   property="id",
     *   type="integer",
     *   description="ID"
     * )
     */
    /**
     * @OA\Property(
     *   property="organization_id",
     *   type="integer",
     *   description="Organization ID"
     * )
     */
    /**
     * @OA\Property(
     *   property="project_id",
     *   type="integer",
     *   description="Project ID"
     * )
     */
    /**
     * @OA\Property(
     *   property="status",
     *   type="integer",
     *   description="Status (0=Inactive, 1=Active)"
     * )
     */

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'organization.organization_projects';
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\query\OrganizationProjectQuery the active query used by this AR class.
     */
    public static function find(): \xbsoft\organization\models\query\OrganizationProjectQuery
    {
        return (new \xbsoft\organization\models\query\OrganizationProjectQuery(get_called_class()))->isNotDeleted();
    }

    public function fields()
    {
        $fields = parent::fields();
        $fields['project_name'] = function (self $model) {
            return $model->project ? $model->project->name : null;
        };
        return $fields;
    }
} 