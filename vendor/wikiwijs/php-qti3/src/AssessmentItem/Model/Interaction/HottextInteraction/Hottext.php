<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\HottextInteraction;

use Qti3\Shared\Model\QtiElement;
use Qti3\Shared\Model\TextNode;

class Hottext extends QtiElement
{
    public function __construct(
        public string $identifier,
        public TextNode $content,
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
        ];
    }

    public function children(): array
    {
        return  [
            $this->content,
        ];
    }
}
