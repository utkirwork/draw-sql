<?php

namespace xbsoft\organization\modules\api\actions;

use xbsoft\organization\repository\OrganizationRepository;
use xbsoft\organization\repository\OrganizationDepartmentRepository;
use Yii;
use yii\base\Action;
use yii\web\NotFoundHttpException;
use yii\data\ActiveDataProvider;
use xbsoft\organization\models\OrganizationDepartment;

/**
 * Get Organization Departments Action
 */
class GetOrganizationDepartmentsAction extends Action
{
    private $organizationRepository;
    private $departmentRepository;

    public function __construct($id, $controller, OrganizationRepository $organizationRepository, OrganizationDepartmentRepository $departmentRepository, $config = [])
    {
        $this->organizationRepository = $organizationRepository;
        $this->departmentRepository = $departmentRepository;
        parent::__construct($id, $controller, $config);
    }

    /**
     * @OA\Get(
     *   path="/v1/organization/organization/departments/{id}",
     *   tags={"organization"},
     *   summary="Get Organization Departments",
     *   description="Get all departments assigned to an organization",
     *   operationId="organizationGetDepartments",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(
     *       name="id",
     *       in="path",
     *       description="Organization ID",
     *       required=true,
     *       @OA\Schema(type="integer", format="int64")
     *   ),
     *   @OA\Response(
     *       response=200,
     *       description="Success: List of Organization Departments",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="array",
     *               @OA\Items(
     *                   type="object",
     *                   @OA\Property(property="id", type="integer"),
     *                   @OA\Property(property="organization_id", type="integer"),
     *                   @OA\Property(property="department_id", type="integer"),
     *                   @OA\Property(property="department_name", type="string"),
     *                   @OA\Property(property="created_at", type="string", format="date-time"),
     *                   @OA\Property(property="updated_at", type="string", format="date-time")
     *               )
     *           )
     *       )
     *   ),
     *   @OA\Response(
     *       response=404,
     *       description="Organization Not Found"
     *   )
     * )
     */
    public function run($id)
    {
        $this->validateOrganizationExists($id);

        $query = OrganizationDepartment::find()->isNotDeleted()->organizationId($id);

        return new ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => Yii::$app->request->get('per-page', 20),
            ],
        ]);
    }

    private function validateOrganizationExists($id): void
    {
        $organization = $this->organizationRepository->getById($id);
        if (!$organization) {
            throw new NotFoundHttpException('Organization not found');
        }
    }

    private function getDepartmentsByOrganizationId($id): array
    {
        // Deprecated: retained for backward compatibility but no longer used.
        return $this->departmentRepository->getAllByOrganizationId($id);
    }
} 