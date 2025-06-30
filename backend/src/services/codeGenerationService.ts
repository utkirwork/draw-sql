import Handlebars from 'handlebars';
import archiver from 'archiver';
import { Readable } from 'stream';
import path from 'path';

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  primary_key: boolean;
  foreign_key?: {
    table: string;
    column: string;
  };
  default_value?: any;
  length?: number;
  comment?: string;
}

export interface TableRelation {
  type: 'hasOne' | 'hasMany' | 'belongsTo';
  target_table: string;
  foreign_key: string;
  local_key: string;
}

export interface DatabaseTable {
  name: string;
  columns: TableColumn[];
  relations: TableRelation[];
  schema?: string;
}

export interface DiagramData {
  name: string;
  schema: string;
  tables: DatabaseTable[];
}

export class CodeGenerationService {
  private templates: { [key: string]: HandlebarsTemplateDelegate } = {};

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Yii2 Migration Template
    this.templates.yii2Migration = Handlebars.compile(`<?php

namespace {{namespace}}\\migrations;

use console\\models\\BaseMigrate;
use console\\models\\ForeignGenerateDTO;
use yii\\helpers\\ArrayHelper;

/**
 * Class {{migrationClassName}}
 * Migration to create {{tableName}} table
 */
class {{migrationClassName}} extends BaseMigrate
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
{{#each columns}}
            '{{this.name}}' => $this->{{this.yiiType}}{{#if this.nullable}}{{{else}}}->notNull(){{/if}}{{#if this.comment}}->comment('{{this.comment}}'){{/if}},
{{/each}}
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
{{#each indexes}}
            '{{this}}',
{{/each}}
        ];
    }

    /**
     * @return string
     */
    public function getTableName(): string
    {
        return '{{tableName}}';
    }

    /**
     * @return string
     */
    public function getSchemeName(): string
    {
        return '{{schemaName}}';
    }

    /**
     * @return ForeignGenerateDTO[]
     */
    public function getForeignKeys(): array
    {
        return [
{{#each foreignKeys}}
            new ForeignGenerateDTO([
                'column' => '{{column}}',
                'refTable' => '{{refTable}}',
                'refColumn' => '{{refColumn}}',
                'onDelete' => 'CASCADE',
                'onUpdate' => 'CASCADE'
            ]),
{{/each}}
        ];
    }
}
`);

    // Yii2 Model Template
    this.templates.yii2Model = Handlebars.compile(`<?php

namespace {{namespace}}\\models;

use {{namespace}}\\models\\scope\\{{className}}ScopeTrait;
use {{namespace}}\\models\\relation\\{{className}}RelationTrait;
use {{namespace}}\\models\\getter\\{{className}}GetterTrait;
use {{namespace}}\\models\\setter\\{{className}}SetterTrait;

/**
 * This is the model class for table "{{schemaName}}.{{tableName}}".
 *
 * @OA\\Schema(
 *     description="{{className}} model representing {{description}}"
 * )
{{#each columns}}
 * @property {{this.phpType}} {{#if this.nullable}}${{this.name}}{{else}}${{this.name}}{{/if}} {{this.comment}}
{{/each}}
 */
class {{className}} extends \\yii\\db\\ActiveRecord
{
    use {{className}}ScopeTrait;
    use {{className}}RelationTrait;
    use {{className}}GetterTrait;
    use {{className}}SetterTrait;

{{#each columns}}
     /**
      * @OA\\Property(
      *   property="{{this.name}}",
      *   type="{{this.swaggerType}}",
      *   description="{{this.comment}}"
      * )
      */
{{/each}}

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{schemaName}}.{{tableName}}';
    }

    /**
     * {@inheritdoc}
     * @return \\{{namespace}}\\models\\query\\{{className}}Query the active query used by this AR class.
     */
    public static function find(): \\{{namespace}}\\models\\query\\{{className}}Query
    {
        return new \\{{namespace}}\\models\\query\\{{className}}Query(get_called_class());
    }
}
`);

    // Yii2 Repository Template
    this.templates.yii2Repository = Handlebars.compile(`<?php

namespace {{namespace}}\\repository;

use {{namespace}}\\models\\{{className}};

/**
 * This is the Repository class for [[\\{{namespace}}\\models\\{{className}}]].
 *
 * @see \\{{namespace}}\\models\\{{className}}
 */
class {{className}}Repository
{
    /**
     * Get {{lowerClassName}} by ID
     *
     * @param int $value
     * @return {{className}}|null
     */
    public function getById($value): ?{{className}}
    {
        return {{className}}::find()->id($value)->one();
    }

{{#each uniqueColumns}}
     /**
      * Get {{../lowerClassName}} by {{this.name}}
      *
      * @param {{this.phpType}} ${{this.name}}
      * @return {{../className}}|null
      */
     public function getBy{{this.pascalName}}(${{this.name}}): ?{{../className}}
     {
         return {{../className}}::find()->{{this.name}}(${{this.name}})->one();
     }
{{/each}}

    /**
     * Get all {{lowerClassName}}s
     *
     * @return array
     */
    public function getAll(): array
    {
        return {{className}}::find()->all();
    }

    /**
     * Save {{lowerClassName}} and throw exception if fails
     *
     * @param {{className}} $model
     * @return {{className}}
     * @throws \\Exception
     */
    public function saveThrow({{className}} $model): {{className}}
    {
        if (!$model->save()) {
            throw new \\Exception("{{className}} is not saved: " . json_encode($model->getErrors()));
        }
        return $model;
    }

    /**
     * Delete {{lowerClassName}} (soft delete)
     *
     * @param {{className}} $model
     * @return bool
     */
    public function delete({{className}} $model): bool
    {
        return $model->delete();
    }

    /**
     * Get count of {{lowerClassName}}s
     *
     * @return int
     */
    public function getCount(): int
    {
        return {{className}}::find()->count();
    }
}
`);

    // Yii2 Service Template
    this.templates.yii2Service = Handlebars.compile(`<?php

namespace {{namespace}}\\service;

use {{namespace}}\\dto\\{{lowerClassName}}\\{{className}}CreateDTO;
use {{namespace}}\\dto\\{{lowerClassName}}\\{{className}}UpdateDTO;
use {{namespace}}\\models\\{{className}};
use {{namespace}}\\repository\\{{className}}Repository;
use yii\\base\\Model;

/**
 * This is the Service class for [[\\{{namespace}}\\models\\{{className}}]].
 *
 * @see {{className}}
 */
class {{className}}Service extends Model
{
    private $repository;

    public function __construct({{className}}Repository $repository, $config = [])
    {
        parent::__construct($config);
        $this->repository = $repository;
    }

    /**
     * Create new {{lowerClassName}}
     *
     * @param {{className}}CreateDTO $createDTO
     * @return {{className}}
     * @throws \\Exception
     */
    public function create({{className}}CreateDTO $createDTO): {{className}}
    {
        $model = new {{className}}();
{{#each editableColumns}}
        $model->set{{pascalName}}($createDTO->{{name}});
{{/each}}

        return $this->repository->saveThrow($model);
    }

    /**
     * Update existing {{lowerClassName}}
     *
     * @param {{className}} $model
     * @param {{className}}UpdateDTO $updateDTO
     * @return {{className}}
     * @throws \\Exception
     */
    public function update({{className}} $model, {{className}}UpdateDTO $updateDTO): {{className}}
    {
{{#each editableColumns}}
        $model->set{{pascalName}}($updateDTO->{{name}});
{{/each}}

        return $this->repository->saveThrow($model);
    }

    /**
     * Delete {{lowerClassName}} (soft delete)
     *
     * @param {{className}} $model
     * @return bool
     */
    public function delete({{className}} $model): bool
    {
        return $this->repository->delete($model);
    }
}
`);

    // Yii2 CreateDTO Template
    this.templates.yii2CreateDTO = Handlebars.compile(`<?php

namespace {{namespace}}\\dto\\{{lowerClassName}};

use yii\\base\\Model;

/**
 * Class {{className}}CreateDTO
 * @package {{namespace}}\\dto\\{{lowerClassName}}
 */
class {{className}}CreateDTO extends Model
{
{{#each editableColumns}}
    public ${{name}};
{{/each}}

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
{{#each requiredColumns}}
            [['{{name}}'], 'required'],
{{/each}}
{{#each stringColumns}}
            [['{{name}}'], 'string'{{#if maxLength}}, 'max' => {{maxLength}}{{/if}}],
{{/each}}
{{#each integerColumns}}
            [['{{name}}'], 'integer'],
{{/each}}
{{#each booleanColumns}}
            [['{{name}}'], 'boolean'],
{{/each}}
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
{{#each editableColumns}}
            '{{name}}' => '{{label}}',
{{/each}}
        ];
    }
}
`);

    // Yii2 ScopeTrait Template
    this.templates.yii2ScopeTrait = Handlebars.compile(`<?php

namespace {{namespace}}\\models\\scope;

use yii\\behaviors\\BlameableBehavior;
use yii\\behaviors\\TimestampBehavior;
use yii\\helpers\\ArrayHelper;
use yii2tech\\ar\\softdelete\\SoftDeleteBehavior;

/**
 * This is the Scope Trait class for [[\\{{namespace}}\\models\\{{className}}]].
 *
 * @see \\{{namespace}}\\models\\{{className}}
 */
trait {{className}}ScopeTrait
{
    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
{{#each requiredColumns}}
            [['{{name}}'], 'required'],
{{/each}}
{{#each stringColumns}}
            [['{{name}}'], 'string'{{#if maxLength}}, 'max' => {{maxLength}}{{/if}}],
{{/each}}
{{#each integerColumns}}
            [['{{name}}'], 'integer'],
{{/each}}
{{#each booleanColumns}}
            [['{{name}}'], 'boolean'],
{{/each}}
{{#each uniqueColumns}}
            [['{{name}}'], 'unique', 'targetAttribute' => ['{{name}}'], 'message' => 'This {{label}} has already been taken.'],
{{/each}}
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'time' => [
                'class' => TimestampBehavior::class,
            ],
            'by' => [
                'class' => BlameableBehavior::class
            ],
            'delete' => [
                'class' => SoftDeleteBehavior::className(),
                'softDeleteAttributeValues' => [
                    'is_deleted' => true,
                    'deleted_at' => time(),
                    'deleted_by' => \\Yii::$app->user->id ?? null
                ],
                'replaceRegularDelete' => true
            ],
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
{{#each columns}}
            '{{name}}' => '{{label}}',
{{/each}}
        ];
    }
}
`);
  }

  private mapDataType(dbType: string): { yiiType: string; phpType: string; swaggerType: string } {
    const typeMap: { [key: string]: { yiiType: string; phpType: string; swaggerType: string } } = {
      'varchar': { yiiType: 'string()', phpType: 'string', swaggerType: 'string' },
      'text': { yiiType: 'text()', phpType: 'string', swaggerType: 'string' },
      'int': { yiiType: 'integer()', phpType: 'int', swaggerType: 'integer' },
      'bigint': { yiiType: 'bigInteger()', phpType: 'int', swaggerType: 'integer' },
      'boolean': { yiiType: 'boolean()', phpType: 'bool', swaggerType: 'boolean' },
      'timestamp': { yiiType: 'timestamp()', phpType: 'int', swaggerType: 'integer' },
      'date': { yiiType: 'date()', phpType: 'string', swaggerType: 'string' },
      'decimal': { yiiType: 'decimal()', phpType: 'float', swaggerType: 'number' }
    };

    return typeMap[dbType.toLowerCase()] || { yiiType: 'string()', phpType: 'string', swaggerType: 'string' };
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  public async generateYii2Code(diagramData: DiagramData): Promise<Buffer> {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const buffers: Buffer[] = [];

    archive.on('data', (data) => buffers.push(data));

    const namespace = `xbsoft\\${diagramData.name.toLowerCase()}`;
    
    for (const table of diagramData.tables) {
      const className = this.toPascalCase(table.name);
      const lowerClassName = table.name.toLowerCase();
      const schemaName = diagramData.schema || 'public';

      // Prepare column data
      const columns = table.columns.map(col => {
        const types = this.mapDataType(col.type);
        return {
          ...col,
          ...types,
          pascalName: this.toPascalCase(col.name),
          label: col.comment || this.toPascalCase(col.name),
          maxLength: col.length
        };
      });

      const editableColumns = columns.filter(col => 
        !col.primary_key && 
        !['created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by', 'is_deleted'].includes(col.name)
      );

      const requiredColumns = editableColumns.filter(col => !col.nullable);
      const stringColumns = columns.filter(col => col.swaggerType === 'string');
      const integerColumns = columns.filter(col => col.swaggerType === 'integer');
      const booleanColumns = columns.filter(col => col.swaggerType === 'boolean');
      const uniqueColumns = columns.filter(col => col.name === 'title' || col.name === 'name' || col.name === 'email');

      const foreignKeys = table.columns
        .filter(col => col.foreign_key)
        .map(col => ({
          column: col.name,
          refTable: col.foreign_key!.table,
          refColumn: col.foreign_key!.column
        }));

      const indexes = columns.filter(col => col.name === 'title' || col.name === 'name').map(col => col.name);

      const templateData = {
        namespace,
        className,
        lowerClassName,
        tableName: table.name,
        schemaName,
        description: `${className} entity`,
        columns,
        editableColumns,
        requiredColumns,
        stringColumns,
        integerColumns,
        booleanColumns,
        uniqueColumns,
        foreignKeys,
        indexes,
        migrationClassName: `M${this.generateTimestamp()}CreateTable${this.toPascalCase(table.name)}`
      };

      // Generate files
      const files = [
        {
          path: `${diagramData.name}/migrations/${templateData.migrationClassName}.php`,
          content: this.templates.yii2Migration(templateData)
        },
        {
          path: `${diagramData.name}/models/${className}.php`,
          content: this.templates.yii2Model(templateData)
        },
        {
          path: `${diagramData.name}/repository/${className}Repository.php`,
          content: this.templates.yii2Repository(templateData)
        },
        {
          path: `${diagramData.name}/service/${className}Service.php`,
          content: this.templates.yii2Service(templateData)
        },
        {
          path: `${diagramData.name}/dto/${lowerClassName}/${className}CreateDTO.php`,
          content: this.templates.yii2CreateDTO(templateData)
        },
        {
          path: `${diagramData.name}/dto/${lowerClassName}/${className}UpdateDTO.php`,
          content: this.templates.yii2CreateDTO(templateData)
        },
        {
          path: `${diagramData.name}/models/scope/${className}ScopeTrait.php`,
          content: this.templates.yii2ScopeTrait(templateData)
        }
      ];

      for (const file of files) {
        archive.append(file.content, { name: file.path });
      }
    }

    archive.finalize();

    return new Promise((resolve, reject) => {
      archive.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      archive.on('error', (err) => {
        reject(err);
      });
    });
  }
} 