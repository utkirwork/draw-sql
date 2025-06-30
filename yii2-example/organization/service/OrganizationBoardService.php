<?php

namespace xbsoft\organization\service;

use xbsoft\organization\dto\organizationBoard\OrganizationBoardCreateDTO;
use xbsoft\organization\models\OrganizationBoard;
use xbsoft\organization\repository\OrganizationBoardRepository;
use yii\base\Model;

/**
 * This is the Service class for [[\xbsoft\organization\models\OrganizationBoard]].
 *
 * @see OrganizationBoard
 */
class OrganizationBoardService extends Model
{
    private $repository;

    public function __construct(OrganizationBoardRepository $repository, $config = [])
    {
        parent::__construct($config);
        $this->repository = $repository;
    }

    /**
     * Create new organization board relationship
     *
     * @param OrganizationBoardCreateDTO $createDTO
     * @return OrganizationBoard
     * @throws \Exception
     */
    public function create(OrganizationBoardCreateDTO $createDTO): OrganizationBoard
    {
        // Check if relationship already exists
        if ($this->repository->exists($createDTO->organization_id, $createDTO->board_id)) {
            throw new \Exception("Organization board relationship already exists");
        }

        $model = new OrganizationBoard();
        $model->setOrganizationId($createDTO->organization_id);
        $model->setBoardId($createDTO->board_id);
        
        // Set default status if not provided
        if ($createDTO->status !== null) {
            $model->status = $createDTO->status;
        } else {
            $model->activate(); // Default to active
        }

        return $this->repository->saveThrow($model);
    }

    /**
     * Get or create organization board relationship
     *
     * @param int $organizationId
     * @param int $boardId
     * @return OrganizationBoard
     * @throws \Exception
     */
    public function getOrCreate($organizationId, $boardId): OrganizationBoard
    {
        $organizationBoard = $this->repository->getByOrganizationAndBoard($organizationId, $boardId);
        if ($organizationBoard) {
            return $organizationBoard;
        }

        $createDTO = new OrganizationBoardCreateDTO();
        $createDTO->organization_id = $organizationId;
        $createDTO->board_id = $boardId;
        $createDTO->status = 1; // Active by default

        return $this->create($createDTO);
    }

    /**
     * Activate organization board relationship
     *
     * @param OrganizationBoard $model
     * @return OrganizationBoard
     * @throws \Exception
     */
    public function activate(OrganizationBoard $model): OrganizationBoard
    {
        $model->activate();
        return $this->repository->saveThrow($model);
    }

    /**
     * Deactivate organization board relationship
     *
     * @param OrganizationBoard $model
     * @return OrganizationBoard
     * @throws \Exception
     */
    public function deactivate(OrganizationBoard $model): OrganizationBoard
    {
        $model->deactivate();
        return $this->repository->saveThrow($model);
    }

    /**
     * Delete organization board relationship (soft delete)
     *
     * @param OrganizationBoard $model
     * @return bool
     */
    public function delete(OrganizationBoard $model): bool
    {
        return $this->repository->delete($model);
    }

    /**
     * Assign board to organization
     *
     * @param int $organizationId
     * @param int $boardId
     * @return OrganizationBoard
     * @throws \Exception
     */
    public function assignBoardToOrganization($organizationId, $boardId): OrganizationBoard
    {
        return $this->getOrCreate($organizationId, $boardId);
    }

    /**
     * Unassign board from organization
     *
     * @param int $organizationId
     * @param int $boardId
     * @return bool
     * @throws \Exception
     */
    public function unassignBoardFromOrganization($organizationId, $boardId): bool
    {
        $organizationBoard = $this->repository->getByOrganizationAndBoard($organizationId, $boardId);
        if (!$organizationBoard) {
            throw new \Exception("Organization board relationship not found");
        }

        return $this->delete($organizationBoard);
    }
} 