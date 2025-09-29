<?php

namespace xbsoft\blog\modules\api\controllers;

use xbsoft\blog\models\Categories;
use xbsoft\blog\models\search\CategoriesSearch;
use yii\rest\ActiveController;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\rest\CreateAction;
use yii\rest\IndexAction;
use yii\rest\UpdateAction;
use yii\rest\ViewAction;
use yii\rest\DeleteAction;

/**
 * Categories Controller
 * 
 * @OA\Tag(
 *     name="categories",
 *     description="Categories management"
 * )
 */
class CategoriesController extends ActiveController
{
    public $modelClass = Categories::class;

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
                'class' => DeleteAction::class,
                'modelClass' => $this->modelClass,
            ],
            'index' => [
                'class' => IndexAction::class,
                'modelClass' => $this->modelClass,
                'dataFilter' => [
                    'class' => \yii\data\ActiveDataFilter::class,
                    'searchModel' => CategoriesSearch::class
                ]
            ],
            'options' => [
                'class' => 'yii\rest\OptionsAction',
                'resourceOptions' => ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'POST'],
                'collectionOptions' => ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'POST'],
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
                'options' => ['OPTIONS'],
            ],
        ];

        return $behaviors;
    }

    /**
     * Finds the Categories model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Categories the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Categories::findOne($id)) !== null) {
            return $model;
        }

        throw new NotFoundHttpException('The requested page does not exist.');
    }
} 