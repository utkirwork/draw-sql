<?php

namespace xbsoft\organization\models;

use xbsoft\organization\models\scope\OrganizationDepartmentScopeTrait;
use xbsoft\organization\models\relation\OrganizationDepartmentRelationTrait;
use xbsoft\organization\models\getter\OrganizationDepartmentGetterTrait;
use xbsoft\organization\models\setter\OrganizationDepartmentSetterTrait;

/**
 * This is the model class for table "organization.organization_departments".
 *
 * @OA\Schema(
 *     description="Organization-Department relationship model"
 * )
 * @property int $id ID
 * @property int $organization_id Organization ID
 * @property int $department_id Department ID
 * @property int|null $created_by Created By
 * @property int|null $updated_by Updated By
 * @property int $created_at Created At
 * @property int $updated_at Updated At
 * @property int|null $deleted_at Deleted At
 * @property int|null $deleted_by Deleted By
 * @property bool $is_deleted Is Deleted
 * @property int|null $status Status
 */
class OrganizationDepartment extends \yii\db\ActiveRecord
{
    use OrganizationDepartmentScopeTrait;
    use OrganizationDepartmentRelationTrait;
    use OrganizationDepartmentGetterTrait;
    use OrganizationDepartmentSetterTrait;

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
     *   property="department_id",
     *   type="integer",
     *   description="Department ID"
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
        return 'organization.organization_departments';
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\query\OrganizationDepartmentQuery the active query used by this AR class.
     */
    public static function find(): \xbsoft\organization\models\query\OrganizationDepartmentQuery
    {
        return (new \xbsoft\organization\models\query\OrganizationDepartmentQuery(get_called_class()))->isNotDeleted();
    }

    public function fields()
    {
        $fields = parent::fields();
        $fields['department_name'] = function (self $model) {
            return $model->department ? $model->department->name : null;
        };
        return $fields;
    }
} 