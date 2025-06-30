<?php

namespace xbsoft\organization\service;

use xbsoft\organization\dto\organizationDepartment\OrganizationDepartmentCreateDTO;
use xbsoft\organization\models\OrganizationDepartment;
use xbsoft\organization\repository\OrganizationDepartmentRepository;
use yii\base\Model;

/**
 * This is the Service class for [[\xbsoft\organization\models\OrganizationDepartment]].
 *
 * @see OrganizationDepartment
 */
class OrganizationDepartmentService extends Model
{
    private $repository;

    public function __construct(OrganizationDepartmentRepository $repository, $config = [])
    {
        parent::__construct($config);
        $this->repository = $repository;
    }

    /**
     * Create new organization department relationship
     *
     * @param OrganizationDepartmentCreateDTO $createDTO
     * @return OrganizationDepartment
     * @throws \Exception
     */
    public function create(OrganizationDepartmentCreateDTO $createDTO): OrganizationDepartment
    {
        // Check if relationship already exists
        if ($this->repository->exists($createDTO->organization_id, $createDTO->department_id)) {
            throw new \Exception("Organization department relationship already exists");
        }

        $model = new OrganizationDepartment();
        $model->setOrganizationId($createDTO->organization_id);
        $model->setDepartmentId($createDTO->department_id);
        
        // Set default status if not provided
        if ($createDTO->status !== null) {
            $model->status = $createDTO->status;
        } else {
            $model->activate(); // Default to active
        }

        return $this->repository->saveThrow($model);
    }

    /**
     * Get or create organization department relationship
     *
     * @param int $organizationId
     * @param int $departmentId
     * @return OrganizationDepartment
     * @throws \Exception
     */
    public function getOrCreate($organizationId, $departmentId): OrganizationDepartment
    {
        $organizationDepartment = $this->repository->getByOrganizationAndDepartment($organizationId, $departmentId);
        if ($organizationDepartment) {
            return $organizationDepartment;
        }

        $createDTO = new OrganizationDepartmentCreateDTO();
        $createDTO->organization_id = $organizationId;
        $createDTO->department_id = $departmentId;
        $createDTO->status = 1; // Active by default

        return $this->create($createDTO);
    }

    /**
     * Activate organization department relationship
     *
     * @param OrganizationDepartment $model
     * @return OrganizationDepartment
     * @throws \Exception
     */
    public function activate(OrganizationDepartment $model): OrganizationDepartment
    {
        $model->activate();
        return $this->repository->saveThrow($model);
    }

    /**
     * Deactivate organization department relationship
     *
     * @param OrganizationDepartment $model
     * @return OrganizationDepartment
     * @throws \Exception
     */
    public function deactivate(OrganizationDepartment $model): OrganizationDepartment
    {
        $model->deactivate();
        return $this->repository->saveThrow($model);
    }

    /**
     * Delete organization department relationship (soft delete)
     *
     * @param OrganizationDepartment $model
     * @return bool
     */
    public function delete(OrganizationDepartment $model): bool
    {
        return $this->repository->delete($model);
    }

    /**
     * Assign department to organization
     *
     * @param int $organizationId
     * @param int $departmentId
     * @return OrganizationDepartment
     * @throws \Exception
     */
    public function assignDepartmentToOrganization($organizationId, $departmentId): OrganizationDepartment
    {
        return $this->getOrCreate($organizationId, $departmentId);
    }

    /**
     * Unassign department from organization
     *
     * @param int $organizationId
     * @param int $departmentId
     * @return bool
     * @throws \Exception
     */
    public function unassignDepartmentFromOrganization($organizationId, $departmentId): bool
    {
        $organizationDepartment = $this->repository->getByOrganizationAndDepartment($organizationId, $departmentId);
        if (!$organizationDepartment) {
            throw new \Exception("Organization department relationship not found");
        }

        return $this->delete($organizationDepartment);
    }
} 