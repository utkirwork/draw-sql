<?php

namespace xbsoft\blog\repository;

use xbsoft\blog\models\Posts;
use yii\data\ActiveDataProvider;
use yii\db\ActiveQuery;

/**
 * Class PostsRepository
 * Repository for Posts model
 */
class PostsRepository
{
    /**
     * Find by ID
     * @param int $id
     * @return Posts|null
     */
    public function findById(int $id): ?Posts
    {
        return Posts::findOne($id);
    }

    /**
     * Find all records
     * @return Posts[]
     */
    public function findAll(): array
    {
        return Posts::find()->all();
    }

    /**
     * Find with pagination
     * @param array $params
     * @return ActiveDataProvider
     */
    public function findWithPagination(array $params = []): ActiveDataProvider
    {
        $query = Posts::find();
        
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
     * @param Posts $model
     * @return bool
     */
    public function save(Posts $model): bool
    {
        return $model->save();
    }

    /**
     * Save model and throw exception on error
     * @param Posts $model
     * @return Posts
     * @throws \Exception
     */
    public function saveThrow(Posts $model): Posts
    {
        if (!$model->save()) {
            throw new \Exception('Failed to save posts: ' . implode(', ', $model->getFirstErrors()));
        }
        return $model;
    }

    /**
     * Delete model
     * @param Posts $model
     * @return bool
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function delete(Posts $model): bool
    {
        return (bool) $model->delete();
    }

    /**
     * Find by condition
     * @param array $condition
     * @return Posts|null
     */
    public function findByCondition(array $condition): ?Posts
    {
        return Posts::find()->where($condition)->one();
    }

    /**
     * Find all by condition
     * @param array $condition
     * @return Posts[]
     */
    public function findAllByCondition(array $condition): array
    {
        return Posts::find()->where($condition)->all();
    }

    /**
     * Count records
     * @param array $condition
     * @return int
     */
    public function count(array $condition = []): int
    {
        $query = Posts::find();
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
        return Posts::find()->where($condition)->exists();
    }

    /**
     * Get by title
     * @param mixed $title
     * @return Posts|null
     */
    public function getByTitle($title): ?Posts
    {
        return Posts::find()->title($title)->one();
    }

    /**
     * Check if exists by title
     * @param mixed $title
     * @param int|null $excludeId
     * @return bool
     */
    public function existsByTitle($title, $excludeId = null): bool
    {
        $query = Posts::find()->title($title);
        if ($excludeId) {
            $query->andWhere(['!=', 'id', $excludeId]);
        }
        return $query->exists();
    }

} 