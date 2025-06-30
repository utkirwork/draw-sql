<?php

namespace xbsoft\organization\models\setter;

use common\models\setter\DefaultSetterTrait;

/**
 * This is the Setter Trait class for [[\xbsoft\organization\models\Organization]].
 *
 * @see \xbsoft\organization\models\Organization
 */
trait OrganizationSetterTrait
{
    use DefaultSetterTrait;

    public function setTitle($value)
    {
        $this->title = $value;
    }

    public function setDescription($value)
    {
        $this->description = $value;
    }

    /**
     * Activate organization
     *
     * @return void
     */
    public function activate()
    {
        $this->status = 1;
    }

    /**
     * Deactivate organization
     *
     * @return void
     */
    public function deactivate()
    {
        $this->status = 0;
    }

    /**
     * Suspend organization
     *
     * @return void
     */
    public function suspend()
    {
        $this->status = 2;
    }
} 