<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction;

use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\Shared\Model\QtiElement;

/**
 * The choice interaction allows a candidate to supply a response by selecting one or more choices from a list.
 */
class ChoiceInteraction extends QtiElement
{
    /**
     * @param array<int,SimpleChoice> $choices
     */
    public function __construct(
        public array $choices,
        public string $responseIdentifier = 'RESPONSE',
        public ?Prompt $prompt = null,
        public bool $shuffle = false,
        public int $maxChoices = 1,
    ) {}

    public function attributes(): array
    {
        return [
            'response-identifier' => $this->responseIdentifier,
            'shuffle' => $this->shuffle ? 'true' : 'false',
            'max-choices' => (string) $this->maxChoices,
        ];
    }

    /**
     * @return array<int,QtiElement|null>
     */
    public function children(): array
    {
        return [
            $this->prompt,
            ...$this->choices,
        ];
    }
}
