<?php

namespace xbsoft\blog\models\getter;

/**
 * This is the Getter Trait class for [[xbsoft\blog\models\Categories]].
 *
 * @see xbsoft\blog\models\Categories
 */
trait CategoriesGetterTrait
{
    public function getName(): ?string
    {
        return $this->name;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

} 