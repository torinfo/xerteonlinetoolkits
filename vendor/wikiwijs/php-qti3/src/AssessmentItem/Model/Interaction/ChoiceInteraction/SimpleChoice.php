<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction;

use Qti3\AssessmentItem\Model\Feedback\FeedbackInline;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\QtiElement;

class SimpleChoice extends QtiElement
{
    public function __construct(
        public string $identifier,
        public ContentNodeCollection $content,
        public ?FeedbackInline $feedbackInline = null,
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
        ];
    }

    public function children(): array
    {
        return [
            ...$this->content->all(),
            $this->feedbackInline,
        ];
    }
}
