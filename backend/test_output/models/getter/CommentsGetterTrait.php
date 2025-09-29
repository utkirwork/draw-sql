<?php

namespace xbsoft\blog\models\getter;

/**
 * This is the Getter Trait class for [[xbsoft\blog\models\Comments]].
 *
 * @see xbsoft\blog\models\Comments
 */
trait CommentsGetterTrait
{
    public function getPostId(): ?string
    {
        return $this->post_id;
    }

    public function getAuthorId(): ?string
    {
        return $this->author_id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

} 