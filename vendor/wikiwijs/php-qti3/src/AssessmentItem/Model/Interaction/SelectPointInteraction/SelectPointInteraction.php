<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\SelectPointInteraction;

use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\QtiElement;

/**
 * The select point interaction requires the candidate to select points on an image.
 */
class SelectPointInteraction extends QtiElement
{
    public function __construct(
        public HTMLTag $image,
        public int $maxChoices,
        public ?Prompt $prompt = null,
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
            $this->prompt,
            $this->image,
        ];
    }
}
