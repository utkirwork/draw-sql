<?php

namespace xbsoft\organization\migrations;

use console\models\BaseMigrate;
use yii\db\Migration;

/**
 * Class M241230120000CreateSchemaOrganization
 * Migration to create organization schema
 */
class M241230120000CreateSchemaOrganization extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('CREATE SCHEMA IF NOT EXISTS organization');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('DROP SCHEMA IF EXISTS organization CASCADE');
    }
} 