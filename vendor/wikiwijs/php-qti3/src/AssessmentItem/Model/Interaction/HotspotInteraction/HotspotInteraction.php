<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\HotspotInteraction;

use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\QtiElement;

/**
 * The hotspot interaction allows a candidate to supply hotspots on an image for a response.
 */
class HotspotInteraction extends QtiElement
{
    /**
     * @param array<int,HotspotChoice> $choices
     */
    public function __construct(
        public HTMLTag $image,
        public array $choices,
        public int $maxChoices,
        public string $responseIdentifier = 'RESPONSE',
    ) {}

    public function attributes(): array
    {
        return [
            'max-choices' => (string) $this->maxChoices,
            'response-identifier' => $this->responseIdentifier,
        ];
    }

    public function children(): array
    {
        return [
            $this->image,
            ...$this->choices,
        ];
    }
}
