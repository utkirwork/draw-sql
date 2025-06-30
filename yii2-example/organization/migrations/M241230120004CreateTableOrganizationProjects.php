<?php

namespace xbsoft\organization\migrations;

use console\models\BaseMigrate;
use console\models\ForeignGenerateDTO;
use yii\helpers\ArrayHelper;

/**
 * Class M241230120004CreateTableOrganizationProjects
 * Migration to create organization_projects table
 */
class M241230120004CreateTableOrganizationProjects extends BaseMigrate
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
            'organization_id' => $this->bigInteger()->notNull()->comment('Organization ID'),
            'project_id' => $this->integer()->notNull()->comment('Project ID'),
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
            'organization_id',
            'project_id',
        ];
    }

    /**
     * @return string
     */
    public function getTableName(): string
    {
        return 'organization_projects';
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
        return [
            new ForeignGenerateDTO([
                'columns' => 'organization_id',
                'refTable' => 'organization.organizations',
                'refTableColumns' => 'id',
                'onDelete' => 'RESTRICT'
            ]),
            new ForeignGenerateDTO([
                'columns' => 'project_id',
                'refTable' => 'project.projects',
                'refTableColumns' => 'id',
                'onDelete' => 'RESTRICT'
            ])
        ];
    }
} 