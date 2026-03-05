<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\MatchInteraction;

use Qti3\Shared\Model\QtiElement;

class SimpleMatchSet extends QtiElement
{
    public function __construct(
        /** @var array<int,SimpleAssociableChoice> */
        public array $choices,
    ) {}

    public function children(): array
    {
        return $this->choices;
    }
}
