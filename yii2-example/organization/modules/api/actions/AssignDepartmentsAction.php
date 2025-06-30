<?php

namespace xbsoft\organization\modules\api\actions;

use xbsoft\organization\modules\api\forms\AssignDepartmentsForm;
use xbsoft\organization\service\OrganizationDepartmentService;
use xbsoft\organization\repository\OrganizationRepository;
use Yii;
use yii\base\Action;
use yii\web\Response;
use yii\web\NotFoundHttpException;

/**
 * Assign Departments to Organization Action
 */
class AssignDepartmentsAction extends Action
{
    private $organizationDepartmentService;
    private $organizationRepository;

    public function __construct($id, $controller, OrganizationDepartmentService $organizationDepartmentService, OrganizationRepository $organizationRepository, $config = [])
    {
        $this->organizationDepartmentService = $organizationDepartmentService;
        $this->organizationRepository = $organizationRepository;
        parent::__construct($id, $controller, $config);
    }
    /**
     * @OA\Post(
     *   path="/v1/organization/organization/assign-departments/{id}",
     *   tags={"organization"},
     *   summary="Assign Departments to Organization",
     *   description="Assign multiple departments to an organization",
     *   operationId="organizationAssignDepartments",
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
     *           @OA\Schema(ref="#/components/schemas/AssignDepartmentsForm")
     *       )
     *   ),
     *   @OA\Response(
     *       response=200,
     *       description="Success: Departments Assigned",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(property="success", type="boolean"),
     *               @OA\Property(property="message", type="string"),
     *               @OA\Property(property="assigned_departments", type="array", @OA\Items(type="integer"))
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
            $assignedDepartments = $this->assignDepartments($id, $form->department_ids);
            return $this->createSuccessResponse($assignedDepartments);
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

    private function createAndValidateForm(): AssignDepartmentsForm
    {
        $form = new AssignDepartmentsForm();
        $form->load(Yii::$app->request->post(), '');
        return $form;
    }

    private function assignDepartments($organizationId, array $departmentIds): array
    {
        $assignedDepartments = [];
        foreach ($departmentIds as $departmentId) {
            $this->organizationDepartmentService->getOrCreate($organizationId, $departmentId);
            $assignedDepartments[] = $departmentId;
        }
        return $assignedDepartments;
    }

    private function createSuccessResponse(array $assignedDepartments): array
    {
        return [
            'success' => true,
            'message' => 'Departments assigned successfully',
            'assigned_departments' => $assignedDepartments
        ];
    }

    private function handleValidationError(AssignDepartmentsForm $form): array
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