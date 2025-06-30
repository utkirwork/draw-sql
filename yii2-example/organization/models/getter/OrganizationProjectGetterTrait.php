<?php

namespace xbsoft\organization\models\getter;

use common\models\getter\DefaultGetterTrait;

/**
 * This is the Getter Trait class for [[\xbsoft\organization\models\OrganizationProject]].
 *
 * @see \xbsoft\organization\models\OrganizationProject
 */
trait OrganizationProjectGetterTrait
{
    use DefaultGetterTrait;

    public function getOrganizationId(): ?int
    {
        return $this->organization_id;
    }

    public function getProjectId(): ?int
    {
        return $this->project_id;
    }

    /**
     * Check if organization project relationship is active
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 1 && !$this->is_deleted;
    }
} 