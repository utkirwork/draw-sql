<?php

namespace xbsoft\organization\models\relation;

use xbsoft\organization\models\Organization;
use xbsoft\board\models\Board;

/**
 * This is the Relation Trait class for [[\xbsoft\organization\models\OrganizationBoard]].
 *
 * @see \xbsoft\organization\models\OrganizationBoard
 */
trait OrganizationBoardRelationTrait
{
    /**
     * Gets query for [[Organization]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getOrganization()
    {
        return $this->hasOne(Organization::class, ['id' => 'organization_id']);
    }

    /**
     * Gets query for [[Board]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getBoard()
    {
        return $this->hasOne(Board::class, ['id' => 'board_id']);
    }
} 