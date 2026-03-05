<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction;

use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\QtiElement;

class Prompt extends QtiElement
{
    public function __construct(
        public ContentNodeCollection $content,
    ) {}

    public function children(): array
    {
        return $this->content->all();
    }
}
