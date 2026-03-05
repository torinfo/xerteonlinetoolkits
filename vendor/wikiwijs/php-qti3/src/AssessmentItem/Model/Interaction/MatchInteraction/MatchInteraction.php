<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\MatchInteraction;

use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\Shared\Model\QtiElement;

/**
 * The text entry interaction allows a candidate to supply a text string for a response.
 */
class MatchInteraction extends QtiElement
{
    public function __construct(
        public SimpleMatchSet $simpleMatchSet1,
        public SimpleMatchSet $simpleMatchSet2,
        public ?Prompt $prompt = null,
        public string $responseIdentifier = 'RESPONSE',
        public bool $shuffle = false,
        public ?int $maxAssociations = null,
        public ?string $class = null,
    ) {}

    public function attributes(): array
    {
        return [
            'response-identifier' => $this->responseIdentifier,
            'shuffle' => $this->shuffle ? 'true' : 'false',
            'max-associations' => $this->maxAssociations === null ? null : (string) $this->maxAssociations,
            'class' => $this->class,
        ];
    }

    public function children(): array
    {
        return [
            $this->prompt,
            $this->simpleMatchSet1,
            $this->simpleMatchSet2,
        ];
    }
}
