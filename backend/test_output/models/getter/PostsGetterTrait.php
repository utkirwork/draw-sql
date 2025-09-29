<?php

namespace xbsoft\blog\models\getter;

/**
 * This is the Getter Trait class for [[xbsoft\blog\models\Posts]].
 *
 * @see xbsoft\blog\models\Posts
 */
trait PostsGetterTrait
{
    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getAuthorId(): ?string
    {
        return $this->author_id;
    }

    public function getCategoryId(): ?string
    {
        return $this->category_id;
    }

    public function getPublishedAt(): ?string
    {
        return $this->published_at;
    }

} 