<?php

namespace xbsoft\organization\models;

use xbsoft\organization\models\scope\OrganizationBoardScopeTrait;
use xbsoft\organization\models\relation\OrganizationBoardRelationTrait;
use xbsoft\organization\models\getter\OrganizationBoardGetterTrait;
use xbsoft\organization\models\setter\OrganizationBoardSetterTrait;

/**
 * This is the model class for table "organization.organization_boards".
 *
 * @OA\Schema(
 *     description="Organization-Board relationship model"
 * )
 * @property int $id ID
 * @property int $organization_id Organization ID
 * @property int $board_id Board ID
 * @property int|null $created_by Created By
 * @property int|null $updated_by Updated By
 * @property int $created_at Created At
 * @property int $updated_at Updated At
 * @property int|null $deleted_at Deleted At
 * @property int|null $deleted_by Deleted By
 * @property bool $is_deleted Is Deleted
 * @property int|null $status Status
 */
class OrganizationBoard extends \yii\db\ActiveRecord
{
    use OrganizationBoardScopeTrait;
    use OrganizationBoardRelationTrait;
    use OrganizationBoardGetterTrait;
    use OrganizationBoardSetterTrait;

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
     *   property="board_id",
     *   type="integer",
     *   description="Board ID"
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
        return 'organization.organization_boards';
    }

    /**
     * {@inheritdoc}
     * @return \xbsoft\organization\models\query\OrganizationBoardQuery the active query used by this AR class.
     */
    public static function find(): \xbsoft\organization\models\query\OrganizationBoardQuery
    {
        return (new \xbsoft\organization\models\query\OrganizationBoardQuery(get_called_class()))->isNotDeleted();
    }

    public function fields()
    {
        $fields = parent::fields();
        $fields['board_name'] = function (self $model) {
            return $model->board ? $model->board->name : null;
        };
        return $fields;
    }
} 