<?php

namespace xbsoft\organization\modules\api\actions;

use xbsoft\organization\modules\api\forms\UnassignProjectsForm;
use xbsoft\organization\service\OrganizationProjectService;
use xbsoft\organization\repository\OrganizationRepository;
use Yii;
use yii\base\Action;
use yii\web\Response;
use yii\web\NotFoundHttpException;

/**
 * Unassign Projects from Organization Action
 */
class UnassignProjectsAction extends Action
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
     * @OA\Delete(
     *   path="/v1/organization/organization/unassign-projects/{id}",
     *   tags={"organization"},
     *   summary="Unassign Projects from Organization",
     *   description="Remove multiple projects from an organization",
     *   operationId="organizationUnassignProjects",
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
     *           @OA\Schema(ref="#/components/schemas/UnassignProjectsForm")
     *       )
     *   ),
     *   @OA\Response(
     *       response=200,
     *       description="Success: Projects Unassigned",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(property="success", type="boolean"),
     *               @OA\Property(property="message", type="string"),
     *               @OA\Property(property="unassigned_projects", type="array", @OA\Items(type="integer"))
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
            $unassignedProjects = $this->unassignProjects($id, $form->project_ids);
            return $this->createSuccessResponse($unassignedProjects);
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

    private function createAndValidateForm(): UnassignProjectsForm
    {
        $form = new UnassignProjectsForm();
        $form->load(Yii::$app->request->post(), '');
        return $form;
    }

    private function unassignProjects($organizationId, array $projectIds): array
    {
        $unassignedProjects = [];
        foreach ($projectIds as $projectId) {
            $this->organizationProjectService->unassignProjectFromOrganization($organizationId, $projectId);
            $unassignedProjects[] = $projectId;
        }
        return $unassignedProjects;
    }

    private function createSuccessResponse(array $unassignedProjects): array
    {
        return [
            'success' => true,
            'message' => 'Projects unassigned successfully',
            'unassigned_projects' => $unassignedProjects
        ];
    }

    private function handleValidationError(UnassignProjectsForm $form): array
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