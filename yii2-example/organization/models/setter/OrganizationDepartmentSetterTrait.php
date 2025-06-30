<?php

namespace xbsoft\organization\models\setter;

use common\models\setter\DefaultSetterTrait;

/**
 * This is the Setter Trait class for [[\xbsoft\organization\models\OrganizationDepartment]].
 *
 * @see \xbsoft\organization\models\OrganizationDepartment
 */
trait OrganizationDepartmentSetterTrait
{
    use DefaultSetterTrait;

    public function setOrganizationId($value)
    {
        $this->organization_id = $value;
    }

    public function setDepartmentId($value)
    {
        $this->department_id = $value;
    }

    /**
     * Activate organization department relationship
     *
     * @return void
     */
    public function activate()
    {
        $this->status = 1;
    }

    /**
     * Deactivate organization department relationship
     *
     * @return void
     */
    public function deactivate()
    {
        $this->status = 0;
    }
} 