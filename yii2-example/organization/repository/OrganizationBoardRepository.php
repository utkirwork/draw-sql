<?php

namespace xbsoft\organization\repository;

use xbsoft\organization\models\OrganizationBoard;

/**
 * This is the Repository class for [[\xbsoft\organization\models\OrganizationBoard]].
 *
 * @see \xbsoft\organization\models\OrganizationBoard
 */
class OrganizationBoardRepository
{
    /**
     * Get organization board by ID
     *
     * @param int $value
     * @return OrganizationBoard|null
     */
    public function getById($value): ?OrganizationBoard
    {
        return OrganizationBoard::find()->id($value)->one();
    }

    /**
     * Get organization board by organization ID and board ID
     *
     * @param int $organizationId
     * @param int $boardId
     * @return OrganizationBoard|null
     */
    public function getByOrganizationAndBoard($organizationId, $boardId): ?OrganizationBoard
    {
        return OrganizationBoard::find()
            ->organizationId($organizationId)
            ->boardId($boardId)
            ->one();
    }

    /**
     * Get all boards for an organization
     *
     * @param int $organizationId
     * @return array
     */
    public function getAllByOrganizationId($organizationId): array
    {
        return OrganizationBoard::find()->organizationId($organizationId)->all();
    }

    /**
     * Get all organizations for a board
     *
     * @param int $boardId
     * @return array
     */
    public function getAllByBoardId($boardId): array
    {
        return OrganizationBoard::find()->boardId($boardId)->all();
    }

    /**
     * Get all active organization boards
     *
     * @return array
     */
    public function getAllActive(): array
    {
        return OrganizationBoard::find()->status(1)->all();
    }

    /**
     * Save organization board and throw exception if fails
     *
     * @param OrganizationBoard $model
     * @return OrganizationBoard
     * @throws \Exception
     */
    public function saveThrow(OrganizationBoard $model): OrganizationBoard
    {
        if (!$model->save()) {
            throw new \Exception("OrganizationBoard is not saved: " . json_encode($model->getErrors()));
        }
        return $model;
    }

    /**
     * Delete organization board (soft delete)
     *
     * @param OrganizationBoard $model
     * @return bool
     */
    public function delete(OrganizationBoard $model): bool
    {
        return $model->delete();
    }

    /**
     * Check if organization board relationship exists
     *
     * @param int $organizationId
     * @param int $boardId
     * @param int|null $excludeId
     * @return bool
     */
    public function exists($organizationId, $boardId, $excludeId = null): bool
    {
        $query = OrganizationBoard::find()
            ->organizationId($organizationId)
            ->boardId($boardId);
        
        if ($excludeId) {
            $query->andWhere(['!=', 'id', $excludeId]);
        }
        
        return $query->exists();
    }
} 