<?php

namespace xbsoft\blog\models\setter;

/**
 * This is the Setter Trait class for [[xbsoft\blog\models\Posts]].
 *
 * @see xbsoft\blog\models\Posts
 */
trait PostsSetterTrait
{
    public function setTitle($value)
    {
        $this->title = $value;
    }

    public function setContent($value)
    {
        $this->content = $value;
    }

    public function setAuthorId($value)
    {
        $this->author_id = $value;
    }

    public function setCategoryId($value)
    {
        $this->category_id = $value;
    }

    public function setPublishedAt($value)
    {
        $this->published_at = $value;
    }

} 