<?php

namespace xbsoft\blog\service;

use xbsoft\blog\dto\users\UsersCreateDTO;
use xbsoft\blog\dto\users\UsersUpdateDTO;
use xbsoft\blog\models\Users;
use xbsoft\blog\repository\UsersRepository;
use yii\base\BaseObject;
use yii\base\Exception;

/**
 * This is the Service class for [[xbsoft\blog\models\Users]].
 *
 * @see Users
 */
class UsersService extends BaseObject
{
    private UsersRepository $repository;

    public function __construct(UsersRepository $repository, $config = [])
    {
        $this->repository = $repository;
        parent::__construct($config);
    }

    /**
     * Create new Users
     *
     * @param UsersCreateDTO $createDTO
     * @return Users
     * @throws Exception
     */
    public function create(UsersCreateDTO $createDTO): Users
    {
        $model = new Users();
        
        // Copy attributes from DTO
        if (isset($createDTO->username)) {
            $model->username = $createDTO->username;
        }
        if (isset($createDTO->email)) {
            $model->email = $createDTO->email;
        }
        if (isset($createDTO->password_hash)) {
            $model->password_hash = $createDTO->password_hash;
        }
        if (isset($createDTO->role)) {
            $model->role = $createDTO->role;
        }


        return $this->repository->saveThrow($model);
    }

    /**
     * Update existing Users
     *
     * @param Users $model
     * @param UsersUpdateDTO $updateDTO
     * @return Users
     * @throws Exception
     */
    public function update(Users $model, UsersUpdateDTO $updateDTO): Users
    {
        // Copy attributes from DTO
        if (isset($updateDTO->username)) {
            $model->username = $updateDTO->username;
        }
        if (isset($updateDTO->email)) {
            $model->email = $updateDTO->email;
        }
        if (isset($updateDTO->password_hash)) {
            $model->password_hash = $updateDTO->password_hash;
        }
        if (isset($updateDTO->role)) {
            $model->role = $updateDTO->role;
        }

        return $this->repository->saveThrow($model);
    }


    /**
     * Delete Users
     *
     * @param Users $model
     * @return bool
     */
    public function delete(Users $model): bool
    {
        return $this->repository->delete($model);
    }
} 