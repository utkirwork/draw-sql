<?php

namespace xbsoft\organization\repository;

use xbsoft\organization\models\OrganizationProject;

/**
 * This is the Repository class for [[\xbsoft\organization\models\OrganizationProject]].
 *
 * @see \xbsoft\organization\models\OrganizationProject
 */
class OrganizationProjectRepository
{
    /**
     * Get organization project by ID
     *
     * @param int $value
     * @return OrganizationProject|null
     */
    public function getById($value): ?OrganizationProject
    {
        return OrganizationProject::find()->id($value)->one();
    }

    /**
     * Get organization project by organization ID and project ID
     *
     * @param int $organizationId
     * @param int $projectId
     * @return OrganizationProject|null
     */
    public function getByOrganizationAndProject($organizationId, $projectId): ?OrganizationProject
    {
        return OrganizationProject::find()
            ->organizationId($organizationId)
            ->projectId($projectId)
            ->one();
    }

    /**
     * Get all projects for an organization
     *
     * @param int $organizationId
     * @return array
     */
    public function getAllByOrganizationId($organizationId): array
    {
        return OrganizationProject::find()->organizationId($organizationId)->all();
    }

    /**
     * Get all organizations for a project
     *
     * @param int $projectId
     * @return array
     */
    public function getAllByProjectId($projectId): array
    {
        return OrganizationProject::find()->projectId($projectId)->all();
    }

    /**
     * Get all active organization projects
     *
     * @return array
     */
    public function getAllActive(): array
    {
        return OrganizationProject::find()->status(1)->all();
    }

    /**
     * Save organization project and throw exception if fails
     *
     * @param OrganizationProject $model
     * @return OrganizationProject
     * @throws \Exception
     */
    public function saveThrow(OrganizationProject $model): OrganizationProject
    {
        if (!$model->save()) {
            throw new \Exception("OrganizationProject is not saved: " . json_encode($model->getErrors()));
        }
        return $model;
    }

    /**
     * Delete organization project (soft delete)
     *
     * @param OrganizationProject $model
     * @return bool
     */
    public function delete(OrganizationProject $model): bool
    {
        return $model->delete();
    }

    /**
     * Check if organization project relationship exists
     *
     * @param int $organizationId
     * @param int $projectId
     * @param int|null $excludeId
     * @return bool
     */
    public function exists($organizationId, $projectId, $excludeId = null): bool
    {
        $query = OrganizationProject::find()
            ->organizationId($organizationId)
            ->projectId($projectId);
        
        if ($excludeId) {
            $query->andWhere(['!=', 'id', $excludeId]);
        }
        
        return $query->exists();
    }
} 