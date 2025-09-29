<?php

namespace xbsoft\blog\migrations;

use console\models\BaseMigrate;
use console\models\ForeignGenerateDTO;
use yii\helpers\ArrayHelper;

/**
 * Class M20250701135418CreateCommentsTable
 * Migration to create comments table
 */
class M20250701135418CreateCommentsTable extends BaseMigrate
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
            'post_id' => $this->string->notNull(),
            'author_id' => $this->string->notNull(),
            'content' => $this->text->notNull(),
            'created_at' => $this->timestamp->notNull(),
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
        return 'comments';
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
            new ForeignGenerateDTO([
                'column' => 'post_id',
                'refTable' => 'posts',
                'refColumn' => 'id',
                'onDelete' => 'CASCADE',
                'onUpdate' => 'CASCADE'
            ]),
            new ForeignGenerateDTO([
                'column' => 'author_id',
                'refTable' => 'users',
                'refColumn' => 'id',
                'onDelete' => 'CASCADE',
                'onUpdate' => 'CASCADE'
            ]),
        ];
    }
} 