<?php

namespace xbsoft\organization\migrations;

use console\models\BaseMigrate;
use console\models\ForeignGenerateDTO;
use yii\helpers\ArrayHelper;

/**
 * Class M241230120001CreateTableOrganizations
 * Migration to create organizations table
 */
class M241230120001CreateTableOrganizations extends BaseMigrate
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
            'id' => $this->bigPrimaryKey()->comment('ID'),
            'title' => $this->string()->notNull()->comment('Organization Title'),
            'description' => $this->text()->defaultValue(null)->comment('Organization Description'),
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
            'title',
        ];
    }

    /**
     * @return string
     */
    public function getTableName(): string
    {
        return 'organizations';
    }

    /**
     * @return string
     */
    public function getSchemeName(): string
    {
        return 'organization';
    }

    /**
     * @return ForeignGenerateDTO[]
     */
    public function getForeignKeys(): array
    {
        return [];
    }
} 