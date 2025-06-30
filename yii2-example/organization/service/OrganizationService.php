<?php

namespace xbsoft\organization\service;

use xbsoft\organization\dto\organization\OrganizationCreateDTO;
use xbsoft\organization\dto\organization\OrganizationUpdateDTO;
use xbsoft\organization\models\Organization;
use xbsoft\organization\repository\OrganizationRepository;
use yii\base\Model;

/**
 * This is the Service class for [[\xbsoft\organization\models\Organization]].
 *
 * @see Organization
 */
class OrganizationService extends Model
{
    private $repository;

    public function __construct(OrganizationRepository $repository, $config = [])
    {
        parent::__construct($config);
        $this->repository = $repository;
    }

    /**
     * Create new organization
     *
     * @param OrganizationCreateDTO $createDTO
     * @return Organization
     * @throws \Exception
     */
    public function create(OrganizationCreateDTO $createDTO): Organization
    {
        $model = new Organization();
        $model->setTitle($createDTO->title);
        $model->setDescription($createDTO->description);
        
        // Set default status if not provided
        if ($createDTO->status !== null) {
            $model->status = $createDTO->status;
        } else {
            $model->activate(); // Default to active
        }

        return $this->repository->saveThrow($model);
    }

    /**
     * Update existing organization
     *
     * @param Organization $model
     * @param OrganizationUpdateDTO $updateDTO
     * @return Organization
     * @throws \Exception
     */
    public function update(Organization $model, OrganizationUpdateDTO $updateDTO): Organization
    {
        $model->setTitle($updateDTO->title);
        $model->setDescription($updateDTO->description);
        
        if ($updateDTO->status !== null) {
            $model->status = $updateDTO->status;
        }

        return $this->repository->saveThrow($model);
    }

    /**
     * Get or create organization by title
     *
     * @param string $title
     * @param string|null $description
     * @return Organization
     * @throws \Exception
     */
    public function getOrCreateByTitle($title, $description = null): Organization
    {
        $organization = $this->repository->getByTitle($title);
        if ($organization) {
            return $organization;
        }

        $createDTO = new OrganizationCreateDTO();
        $createDTO->title = $title;
        $createDTO->description = $description;
        $createDTO->status = 1; // Active by default

        return $this->create($createDTO);
    }

    /**
     * Activate organization
     *
     * @param Organization $model
     * @return Organization
     * @throws \Exception
     */
    public function activate(Organization $model): Organization
    {
        $model->activate();
        return $this->repository->saveThrow($model);
    }

    /**
     * Deactivate organization
     *
     * @param Organization $model
     * @return Organization
     * @throws \Exception
     */
    public function deactivate(Organization $model): Organization
    {
        $model->deactivate();
        return $this->repository->saveThrow($model);
    }

    /**
     * Suspend organization
     *
     * @param Organization $model
     * @return Organization
     * @throws \Exception
     */
    public function suspend(Organization $model): Organization
    {
        $model->suspend();
        return $this->repository->saveThrow($model);
    }

    /**
     * Delete organization (soft delete)
     *
     * @param Organization $model
     * @return bool
     */
    public function delete(Organization $model): bool
    {
        return $this->repository->delete($model);
    }

    /**
     * Check if organization title is unique
     *
     * @param string $title
     * @param int|null $excludeId
     * @return bool
     */
    public function isTitleUnique($title, $excludeId = null): bool
    {
        return !$this->repository->existsByTitle($title, $excludeId);
    }
} 