<?php

namespace xbsoft\blog\models\setter;

/**
 * This is the Setter Trait class for [[xbsoft\blog\models\Users]].
 *
 * @see xbsoft\blog\models\Users
 */
trait UsersSetterTrait
{
    public function setUsername($value)
    {
        $this->username = $value;
    }

    public function setEmail($value)
    {
        $this->email = $value;
    }

    public function setPasswordHash($value)
    {
        $this->password_hash = $value;
    }

    public function setRole($value)
    {
        $this->role = $value;
    }

} 