<?php

namespace xbsoft\organization\modules\api\forms;

use xbsoft\organization\dto\organization\OrganizationCreateDTO;
use yii\base\Model;

/**
 * Create Organization Form
 * 
 * @OA\Schema(
 *     schema="CreateOrganizationForm",
 *     type="object",
 *     title="Create Organization Form",
 *     description="Form for creating a new organization",
 *     required={"title"}
 * )
 */
class CreateOrganizationForm extends Model
{
    /**
     * @OA\Property(
     *     property="title",
     *     type="string",
     *     description="Organization title",
     *     example="Acme Corporation"
     * )
     */
    public $title;

    /**
     * @OA\Property(
     *     property="description",
     *     type="string",
     *     description="Organization description",
     *     example="Leading provider of innovative solutions"
     * )
     */
    public $description;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['title'], 'required'],
            [['title'], 'string', 'max' => 255],
            [['description'], 'string'],
            [['title'], 'trim'],
            [['description'], 'trim'],
            [['title'], 'validateUniqueTitle'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'title' => 'Title',
            'description' => 'Description',
        ];
    }

    /**
     * Validate unique title
     */
    public function validateUniqueTitle($attribute, $params)
    {
        if (!empty($this->title)) {
            $organizationRepository = \Yii::$container->get(\xbsoft\organization\repository\OrganizationRepository::class);
            if ($organizationRepository->existsByTitle($this->title)) {
                $this->addError($attribute, 'Organization with this title already exists.');
            }
        }
    }

    /**
     * Get Organization Create DTO
     * @return OrganizationCreateDTO
     */
    public function getCreateDTO(): OrganizationCreateDTO
    {
        $dto = new OrganizationCreateDTO();
        $dto->title = $this->title;
        $dto->description = $this->description;
        
        return $dto;
    }
} 