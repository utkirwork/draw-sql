<?php

namespace xbsoft\organization\models\setter;

use common\models\setter\DefaultSetterTrait;

/**
 * This is the Setter Trait class for [[\xbsoft\organization\models\OrganizationProject]].
 *
 * @see \xbsoft\organization\models\OrganizationProject
 */
trait OrganizationProjectSetterTrait
{
    use DefaultSetterTrait;

    public function setOrganizationId($value)
    {
        $this->organization_id = $value;
    }

    public function setProjectId($value)
    {
        $this->project_id = $value;
    }

    /**
     * Activate organization project relationship
     *
     * @return void
     */
    public function activate()
    {
        $this->status = 1;
    }

    /**
     * Deactivate organization project relationship
     *
     * @return void
     */
    public function deactivate()
    {
        $this->status = 0;
    }
} 