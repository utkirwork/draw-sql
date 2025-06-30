<?php

namespace xbsoft\organization\repository;

use xbsoft\organization\models\OrganizationDepartment;

/**
 * This is the Repository class for [[\xbsoft\organization\models\OrganizationDepartment]].
 *
 * @see \xbsoft\organization\models\OrganizationDepartment
 */
class OrganizationDepartmentRepository
{
    /**
     * Get organization department by ID
     *
     * @param int $value
     * @return OrganizationDepartment|null
     */
    public function getById($value): ?OrganizationDepartment
    {
        return OrganizationDepartment::find()->id($value)->one();
    }

    /**
     * Get organization department by organization ID and department ID
     *
     * @param int $organizationId
     * @param int $departmentId
     * @return OrganizationDepartment|null
     */
    public function getByOrganizationAndDepartment($organizationId, $departmentId): ?OrganizationDepartment
    {
        return OrganizationDepartment::find()
            ->organizationId($organizationId)
            ->departmentId($departmentId)
            ->one();
    }

    /**
     * Get all departments for an organization
     *
     * @param int $organizationId
     * @return array
     */
    public function getAllByOrganizationId($organizationId): array
    {
        return OrganizationDepartment::find()->organizationId($organizationId)->all();
    }

    /**
     * Get all organizations for a department
     *
     * @param int $departmentId
     * @return array
     */
    public function getAllByDepartmentId($departmentId): array
    {
        return OrganizationDepartment::find()->departmentId($departmentId)->all();
    }

    /**
     * Get all active organization departments
     *
     * @return array
     */
    public function getAllActive(): array
    {
        return OrganizationDepartment::find()->status(1)->all();
    }

    /**
     * Save organization department and throw exception if fails
     *
     * @param OrganizationDepartment $model
     * @return OrganizationDepartment
     * @throws \Exception
     */
    public function saveThrow(OrganizationDepartment $model): OrganizationDepartment
    {
        if (!$model->save()) {
            throw new \Exception("OrganizationDepartment is not saved: " . json_encode($model->getErrors()));
        }
        return $model;
    }

    /**
     * Delete organization department (soft delete)
     *
     * @param OrganizationDepartment $model
     * @return bool
     */
    public function delete(OrganizationDepartment $model): bool
    {
        return $model->delete();
    }

    /**
     * Check if organization department relationship exists
     *
     * @param int $organizationId
     * @param int $departmentId
     * @param int|null $excludeId
     * @return bool
     */
    public function exists($organizationId, $departmentId, $excludeId = null): bool
    {
        $query = OrganizationDepartment::find()
            ->organizationId($organizationId)
            ->departmentId($departmentId);
        
        if ($excludeId) {
            $query->andWhere(['!=', 'id', $excludeId]);
        }
        
        return $query->exists();
    }
} 