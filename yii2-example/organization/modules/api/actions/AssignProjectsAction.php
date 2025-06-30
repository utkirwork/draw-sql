<?php

namespace xbsoft\organization\modules\api\actions;

use xbsoft\organization\modules\api\forms\AssignProjectsForm;
use xbsoft\organization\service\OrganizationProjectService;
use xbsoft\organization\repository\OrganizationRepository;
use Yii;
use yii\base\Action;
use yii\web\Response;
use yii\web\NotFoundHttpException;

/**
 * Assign Projects to Organization Action
 */
class AssignProjectsAction extends Action
{
    private $organizationProjectService;
    private $organizationRepository;

    public function __construct($id, $controller, OrganizationProjectService $organizationProjectService, OrganizationRepository $organizationRepository, $config = [])
    {
        $this->organizationProjectService = $organizationProjectService;
        $this->organizationRepository = $organizationRepository;
        parent::__construct($id, $controller, $config);
    }
    /**
     * @OA\Post(
     *   path="/v1/organization/organization/assign-projects/{id}",
     *   tags={"organization"},
     *   summary="Assign Projects to Organization",
     *   description="Assign multiple projects to an organization",
     *   operationId="organizationAssignProjects",
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
     *           @OA\Schema(ref="#/components/schemas/AssignProjectsForm")
     *       )
     *   ),
     *   @OA\Response(
     *       response=200,
     *       description="Success: Projects Assigned",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(property="success", type="boolean"),
     *               @OA\Property(property="message", type="string"),
     *               @OA\Property(property="assigned_projects", type="array", @OA\Items(type="integer"))
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
            $assignedProjects = $this->assignProjects($id, $form->project_ids);
            return $this->createSuccessResponse($assignedProjects);
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

    private function createAndValidateForm(): AssignProjectsForm
    {
        $form = new AssignProjectsForm();
        $form->load(Yii::$app->request->post(), '');
        return $form;
    }

    private function assignProjects($organizationId, array $projectIds): array
    {
        $assignedProjects = [];
        foreach ($projectIds as $projectId) {
            $this->organizationProjectService->getOrCreate($organizationId, $projectId);
            $assignedProjects[] = $projectId;
        }
        return $assignedProjects;
    }

    private function createSuccessResponse(array $assignedProjects): array
    {
        return [
            'success' => true,
            'message' => 'Projects assigned successfully',
            'assigned_projects' => $assignedProjects
        ];
    }

    private function handleValidationError(AssignProjectsForm $form): array
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