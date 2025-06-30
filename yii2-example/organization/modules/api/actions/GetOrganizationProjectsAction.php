<?php

namespace xbsoft\organization\modules\api\actions;

use xbsoft\organization\repository\OrganizationRepository;
use xbsoft\organization\repository\OrganizationProjectRepository;
use Yii;
use yii\base\Action;
use yii\web\NotFoundHttpException;
use yii\data\ActiveDataProvider;
use xbsoft\organization\models\OrganizationProject;

/**
 * Get Organization Projects Action
 */
class GetOrganizationProjectsAction extends Action
{
    private $organizationRepository;
    private $projectRepository;

    public function __construct($id, $controller, OrganizationRepository $organizationRepository, OrganizationProjectRepository $projectRepository, $config = [])
    {
        $this->organizationRepository = $organizationRepository;
        $this->projectRepository = $projectRepository;
        parent::__construct($id, $controller, $config);
    }

    /**
     * @OA\Get(
     *   path="/v1/organization/organization/projects/{id}",
     *   tags={"organization"},
     *   summary="Get Organization Projects",
     *   description="Get all projects assigned to an organization",
     *   operationId="organizationGetProjects",
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
     *       description="Success: List of Organization Projects",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="array",
     *               @OA\Items(
     *                   type="object",
     *                   @OA\Property(property="id", type="integer"),
     *                   @OA\Property(property="organization_id", type="integer"),
     *                   @OA\Property(property="project_id", type="integer"),
     *                   @OA\Property(property="project_name", type="string"),
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

        $query = OrganizationProject::find()->isNotDeleted()->organizationId($id);

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

    private function getProjectsByOrganizationId($id): array
    {
        // Deprecated method, kept for backward compatibility.
        return $this->projectRepository->getAllByOrganizationId($id);
    }
} 