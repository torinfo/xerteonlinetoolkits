<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\ExtendedTextInteraction;

use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\Shared\Model\QtiElement;

/**
 * The extended text interaction allows a candidate to supply a text string for a response.
 */
class ExtendedTextInteraction extends QtiElement
{
    public function __construct(
        public string $responseIdentifier = 'RESPONSE',
        public ?Prompt $prompt = null,
    ) {}

    public function attributes(): array
    {
        return [
            'response-identifier' => $this->responseIdentifier,
        ];
    }

    /**
     * @return array<int,QtiElement|null>
     */
    public function children(): array
    {
        return [
            $this->prompt,
        ];
    }
}
