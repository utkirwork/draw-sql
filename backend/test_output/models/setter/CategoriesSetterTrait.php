<?php

namespace xbsoft\blog\models\setter;

/**
 * This is the Setter Trait class for [[xbsoft\blog\models\Categories]].
 *
 * @see xbsoft\blog\models\Categories
 */
trait CategoriesSetterTrait
{
    public function setName($value)
    {
        $this->name = $value;
    }

    public function setSlug($value)
    {
        $this->slug = $value;
    }

} 