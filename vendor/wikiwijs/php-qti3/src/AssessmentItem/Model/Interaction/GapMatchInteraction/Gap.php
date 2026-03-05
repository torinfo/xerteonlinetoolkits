<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\GapMatchInteraction;

use Qti3\Shared\Model\QtiElement;

final class Gap extends QtiElement
{
    public function __construct(
        public readonly string $identifier,
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
        ];
    }
}
