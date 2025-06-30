<?php

namespace xbsoft\organization\modules\api\controllers;

use xbsoft\organization\models\Organization;
use xbsoft\organization\models\search\OrganizationSearch;
use api\modules\v1\DefaultController;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\rest\CreateAction;
use yii\rest\IndexAction;
use yii\rest\UpdateAction;
use yii\rest\ViewAction;
use yii\rest\DeleteAction;
use api\actions\RestoreAction;
use xbsoft\organization\modules\api\actions\GetOrganizationDepartmentsAction;
use xbsoft\organization\modules\api\actions\GetOrganizationBoardsAction;
use xbsoft\organization\modules\api\actions\AssignDepartmentsAction;
use xbsoft\organization\modules\api\actions\AssignBoardsAction;
use xbsoft\organization\modules\api\actions\UnassignDepartmentsAction;
use xbsoft\organization\modules\api\actions\UnassignBoardsAction;
use xbsoft\organization\modules\api\actions\CreateOrganizationAction;

/**
 * Organization Controller
 * 
 * @OA\Tag(
 *     name="organization",
 *     description="Organization management"
 * )
 */
class OrganizationController extends DefaultController
{
    public $modelClass = Organization::class;
    public $modelSearch = OrganizationSearch::class;

    /**
     * @inheritdoc
     */
    public function actions()
    {
        return [
            'view' => [
                'class' => ViewAction::class,
                'modelClass' => $this->modelClass,
            ],
            'create' => [
                'class' => CreateAction::class,
                'modelClass' => $this->modelClass,
            ],
            'update' => [
                'class' => UpdateAction::class,
                'modelClass' => $this->modelClass,
            ],
            'delete' => [
                'class' => \api\actions\SoftDeleteAction::class,
                'modelClass' => $this->modelClass,
            ],
            'restore' => [
                'class' => RestoreAction::class,
                'modelClass' => $this->modelClass,
            ],
            'index' => [
                'class' => IndexAction::class,
                'modelClass' => $this->modelClass,
                'dataFilter' => [
                    'class' => \yii\data\ActiveDataFilter::class,
                    'searchModel' => $this->modelSearch
                ]
            ],
            'options' => [
                'class' => 'yii\rest\OptionsAction',
                'resourceOptions' => ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'POST'],
                'collectionOptions' => ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'POST'],
            ],
            'get-departments' => [
                'class' => GetOrganizationDepartmentsAction::class,
            ],
            'get-boards' => [
                'class' => GetOrganizationBoardsAction::class,
            ],
            'get-projects' => [
                'class' => \xbsoft\organization\modules\api\actions\GetOrganizationProjectsAction::class,
            ],
            'assign-departments' => [
                'class' => AssignDepartmentsAction::class,
            ],
            'assign-boards' => [
                'class' => AssignBoardsAction::class,
            ],
            'assign-projects' => [
                'class' => \xbsoft\organization\modules\api\actions\AssignProjectsAction::class,
            ],
            'unassign-departments' => [
                'class' => UnassignDepartmentsAction::class,
            ],
            'unassign-boards' => [
                'class' => UnassignBoardsAction::class,
            ],
            'unassign-projects' => [
                'class' => \xbsoft\organization\modules\api\actions\UnassignProjectsAction::class,
            ],
            'create-organization' => [
                'class' => CreateOrganizationAction::class,
            ],
        ];
    }

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        
        $behaviors['verbs'] = [
            'class' => VerbFilter::class,
            'actions' => [
                'index' => ['GET', 'HEAD', 'OPTIONS'],
                'view' => ['GET', 'HEAD', 'OPTIONS'],
                'create' => ['POST', 'OPTIONS'],
                'update' => ['PUT', 'PATCH', 'OPTIONS'],
                'delete' => ['DELETE', 'OPTIONS'],
                'restore' => ['PATCH', 'OPTIONS'],
                'options' => ['OPTIONS'],
                'get-departments' => ['GET', 'OPTIONS'],
                'get-boards' => ['GET', 'OPTIONS'],
                'get-projects' => ['GET', 'OPTIONS'],
                'assign-departments' => ['POST', 'OPTIONS'],
                'assign-boards' => ['POST', 'OPTIONS'],
                'assign-projects' => ['POST', 'OPTIONS'],
                'unassign-departments' => ['DELETE', 'OPTIONS'],
                'unassign-boards' => ['DELETE', 'OPTIONS'],
                'unassign-projects' => ['DELETE', 'OPTIONS'],
                'create-organization' => ['POST', 'OPTIONS'],
            ],
        ];

        return $behaviors;
    }

    /**
     * @OA\Get(
     *   path="/v1/organization/organization",
     *   tags={"organization"},
     *   summary="Get list of organizations",
     *   description="Returns a paginated list of organizations with optional filtering",
     *   operationId="getOrganizations",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(
     *       name="page",
     *       in="query",
     *       description="Page number for pagination",
     *       required=false,
     *       @OA\Schema(type="integer", minimum=1, default=1)
     *   ),
     *   @OA\Parameter(
     *       name="per-page",
     *       in="query", 
     *       description="Number of items per page",
     *       required=false,
     *       @OA\Schema(type="integer", minimum=1, maximum=100, default=20)
     *   ),
     *   @OA\Parameter(
     *       name="filter",
     *       in="query",
     *       description="Filter organizations by various criteria",
     *       required=false,
     *       @OA\Schema(type="object")
     *   ),
     *   @OA\Parameter(
     *       name="sort",
     *       in="query",
     *       description="Sort organizations by field",
     *       required=false,
     *       @OA\Schema(type="string")
     *   ),
     *   @OA\Response(
     *       response=200,
     *       description="Success: Organizations list",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="array",
     *               @OA\Items(
     *                   type="object",
     *                   @OA\Property(property="id", type="integer"),
     *                   @OA\Property(property="name", type="string"),
     *                   @OA\Property(property="description", type="string"),
     *                   @OA\Property(property="created_at", type="string", format="date-time"),
     *                   @OA\Property(property="updated_at", type="string", format="date-time")
     *               )
     *           )
     *       )
     *   ),
     *   @OA\Response(
     *       response=401,
     *       description="Unauthorized"
     *   ),
     *   @OA\Response(
     *       response=403,
     *       description="Forbidden"
     *   )
     * )
     */

    /**
     * @OA\Get(
     *   path="/v1/organization/organization/{id}",
     *   tags={"organization"},
     *   summary="Get organization by ID",
     *   description="Get single organization details by ID",
     *   operationId="getOrganization",
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
     *       description="Success: Organization details",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               type="object",
     *               @OA\Property(property="id", type="integer"),
     *               @OA\Property(property="name", type="string"),
     *               @OA\Property(property="description", type="string"),
     *               @OA\Property(property="created_at", type="string", format="date-time"),
     *               @OA\Property(property="updated_at", type="string", format="date-time")
     *           )
     *       )
     *   ),
     *   @OA\Response(
     *       response=404,
     *       description="Organization Not Found"
     *   ),
     *   @OA\Response(
     *       response=401,
     *       description="Unauthorized"
     *   ),
     *   @OA\Response(
     *       response=403,
     *       description="Forbidden"
     *   )
     * )
     */

    /**
     * @OA\Delete(
     *   path="/v1/organization/organization/{id}",
     *   tags={"organization"},
     *   summary="Delete organization",
     *   description="Soft-delete an organization by ID",
     *   operationId="deleteOrganization",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(
     *       name="id",
     *       in="path",
     *       description="Organization ID",
     *       required=true,
     *       @OA\Schema(type="integer", format="int64")
     *   ),
     *   @OA\Response(
     *       response=204,
     *       description="Organization successfully deleted"
     *   ),
     *   @OA\Response(
     *       response=404,
     *       description="Organization Not Found"
     *   ),
     *   @OA\Response(
     *       response=401,
     *       description="Unauthorized"
     *   ),
     *   @OA\Response(
     *       response=403,
     *       description="Forbidden"
     *   )
     * )
     */
} 