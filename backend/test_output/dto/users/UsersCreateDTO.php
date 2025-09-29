<?php

namespace xbsoft\blog\dto\users;

use yii\base\BaseObject;

/**
 * Class UsersCreateDTO
 * DTO for creating Users model
 */
class UsersCreateDTO extends BaseObject
{
    public $username;
    public $email;
    public $password_hash;
    public $role;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['username'], 'required'],
            [['username'], 'string'],
            [['email'], 'required'],
            [['email'], 'string'],
            [['email'], 'email'],
            [['password_hash'], 'required'],
            [['password_hash'], 'string'],
            [['role'], 'required'],
            [['role'], 'string'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'username' => 'Username',
            'email' => 'Email',
            'password_hash' => 'Password Hash',
            'role' => 'Role',
        ];
    }
} 