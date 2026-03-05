<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\HottextInteraction;

use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\QtiElement;

/**
 * The HotTextInteraction.Type (qti-hottext-interaction)
 * presents a set of choices to the candidate represented
 * as selectable runs of text embedded within a surrounding
 * context, such as a simple passage of text.
 */
class HottextInteraction extends QtiElement
{
    public function __construct(
        public int $maxChoices,
        public ContentNodeCollection $content,
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
            ...$this->content->all(),
        ];
    }
}
