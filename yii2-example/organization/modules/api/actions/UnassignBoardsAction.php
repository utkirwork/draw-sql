<?php

namespace xbsoft\organization\modules\api\actions;

use xbsoft\organization\modules\api\forms\UnassignBoardsForm;
use xbsoft\organization\service\OrganizationBoardService;
use xbsoft\organization\repository\OrganizationBoardRepository;
use xbsoft\organization\repository\OrganizationRepository;
use Yii;
use yii\base\Action;
use yii\web\Response;
use yii\web\NotFoundHttpException;

/**
 * Unassign Boards from Organization Action
 */
class UnassignBoardsAction extends Action
{
    private $organizationBoardService;
    private $organizationRepository;

    public function __construct($id, $controller, OrganizationBoardService $organizationBoardService, OrganizationRepository $organizationRepository, $config = [])
    {
        $this->organizationBoardService = $organizationBoardService;
        $this->organizationRepository = $organizationRepository;
        parent::__construct($id, $controller, $config);
    }

    /**
     * @OA\Delete(
     *   path="/v1/organization/organization/unassign-boards/{id}",
     *   tags={"organization"},
     *   summary="Unassign Boards from Organization",
     *   description="Remove multiple boards from an organization",
     *   operationId="organizationUnassignBoards",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(
     *       name="id",
     *       in="path",
     *       description="Organization ID",
     *       required=true,
     *       @OA\Schema(type="integer", format="int64")
     *   ),
     *   @OA\RequestBody(
     *       required=true,
     *       @OA\MediaType(
     *           mediaType="application/x-www-form-urlencoded",
     *           @OA\Schema(ref="#/components/schemas/UnassignBoardsForm")
     *       )
     *   ),
     *   @OA\Response(
     *       response=200,
     *       description="Success: Boards Unassigned",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(property="success", type="boolean"),
     *               @OA\Property(property="message", type="string"),
     *               @OA\Property(property="unassigned_boards", type="array", @OA\Items(type="integer"))
     *           )
     *       )
     *   ),
     *   @OA\Response(
     *       response=404,
     *       description="Organization Not Found"
     *   ),
     *   @OA\Response(
     *       response=422,
     *       description="Validation Error"
     *   )
     * )
     */
    public function run($id)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        
        $this->validateOrganizationExists($id);
        
        $form = $this->createAndValidateForm();
        if (!$form->validate()) {
            return $this->handleValidationError($form);
        }
        
        try {
            $unassignedBoards = $this->unassignBoards($id, $form->board_ids);
            return $this->createSuccessResponse($unassignedBoards);
        } catch (\Exception $e) {
            return $this->handleBusinessError($e);
        }
    }

    private function validateOrganizationExists($id): void
    {
        $organization = $this->organizationRepository->getById($id);
        if (!$organization) {
            throw new NotFoundHttpException('Organization not found');
        }
    }

    private function createAndValidateForm(): UnassignBoardsForm
    {
        $form = new UnassignBoardsForm();
        $form->load(Yii::$app->request->post(), '');
        return $form;
    }

    private function unassignBoards($organizationId, array $boardIds): array
    {
        $unassignedBoards = [];
        foreach ($boardIds as $boardId) {
            $this->organizationBoardService->unassignBoardFromOrganization($organizationId, $boardId);
            $unassignedBoards[] = $boardId;
        }
        return $unassignedBoards;
    }

    private function createSuccessResponse(array $unassignedBoards): array
    {
        return [
            'success' => true,
            'message' => 'Boards unassigned successfully',
            'unassigned_boards' => $unassignedBoards
        ];
    }

    private function handleValidationError(UnassignBoardsForm $form): array
    {
        Yii::$app->response->statusCode = 422;
        return $form->getErrors();
    }

    private function handleBusinessError(\Exception $e): array
    {
        Yii::$app->response->statusCode = 400;
        return [
            'success' => false,
            'message' => $e->getMessage(),
            'errors' => []
        ];
    }
} 