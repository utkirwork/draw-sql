<?php

namespace xbsoft\blog\models\getter;

/**
 * This is the Getter Trait class for [[xbsoft\blog\models\Users]].
 *
 * @see xbsoft\blog\models\Users
 */
trait UsersGetterTrait
{
    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function getPasswordHash(): ?string
    {
        return $this->password_hash;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

} 