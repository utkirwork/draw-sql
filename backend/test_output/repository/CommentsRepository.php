<?php

namespace xbsoft\blog\repository;

use xbsoft\blog\models\Comments;
use yii\data\ActiveDataProvider;
use yii\db\ActiveQuery;

/**
 * Class CommentsRepository
 * Repository for Comments model
 */
class CommentsRepository
{
    /**
     * Find by ID
     * @param int $id
     * @return Comments|null
     */
    public function findById(int $id): ?Comments
    {
        return Comments::findOne($id);
    }

    /**
     * Find all records
     * @return Comments[]
     */
    public function findAll(): array
    {
        return Comments::find()->all();
    }

    /**
     * Find with pagination
     * @param array $params
     * @return ActiveDataProvider
     */
    public function findWithPagination(array $params = []): ActiveDataProvider
    {
        $query = Comments::find();
        
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
     * @param Comments $model
     * @return bool
     */
    public function save(Comments $model): bool
    {
        return $model->save();
    }

    /**
     * Save model and throw exception on error
     * @param Comments $model
     * @return Comments
     * @throws \Exception
     */
    public function saveThrow(Comments $model): Comments
    {
        if (!$model->save()) {
            throw new \Exception('Failed to save comments: ' . implode(', ', $model->getFirstErrors()));
        }
        return $model;
    }

    /**
     * Delete model
     * @param Comments $model
     * @return bool
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function delete(Comments $model): bool
    {
        return (bool) $model->delete();
    }

    /**
     * Find by condition
     * @param array $condition
     * @return Comments|null
     */
    public function findByCondition(array $condition): ?Comments
    {
        return Comments::find()->where($condition)->one();
    }

    /**
     * Find all by condition
     * @param array $condition
     * @return Comments[]
     */
    public function findAllByCondition(array $condition): array
    {
        return Comments::find()->where($condition)->all();
    }

    /**
     * Count records
     * @param array $condition
     * @return int
     */
    public function count(array $condition = []): int
    {
        $query = Comments::find();
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
        return Comments::find()->where($condition)->exists();
    }

} 