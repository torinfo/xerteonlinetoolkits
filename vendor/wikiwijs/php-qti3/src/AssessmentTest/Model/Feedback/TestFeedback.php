<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\Feedback;

use Qti3\AssessmentItem\Model\Feedback\Visibility;
use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\QtiElement;

class TestFeedback extends QtiElement
{
    public function __construct(
        public string $identifier,
        public string $outcomeIdentifier,
        public readonly ContentBody $contentBody,
        public TestFeedbackAccess $access = TestFeedbackAccess::AT_END,
        public readonly Visibility $showHide = Visibility::SHOW,
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
            'outcome-identifier' => $this->outcomeIdentifier,
            'show-hide' => $this->showHide->value,
            'access' => $this->access->value,
        ];
    }

    public function children(): array
    {
        return [$this->contentBody];
    }
}
