<?php

namespace xbsoft\organization\modules\api\actions;

use xbsoft\organization\modules\api\forms\CreateOrganizationForm;
use xbsoft\organization\service\OrganizationService;
use Yii;
use yii\base\Action;
use yii\web\Response;

/**
 * Create Organization Action
 */
class CreateOrganizationAction extends Action
{
    private $organizationService;

    public function __construct($id, $controller, OrganizationService $organizationService, $config = [])
    {
        $this->organizationService = $organizationService;
        parent::__construct($id, $controller, $config);
    }
    /**
     * @OA\Post(
     *   path="/v1/organization/organization",
     *   tags={"organization"},
     *   summary="Create Organization",
     *   description="Create a new organization",
     *   operationId="organizationCreate",
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(
     *       required=true,
     *       @OA\MediaType(
     *           mediaType="application/x-www-form-urlencoded",
     *           @OA\Schema(ref="#/components/schemas/CreateOrganizationForm")
     *       )
     *   ),
     *   @OA\Response(
     *       response=200,
     *       description="Success: Organization Created",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(ref="#/components/schemas/Organization")
     *       )
     *   ),
     *   @OA\Response(
     *       response=400,
     *       description="Bad Request",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               @OA\Property(property="message", type="string"),
     *               @OA\Property(property="errors", type="object")
     *           )
     *       )
     *   ),
     *   @OA\Response(
     *       response=422,
     *       description="Validation Error",
     *       @OA\MediaType(
     *           mediaType="application/json",
     *           @OA\Schema(
     *               @OA\Property(property="field", type="string"),
     *               @OA\Property(property="message", type="string")
     *           )
     *       )
     *   )
     * )
     */
    public function run()
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        
        $form = $this->createAndValidateForm();
        if (!$form->validate()) {
            return $this->handleValidationError($form);
        }
        
        try {
            $organization = $this->organizationService->create($form->getCreateDTO());
            return $organization->toArray();
        } catch (\Exception $e) {
            return $this->handleBusinessError($e);
        }
    }

    private function createAndValidateForm(): CreateOrganizationForm
    {
        $form = new CreateOrganizationForm();
        $form->load(Yii::$app->request->post(), '');
        return $form;
    }

    private function handleValidationError(CreateOrganizationForm $form): array
    {
        Yii::$app->response->statusCode = 422;
        return $form->getErrors();
    }

    private function handleBusinessError(\Exception $e): array
    {
        Yii::$app->response->statusCode = 400;
        return [
            'message' => $e->getMessage(),
            'errors' => []
        ];
    }
} 