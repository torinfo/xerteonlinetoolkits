<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Feedback;

use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\QtiElement;

class FeedbackBlock extends QtiElement
{
    public function __construct(
        public string $identifier,
        public readonly ContentBody $contentBody,
        public string $outcomeIdentifier = 'FEEDBACK',
        public readonly Visibility $showHide = Visibility::SHOW,
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
            'outcome-identifier' => $this->outcomeIdentifier,
            'show-hide' => $this->showHide->value,
        ];
    }

    public function children(): array
    {
        return [$this->contentBody];
    }
}
