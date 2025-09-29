<?php

namespace xbsoft\blog\migrations;

use console\models\BaseMigrate;
use console\models\ForeignGenerateDTO;
use yii\helpers\ArrayHelper;

/**
 * Class M20250701135738CreateCategoriesTable
 * Migration to create categories table
 */
class M20250701135738CreateCategoriesTable extends BaseMigrate
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
            'name' => $this->string->notNull(),
            'slug' => $this->string->notNull(),
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
        return 'categories';
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