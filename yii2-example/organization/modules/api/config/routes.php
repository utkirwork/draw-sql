<?php

use yii\rest\UrlRule;

return [
    [
        'class' => UrlRule::class,
        'controller' => 'v1/organization/organization',
        'pluralize' => false,
        'extraPatterns' => [
            'OPTIONS {id}' => 'options',
            'OPTIONS <action>' => 'options',
            'OPTIONS <action>/<id:>' => 'options',
            'POST assign-departments/<id:>' => 'assign-departments',
            'POST assign-boards/<id:>' => 'assign-boards',
            'POST assign-projects/<id:>' => 'assign-projects',
            'DELETE unassign-departments/<id:>' => 'unassign-departments',
            'DELETE unassign-boards/<id:>' => 'unassign-boards',
            'DELETE unassign-projects/<id:>' => 'unassign-projects',
            'GET departments/<id:>' => 'get-departments',
            'GET boards/<id:>' => 'get-boards',
            'GET projects/<id:>' => 'get-projects',
        ]
    ],
]; 