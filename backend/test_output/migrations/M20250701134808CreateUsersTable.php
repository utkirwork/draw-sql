<?php

namespace xbsoft\blog\migrations;

use console\models\BaseMigrate;
use console\models\ForeignGenerateDTO;
use yii\helpers\ArrayHelper;

/**
 * Class M20250701134808CreateUsersTable
 * Migration to create users table
 */
class M20250701134808CreateUsersTable extends BaseMigrate
{
    public $is_alter_table = false;

    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $options = null;
        if ($this->getDb()->getDriverName() == 'mysql') {
            $options = "character set utf8 collate utf8_general_ci engine=InnoDB";
        }

        $this->createTable($this->getTableNameWithSchemeName(), ArrayHelper::merge([
            'id' => $this->string->notNull(),
            'username' => $this->string->notNull(),
            'email' => $this->string->notNull(),
            'password_hash' => $this->string->notNull(),
            'role' => $this->string->notNull(),
        ], $this->getDefaultColumns()), $options);

        parent::safeUp();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable($this->getTableNameWithSchemeName());
        parent::safeDown();
    }

    /**
     * @return array
     */
    public function getIndexes(): array
    {
        return [
        ];
    }

    /**
     * @return string
     */
    public function getTableName(): string
    {
        return 'users';
    }

    /**
     * @return string
     */
    public function getSchemeName(): string
    {
        return 'public';
    }

    /**
     * @return ForeignGenerateDTO[]
     */
    public function getForeignKeys(): array
    {
        return [
        ];
    }
} 