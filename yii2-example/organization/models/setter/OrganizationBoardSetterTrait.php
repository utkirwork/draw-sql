<?php

namespace xbsoft\organization\models\setter;

use common\models\setter\DefaultSetterTrait;

/**
 * This is the Setter Trait class for [[\xbsoft\organization\models\OrganizationBoard]].
 *
 * @see \xbsoft\organization\models\OrganizationBoard
 */
trait OrganizationBoardSetterTrait
{
    use DefaultSetterTrait;

    public function setOrganizationId($value)
    {
        $this->organization_id = $value;
    }

    public function setBoardId($value)
    {
        $this->board_id = $value;
    }

    /**
     * Activate organization board relationship
     *
     * @return void
     */
    public function activate()
    {
        $this->status = 1;
    }

    /**
     * Deactivate organization board relationship
     *
     * @return void
     */
    public function deactivate()
    {
        $this->status = 0;
    }
} 