<?php

namespace xbsoft\organization\modules\api\actions;

use xbsoft\organization\modules\api\forms\UnassignDepartmentsForm;
use xbsoft\organization\service\OrganizationDepartmentService;
use xbsoft\organization\repository\OrganizationDepartmentRepository;
use xbsoft\organization\repository\OrganizationRepository;
use Yii;
use yii\base\Action;
use yii\web\Response;
use yii\web\NotFoundHttpException;

/**
 * Unassign Departments from Organization Action
 */
class UnassignDepartmentsAction extends Action
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
     * @OA\Delete(
     *   path="/v1/organization/organization/unassign-departments/{id}",
     *   tags={"organization"},
     *   summary="Unassign Departments from Organization",
     *   description="Remove multiple departments from an organization",
     *   operationId="organizationUnassignDepartments",
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
     *           @OA\Schema(ref="#/components/schemas/UnassignDepartmentsForm")
     *       )
     *   ),
     *   @OA\Response(
     *       response=200,
     *       description="Success: Departments Unassigned",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(property="success", type="boolean"),
     *               @OA\Property(property="message", type="string"),
     *               @OA\Property(property="unassigned_departments", type="array", @OA\Items(type="integer"))
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
            $unassignedDepartments = $this->unassignDepartments($id, $form->department_ids);
            return $this->createSuccessResponse($unassignedDepartments);
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

    private function createAndValidateForm(): UnassignDepartmentsForm
    {
        $form = new UnassignDepartmentsForm();
        $form->load(Yii::$app->request->post(), '');
        return $form;
    }

    private function unassignDepartments($organizationId, array $departmentIds): array
    {
        $unassignedDepartments = [];
        foreach ($departmentIds as $departmentId) {
            $this->organizationDepartmentService->unassignDepartmentFromOrganization($organizationId, $departmentId);
            $unassignedDepartments[] = $departmentId;
        }
        return $unassignedDepartments;
    }

    private function createSuccessResponse(array $unassignedDepartments): array
    {
        return [
            'success' => true,
            'message' => 'Departments unassigned successfully',
            'unassigned_departments' => $unassignedDepartments
        ];
    }

    private function handleValidationError(UnassignDepartmentsForm $form): array
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