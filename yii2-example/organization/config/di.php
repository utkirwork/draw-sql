<?php

/**
 * Organization module DI container configuration
 */

use xbsoft\organization\service\OrganizationService;
use xbsoft\organization\service\OrganizationDepartmentService;
use xbsoft\organization\service\OrganizationBoardService;
use xbsoft\organization\repository\OrganizationRepository;
use xbsoft\organization\repository\OrganizationDepartmentRepository;
use xbsoft\organization\repository\OrganizationBoardRepository;

return [
    'singletons' => [
        // Repositories
        OrganizationRepository::class => OrganizationRepository::class,
        OrganizationDepartmentRepository::class => OrganizationDepartmentRepository::class,
        OrganizationBoardRepository::class => OrganizationBoardRepository::class,
        
        // Services
        OrganizationService::class => [
            'class' => OrganizationService::class,
            'organizationRepository' => OrganizationRepository::class
        ],
        OrganizationDepartmentService::class => [
            'class' => OrganizationDepartmentService::class,
            'organizationDepartmentRepository' => OrganizationDepartmentRepository::class
        ],
        OrganizationBoardService::class => [
            'class' => OrganizationBoardService::class,
            'organizationBoardRepository' => OrganizationBoardRepository::class
        ],
    ]
]; 