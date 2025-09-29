<?php

namespace xbsoft\blog\service;

use xbsoft\blog\dto\comments\CommentsCreateDTO;
use xbsoft\blog\dto\comments\CommentsUpdateDTO;
use xbsoft\blog\models\Comments;
use xbsoft\blog\repository\CommentsRepository;
use yii\base\BaseObject;
use yii\base\Exception;

/**
 * This is the Service class for [[xbsoft\blog\models\Comments]].
 *
 * @see Comments
 */
class CommentsService extends BaseObject
{
    private CommentsRepository $repository;

    public function __construct(CommentsRepository $repository, $config = [])
    {
        $this->repository = $repository;
        parent::__construct($config);
    }

    /**
     * Create new Comments
     *
     * @param CommentsCreateDTO $createDTO
     * @return Comments
     * @throws Exception
     */
    public function create(CommentsCreateDTO $createDTO): Comments
    {
        $model = new Comments();
        
        // Copy attributes from DTO
        if (isset($createDTO->post_id)) {
            $model->post_id = $createDTO->post_id;
        }
        if (isset($createDTO->author_id)) {
            $model->author_id = $createDTO->author_id;
        }
        if (isset($createDTO->content)) {
            $model->content = $createDTO->content;
        }


        return $this->repository->saveThrow($model);
    }

    /**
     * Update existing Comments
     *
     * @param Comments $model
     * @param CommentsUpdateDTO $updateDTO
     * @return Comments
     * @throws Exception
     */
    public function update(Comments $model, CommentsUpdateDTO $updateDTO): Comments
    {
        // Copy attributes from DTO
        if (isset($updateDTO->post_id)) {
            $model->post_id = $updateDTO->post_id;
        }
        if (isset($updateDTO->author_id)) {
            $model->author_id = $updateDTO->author_id;
        }
        if (isset($updateDTO->content)) {
            $model->content = $updateDTO->content;
        }

        return $this->repository->saveThrow($model);
    }


    /**
     * Delete Comments
     *
     * @param Comments $model
     * @return bool
     */
    public function delete(Comments $model): bool
    {
        return $this->repository->delete($model);
    }
} 