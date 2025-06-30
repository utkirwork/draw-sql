<?php

namespace xbsoft\organization\models\getter;

use common\models\getter\DefaultGetterTrait;

/**
 * This is the Getter Trait class for [[\xbsoft\organization\models\Organization]].
 *
 * @see \xbsoft\organization\models\Organization
 */
trait OrganizationGetterTrait
{
    use DefaultGetterTrait;

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    /**
     * Check if organization is active
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 1 && !$this->is_deleted;
    }

    /**
     * Get status text
     *
     * @return string
     */
    public function getStatusText(): string
    {
        $statuses = [
            0 => 'Inactive',
            1 => 'Active',
            2 => 'Suspended',
        ];

        return $statuses[$this->status] ?? 'Unknown';
    }
} 