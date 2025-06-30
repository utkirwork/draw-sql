<?php

namespace xbsoft\organization\repository;

use xbsoft\organization\models\Organization;

/**
 * This is the Repository class for [[\xbsoft\organization\models\Organization]].
 *
 * @see \xbsoft\organization\models\Organization
 */
class OrganizationRepository
{
    /**
     * Get organization by ID
     *
     * @param int $value
     * @return Organization|null
     */
    public function getById($value): ?Organization
    {
        return Organization::find()->id($value)->one();
    }

    /**
     * Get organization by title
     *
     * @param string $title
     * @return Organization|null
     */
    public function getByTitle($title): ?Organization
    {
        return Organization::find()->title($title)->one();
    }

    /**
     * Get organization by description
     *
     * @param string $description
     * @return Organization|null
     */
    public function getByDescription($description): ?Organization
    {
        return Organization::find()->description($description)->one();
    }

    /**
     * Get all organizations by title
     *
     * @param string $title
     * @return array
     */
    public function getAllByTitle($title): array
    {
        return Organization::find()->title($title)->all();
    }

    /**
     * Get all active organizations
     *
     * @return array
     */
    public function getAllActive(): array
    {
        return Organization::find()->status(1)->all();
    }

    /**
     * Get all organizations
     *
     * @return array
     */
    public function getAll(): array
    {
        return Organization::find()->all();
    }

    /**
     * Save organization and throw exception if fails
     *
     * @param Organization $model
     * @return Organization
     * @throws \Exception
     */
    public function saveThrow(Organization $model): Organization
    {
        if (!$model->save()) {
            throw new \Exception("Organization is not saved: " . json_encode($model->getErrors()));
        }
        return $model;
    }

    /**
     * Delete organization (soft delete)
     *
     * @param Organization $model
     * @return bool
     */
    public function delete(Organization $model): bool
    {
        return $model->delete();
    }

    /**
     * Get count of organizations
     *
     * @return int
     */
    public function getCount(): int
    {
        return Organization::find()->count();
    }

    /**
     * Check if organization exists by title
     *
     * @param string $title
     * @param int|null $excludeId
     * @return bool
     */
    public function existsByTitle($title, $excludeId = null): bool
    {
        $query = Organization::find()->title($title);
        if ($excludeId) {
            $query->andWhere(['!=', 'id', $excludeId]);
        }
        return $query->exists();
    }
} 