<?php

namespace xbsoft\blog\migrations;

use console\models\BaseMigrate;
use console\models\ForeignGenerateDTO;
use yii\helpers\ArrayHelper;

/**
 * Class M20250701134855CreatePostsTable
 * Migration to create posts table
 */
class M20250701134855CreatePostsTable extends BaseMigrate
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
            'title' => $this->string->notNull(),
            'content' => $this->text->notNull(),
            'author_id' => $this->string->notNull(),
            'category_id' => $this->string->notNull(),
            'published_at' => $this->timestamp,
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
        return 'posts';
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
                'column' => 'author_id',
                'refTable' => 'users',
                'refColumn' => 'id',
                'onDelete' => 'CASCADE',
                'onUpdate' => 'CASCADE'
            ]),
            new ForeignGenerateDTO([
                'column' => 'category_id',
                'refTable' => 'categories',
                'refColumn' => 'id',
                'onDelete' => 'CASCADE',
                'onUpdate' => 'CASCADE'
            ]),
        ];
    }
} 