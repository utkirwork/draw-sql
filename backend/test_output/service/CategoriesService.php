<?php

namespace xbsoft\blog\service;

use xbsoft\blog\dto\categories\CategoriesCreateDTO;
use xbsoft\blog\dto\categories\CategoriesUpdateDTO;
use xbsoft\blog\models\Categories;
use xbsoft\blog\repository\CategoriesRepository;
use yii\base\BaseObject;
use yii\base\Exception;

/**
 * This is the Service class for [[xbsoft\blog\models\Categories]].
 *
 * @see Categories
 */
class CategoriesService extends BaseObject
{
    private CategoriesRepository $repository;

    public function __construct(CategoriesRepository $repository, $config = [])
    {
        $this->repository = $repository;
        parent::__construct($config);
    }

    /**
     * Create new Categories
     *
     * @param CategoriesCreateDTO $createDTO
     * @return Categories
     * @throws Exception
     */
    public function create(CategoriesCreateDTO $createDTO): Categories
    {
        $model = new Categories();
        
        // Copy attributes from DTO
        if (isset($createDTO->name)) {
            $model->name = $createDTO->name;
        }
        if (isset($createDTO->slug)) {
            $model->slug = $createDTO->slug;
        }


        return $this->repository->saveThrow($model);
    }

    /**
     * Update existing Categories
     *
     * @param Categories $model
     * @param CategoriesUpdateDTO $updateDTO
     * @return Categories
     * @throws Exception
     */
    public function update(Categories $model, CategoriesUpdateDTO $updateDTO): Categories
    {
        // Copy attributes from DTO
        if (isset($updateDTO->name)) {
            $model->name = $updateDTO->name;
        }
        if (isset($updateDTO->slug)) {
            $model->slug = $updateDTO->slug;
        }

        return $this->repository->saveThrow($model);
    }


    /**
     * Delete Categories
     *
     * @param Categories $model
     * @return bool
     */
    public function delete(Categories $model): bool
    {
        return $this->repository->delete($model);
    }
} 