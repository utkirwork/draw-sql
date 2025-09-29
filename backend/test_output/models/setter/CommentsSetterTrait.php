<?php

namespace xbsoft\blog\models\setter;

/**
 * This is the Setter Trait class for [[xbsoft\blog\models\Comments]].
 *
 * @see xbsoft\blog\models\Comments
 */
trait CommentsSetterTrait
{
    public function setPostId($value)
    {
        $this->post_id = $value;
    }

    public function setAuthorId($value)
    {
        $this->author_id = $value;
    }

    public function setContent($value)
    {
        $this->content = $value;
    }

    public function setCreatedAt($value)
    {
        $this->created_at = $value;
    }

} 