<?php
$routes = [];
$routes_v1 = require_once \Yii::getAlias("@xbsoft/organization/modules/api/config/routes.php");
return \yii\helpers\ArrayHelper::merge($routes, $routes_v1); 