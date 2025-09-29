<?php

namespace xbsoft\blog\repository;

use xbsoft\blog\models\Categories;
use yii\data\ActiveDataProvider;
use yii\db\ActiveQuery;

/**
 * Class CategoriesRepository
 * Repository for Categories model
 */
class CategoriesRepository
{
    /**
     * Find by ID
     * @param int $id
     * @return Categories|null
     */
    public function findById(int $id): ?Categories
    {
        return Categories::findOne($id);
    }

    /**
     * Find all records
     * @return Categories[]
     */
    public function findAll(): array
    {
        return Categories::find()->all();
    }

    /**
     * Find with pagination
     * @param array $params
     * @return ActiveDataProvider
     */
    public function findWithPagination(array $params = []): ActiveDataProvider
    {
        $query = Categories::find();
        
        return new ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => $params['pageSize'] ?? 20,
            ],
            'sort' => [
                'defaultOrder' => [
                    'id' => SORT_DESC,
                ]
            ],
        ]);
    }

    /**
     * Save model
     * @param Categories $model
     * @return bool
     */
    public function save(Categories $model): bool
    {
        return $model->save();
    }

    /**
     * Save model and throw exception on error
     * @param Categories $model
     * @return Categories
     * @throws \Exception
     */
    public function saveThrow(Categories $model): Categories
    {
        if (!$model->save()) {
            throw new \Exception('Failed to save categories: ' . implode(', ', $model->getFirstErrors()));
        }
        return $model;
    }

    /**
     * Delete model
     * @param Categories $model
     * @return bool
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function delete(Categories $model): bool
    {
        return (bool) $model->delete();
    }

    /**
     * Find by condition
     * @param array $condition
     * @return Categories|null
     */
    public function findByCondition(array $condition): ?Categories
    {
        return Categories::find()->where($condition)->one();
    }

    /**
     * Find all by condition
     * @param array $condition
     * @return Categories[]
     */
    public function findAllByCondition(array $condition): array
    {
        return Categories::find()->where($condition)->all();
    }

    /**
     * Count records
     * @param array $condition
     * @return int
     */
    public function count(array $condition = []): int
    {
        $query = Categories::find();
        if (!empty($condition)) {
            $query->where($condition);
        }
        return $query->count();
    }

    /**
     * Check if exists
     * @param array $condition
     * @return bool
     */
    public function exists(array $condition): bool
    {
        return Categories::find()->where($condition)->exists();
    }

    /**
     * Get by name
     * @param mixed $name
     * @return Categories|null
     */
    public function getByName($name): ?Categories
    {
        return Categories::find()->name($name)->one();
    }

    /**
     * Check if exists by name
     * @param mixed $name
     * @param int|null $excludeId
     * @return bool
     */
    public function existsByName($name, $excludeId = null): bool
    {
        $query = Categories::find()->name($name);
        if ($excludeId) {
            $query->andWhere(['!=', 'id', $excludeId]);
        }
        return $query->exists();
    }

} 