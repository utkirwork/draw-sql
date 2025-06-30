<?php

namespace xbsoft\organization\service;

use xbsoft\organization\dto\organizationProject\OrganizationProjectCreateDTO;
use xbsoft\organization\models\OrganizationProject;
use xbsoft\organization\repository\OrganizationProjectRepository;
use yii\base\Model;

/**
 * This is the Service class for [[\xbsoft\organization\models\OrganizationProject]].
 *
 * @see OrganizationProject
 */
class OrganizationProjectService extends Model
{
    private $repository;

    public function __construct(OrganizationProjectRepository $repository, $config = [])
    {
        parent::__construct($config);
        $this->repository = $repository;
    }

    /**
     * Create new organization project relationship
     *
     * @param OrganizationProjectCreateDTO $createDTO
     * @return OrganizationProject
     * @throws \Exception
     */
    public function create(OrganizationProjectCreateDTO $createDTO): OrganizationProject
    {
        // Check if relationship already exists
        if ($this->repository->exists($createDTO->organization_id, $createDTO->project_id)) {
            throw new \Exception("Organization project relationship already exists");
        }

        $model = new OrganizationProject();
        $model->setOrganizationId($createDTO->organization_id);
        $model->setProjectId($createDTO->project_id);
        
        // Set default status if not provided
        if ($createDTO->status !== null) {
            $model->status = $createDTO->status;
        } else {
            $model->activate(); // Default to active
        }

        return $this->repository->saveThrow($model);
    }

    /**
     * Get or create organization project relationship
     *
     * @param int $organizationId
     * @param int $projectId
     * @return OrganizationProject
     * @throws \Exception
     */
    public function getOrCreate($organizationId, $projectId): OrganizationProject
    {
        $organizationProject = $this->repository->getByOrganizationAndProject($organizationId, $projectId);
        if ($organizationProject) {
            return $organizationProject;
        }

        $createDTO = new OrganizationProjectCreateDTO();
        $createDTO->organization_id = $organizationId;
        $createDTO->project_id = $projectId;
        $createDTO->status = 1; // Active by default

        return $this->create($createDTO);
    }

    /**
     * Activate organization project relationship
     *
     * @param OrganizationProject $model
     * @return OrganizationProject
     * @throws \Exception
     */
    public function activate(OrganizationProject $model): OrganizationProject
    {
        $model->activate();
        return $this->repository->saveThrow($model);
    }

    /**
     * Deactivate organization project relationship
     *
     * @param OrganizationProject $model
     * @return OrganizationProject
     * @throws \Exception
     */
    public function deactivate(OrganizationProject $model): OrganizationProject
    {
        $model->deactivate();
        return $this->repository->saveThrow($model);
    }

    /**
     * Delete organization project relationship (soft delete)
     *
     * @param OrganizationProject $model
     * @return bool
     */
    public function delete(OrganizationProject $model): bool
    {
        return $this->repository->delete($model);
    }

    /**
     * Assign project to organization
     *
     * @param int $organizationId
     * @param int $projectId
     * @return OrganizationProject
     * @throws \Exception
     */
    public function assignProjectToOrganization($organizationId, $projectId): OrganizationProject
    {
        return $this->getOrCreate($organizationId, $projectId);
    }

    /**
     * Unassign project from organization
     *
     * @param int $organizationId
     * @param int $projectId
     * @return bool
     * @throws \Exception
     */
    public function unassignProjectFromOrganization($organizationId, $projectId): bool
    {

        $organizationProject = $this->repository->getByOrganizationAndProject($organizationId, $projectId);
        if (!$organizationProject) {
            throw new \Exception("Organization project relationship not found");
        }
        return $this->delete($organizationProject);
    }
} 