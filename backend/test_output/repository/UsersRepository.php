<?php

namespace xbsoft\blog\repository;

use xbsoft\blog\models\Users;
use yii\data\ActiveDataProvider;
use yii\db\ActiveQuery;

/**
 * Class UsersRepository
 * Repository for Users model
 */
class UsersRepository
{
    /**
     * Find by ID
     * @param int $id
     * @return Users|null
     */
    public function findById(int $id): ?Users
    {
        return Users::findOne($id);
    }

    /**
     * Find all records
     * @return Users[]
     */
    public function findAll(): array
    {
        return Users::find()->all();
    }

    /**
     * Find with pagination
     * @param array $params
     * @return ActiveDataProvider
     */
    public function findWithPagination(array $params = []): ActiveDataProvider
    {
        $query = Users::find();
        
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
     * @param Users $model
     * @return bool
     */
    public function save(Users $model): bool
    {
        return $model->save();
    }

    /**
     * Save model and throw exception on error
     * @param Users $model
     * @return Users
     * @throws \Exception
     */
    public function saveThrow(Users $model): Users
    {
        if (!$model->save()) {
            throw new \Exception('Failed to save users: ' . implode(', ', $model->getFirstErrors()));
        }
        return $model;
    }

    /**
     * Delete model
     * @param Users $model
     * @return bool
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function delete(Users $model): bool
    {
        return (bool) $model->delete();
    }

    /**
     * Find by condition
     * @param array $condition
     * @return Users|null
     */
    public function findByCondition(array $condition): ?Users
    {
        return Users::find()->where($condition)->one();
    }

    /**
     * Find all by condition
     * @param array $condition
     * @return Users[]
     */
    public function findAllByCondition(array $condition): array
    {
        return Users::find()->where($condition)->all();
    }

    /**
     * Count records
     * @param array $condition
     * @return int
     */
    public function count(array $condition = []): int
    {
        $query = Users::find();
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
        return Users::find()->where($condition)->exists();
    }

    /**
     * Get by username
     * @param mixed $username
     * @return Users|null
     */
    public function getByUsername($username): ?Users
    {
        return Users::find()->username($username)->one();
    }

    /**
     * Check if exists by username
     * @param mixed $username
     * @param int|null $excludeId
     * @return bool
     */
    public function existsByUsername($username, $excludeId = null): bool
    {
        $query = Users::find()->username($username);
        if ($excludeId) {
            $query->andWhere(['!=', 'id', $excludeId]);
        }
        return $query->exists();
    }

    /**
     * Get by email
     * @param mixed $email
     * @return Users|null
     */
    public function getByEmail($email): ?Users
    {
        return Users::find()->email($email)->one();
    }

    /**
     * Check if exists by email
     * @param mixed $email
     * @param int|null $excludeId
     * @return bool
     */
    public function existsByEmail($email, $excludeId = null): bool
    {
        $query = Users::find()->email($email);
        if ($excludeId) {
            $query->andWhere(['!=', 'id', $excludeId]);
        }
        return $query->exists();
    }

} 