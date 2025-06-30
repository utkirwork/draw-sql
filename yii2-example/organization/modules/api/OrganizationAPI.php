<?php

namespace xbsoft\organization\modules\api;

use yii\filters\auth\CompositeAuth;
use yii\filters\auth\HttpBearerAuth;
use yii\helpers\ArrayHelper;

class OrganizationAPI extends \yii\base\Module
{
    const PREFIX_API = "v1/organization/";
    const MODULE_NAME = "organization";

    /**
     * @return array
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = $this->getAuthenticator();
        return $behaviors;
    }

    /**
     * @return array
     */
    private function getAuthenticator()
    {
        return ArrayHelper::merge([
            'class' => CompositeAuth::className(),
            'authMethods' => [
                HttpBearerAuth::className(),
            ],
        ], require_once \Yii::getAlias('@xbsoft/organization/modules/api/config/authenticator.php'));
    }
} 