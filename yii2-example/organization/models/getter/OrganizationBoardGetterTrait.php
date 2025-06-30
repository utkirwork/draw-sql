<?php

namespace xbsoft\organization\models\getter;

use common\models\getter\DefaultGetterTrait;

/**
 * This is the Getter Trait class for [[\xbsoft\organization\models\OrganizationBoard]].
 *
 * @see \xbsoft\organization\models\OrganizationBoard
 */
trait OrganizationBoardGetterTrait
{
    use DefaultGetterTrait;

    public function getOrganizationId(): ?int
    {
        return $this->organization_id;
    }

    public function getBoardId(): ?int
    {
        return $this->board_id;
    }

    /**
     * Check if organization board relationship is active
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 1 && !$this->is_deleted;
    }
} 