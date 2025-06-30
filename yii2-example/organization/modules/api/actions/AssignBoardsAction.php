<?php

namespace xbsoft\organization\modules\api\actions;

use xbsoft\organization\modules\api\forms\AssignBoardsForm;
use xbsoft\organization\service\OrganizationBoardService;
use xbsoft\organization\repository\OrganizationRepository;
use Yii;
use yii\base\Action;
use yii\web\Response;
use yii\web\NotFoundHttpException;

/**
 * Assign Boards to Organization Action
 */
class AssignBoardsAction extends Action
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
     * @OA\Post(
     *   path="/v1/organization/organization/assign-boards/{id}",
     *   tags={"organization"},
     *   summary="Assign Boards to Organization",
     *   description="Assign multiple boards to an organization",
     *   operationId="organizationAssignBoards",
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
     *           @OA\Schema(ref="#/components/schemas/AssignBoardsForm")
     *       )
     *   ),
     *   @OA\Response(
     *       response=200,
     *       description="Success: Boards Assigned",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(property="success", type="boolean"),
     *               @OA\Property(property="message", type="string"),
     *               @OA\Property(property="assigned_boards", type="array", @OA\Items(type="integer"))
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
            $assignedBoards = $this->assignBoards($id, $form->board_ids);
            return $this->createSuccessResponse($assignedBoards);
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

    private function createAndValidateForm(): AssignBoardsForm
    {
        $form = new AssignBoardsForm();
        $form->load(Yii::$app->request->post(), '');
        return $form;
    }

    private function assignBoards($organizationId, array $boardIds): array
    {
        $assignedBoards = [];
        foreach ($boardIds as $boardId) {
            $this->organizationBoardService->getOrCreate($organizationId, $boardId);
            $assignedBoards[] = $boardId;
        }
        return $assignedBoards;
    }

    private function createSuccessResponse(array $assignedBoards): array
    {
        return [
            'success' => true,
            'message' => 'Boards assigned successfully',
            'assigned_boards' => $assignedBoards
        ];
    }

    private function handleValidationError(AssignBoardsForm $form): array
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