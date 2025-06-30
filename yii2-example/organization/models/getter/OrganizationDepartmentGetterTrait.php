<?php

namespace xbsoft\organization\models\getter;

use common\models\getter\DefaultGetterTrait;

/**
 * This is the Getter Trait class for [[\xbsoft\organization\models\OrganizationDepartment]].
 *
 * @see \xbsoft\organization\models\OrganizationDepartment
 */
trait OrganizationDepartmentGetterTrait
{
    use DefaultGetterTrait;

    public function getOrganizationId(): ?int
    {
        return $this->organization_id;
    }

    public function getDepartmentId(): ?int
    {
        return $this->department_id;
    }

    /**
     * Check if organization department relationship is active
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 1 && !$this->is_deleted;
    }
} 