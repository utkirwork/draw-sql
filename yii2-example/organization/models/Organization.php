<?php

namespace xbsoft\organization\models;

use xbsoft\organization\models\scope\OrganizationScopeTrait;
use xbsoft\organization\models\relation\OrganizationRelationTrait;
use xbsoft\organization\models\getter\OrganizationGetterTrait;
use xbsoft\organization\models\setter\OrganizationSetterTrait;

/**
 * This is the model class for table "organization.organizations".
 *
 * @OA\Schema(
 *     description="Organization model representing a business organization"
 * )
 * @property int $id ID
 * @property string $title Organization Title
 * @property string|null $description Organization Description
 * @property int|null $created_by Created By
 * @property int|null $updated_by Updated By
 * @property int $created_at Created At
 * @property int $updated_at Updated At
 * @property int|null $deleted_at Deleted At
 * @property int|null $deleted_by Deleted By
 * @property bool $is_deleted Is Deleted
 * @property int|null $status Status
 */
class Organization extends \yii\db\ActiveRecord
{
    use OrganizationScopeTrait;
    use OrganizationRelationTrait;
    use OrganizationGetterTrait;
    use OrganizationSetterTrait;

    /**
     * @OA\Property(
     *   property="id",
     *   type="integer",
     *   description="Organization ID"
     * )
     */
    /**
     * @OA\Property(
     *   property="title",
     *   type="string",
     *   description="Organization Title"
     * )
     */
    /**
     * @OA\Property(
     *   property="description",
     *   type="string",
     *   description="Organization Description"
     * )
     */
    /**
     * @OA\Property(
     *   property="created_by",
     *   type="integer",
     *   description="Created By"
     * )
     */
    /**
     * @OA\Property(
     *   property="updated_by",
     *   type="integer",
     *   description="Updated By"
     * )
     */
    /**
     * @OA\Property(
     *   property="created_at",
     *   type="integer",
     *   description="Created At"
     * )
     */
    /**
     * @OA\Property(
     *   property="updated_at",
     *   type="integer",
     *   description="Updated At"
     * )
     */
    /**
     * @OA\Property(
     *   property="deleted_at",
     *   type="integer",
     *   description="Deleted At"
     * )
     */
    /**
     * @OA\Property(
     *   property="deleted_by",
     *   type="integer",
     *   description="Deleted By"
     * )
     */
    /**
     * @OA\Property(
     *   property="is_deleted",
     *   type="boolean",
     *   description="Is Deleted"
     * )
     */
    /**
     * @OA\Property(
     *   property="status",
     *   type="integer",
     *   description="Status (0=Inactive, 1=Active, 2=Suspended)"
     * )
     */

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'organization.organizations';
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\query\OrganizationQuery the active query used by this AR class.
     */
    public static function find(): \xbsoft\organization\models\query\OrganizationQuery
    {
        return new \xbsoft\organization\models\query\OrganizationQuery(get_called_class());
    }
} 