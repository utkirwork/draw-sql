<?php

namespace xbsoft\blog\models;

use xbsoft\blog\models\getter\UsersGetterTrait;
use xbsoft\blog\models\relation\UsersRelationTrait;
use xbsoft\blog\models\scope\UsersScopeTrait;
use xbsoft\blog\models\setter\UsersSetterTrait;
use xbsoft\blog\models\query\UsersQuery;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "users".
 *
 * @property string $id 
 * @property string $username 
 * @property string $email 
 * @property string $password_hash 
 * @property string $role 
 */
class Users extends ActiveRecord
{
    use UsersGetterTrait;
    use UsersRelationTrait;
    use UsersScopeTrait;
    use UsersSetterTrait;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'users';
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['id'], 'string'],
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
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'Id',
            'username' => 'Username',
            'email' => 'Email',
            'password_hash' => 'Password Hash',
            'role' => 'Role',
        ];
    }

    /**
     * {@inheritdoc}
     * @return UsersQuery the active query used by this AR class.
     */
    public static function find(): UsersQuery
    {
        return new UsersQuery(get_called_class());
    }
} 