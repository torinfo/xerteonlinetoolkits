<?php

declare(strict_types=1);

namespace Qti3\Shared\Model;

class Comment extends TextNode
{
    public function getContentForXml(): string
    {
        return $this->content;
    }
}
