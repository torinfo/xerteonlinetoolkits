<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\MatchInteraction;

use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\QtiElement;

class SimpleAssociableChoice extends QtiElement
{
    public function __construct(
        public string $identifier,
        public ContentNodeCollection $content,
        public int $matchMax = 1,
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
            'match-max' => (string) $this->matchMax,
        ];
    }

    public function children(): array
    {
        return $this->content->all();
    }
}
