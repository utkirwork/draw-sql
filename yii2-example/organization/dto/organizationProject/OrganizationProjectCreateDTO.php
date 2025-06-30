<?php

namespace xbsoft\organization\dto\organizationProject;

/**
 * DTO for creating OrganizationProject
 */
class OrganizationProjectCreateDTO
{
    /**
     * @var int Organization ID
     */
    public int $organization_id;

    /**
     * @var int Project ID
     */
    public int $project_id;

    /**
     * @var int|null Status (0=Inactive, 1=Active)
     */
    public ?int $status = null;
} 