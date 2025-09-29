<?php

namespace xbsoft\blog\service;

use xbsoft\blog\dto\posts\PostsCreateDTO;
use xbsoft\blog\dto\posts\PostsUpdateDTO;
use xbsoft\blog\models\Posts;
use xbsoft\blog\repository\PostsRepository;
use yii\base\BaseObject;
use yii\base\Exception;

/**
 * This is the Service class for [[xbsoft\blog\models\Posts]].
 *
 * @see Posts
 */
class PostsService extends BaseObject
{
    private PostsRepository $repository;

    public function __construct(PostsRepository $repository, $config = [])
    {
        $this->repository = $repository;
        parent::__construct($config);
    }

    /**
     * Create new Posts
     *
     * @param PostsCreateDTO $createDTO
     * @return Posts
     * @throws Exception
     */
    public function create(PostsCreateDTO $createDTO): Posts
    {
        $model = new Posts();
        
        // Copy attributes from DTO
        if (isset($createDTO->title)) {
            $model->title = $createDTO->title;
        }
        if (isset($createDTO->content)) {
            $model->content = $createDTO->content;
        }
        if (isset($createDTO->author_id)) {
            $model->author_id = $createDTO->author_id;
        }
        if (isset($createDTO->category_id)) {
            $model->category_id = $createDTO->category_id;
        }
        if (isset($createDTO->published_at)) {
            $model->published_at = $createDTO->published_at;
        }


        return $this->repository->saveThrow($model);
    }

    /**
     * Update existing Posts
     *
     * @param Posts $model
     * @param PostsUpdateDTO $updateDTO
     * @return Posts
     * @throws Exception
     */
    public function update(Posts $model, PostsUpdateDTO $updateDTO): Posts
    {
        // Copy attributes from DTO
        if (isset($updateDTO->title)) {
            $model->title = $updateDTO->title;
        }
        if (isset($updateDTO->content)) {
            $model->content = $updateDTO->content;
        }
        if (isset($updateDTO->author_id)) {
            $model->author_id = $updateDTO->author_id;
        }
        if (isset($updateDTO->category_id)) {
            $model->category_id = $updateDTO->category_id;
        }
        if (isset($updateDTO->published_at)) {
            $model->published_at = $updateDTO->published_at;
        }

        return $this->repository->saveThrow($model);
    }


    /**
     * Delete Posts
     *
     * @param Posts $model
     * @return bool
     */
    public function delete(Posts $model): bool
    {
        return $this->repository->delete($model);
    }
} 