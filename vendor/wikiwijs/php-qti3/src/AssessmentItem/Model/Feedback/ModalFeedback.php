<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Feedback;

use Qti3\AssessmentItem\Model\Stylesheet\Stylesheet;
use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\QtiElement;

class ModalFeedback extends QtiElement
{
    /**
     * @param array<int,Stylesheet> $stylesheets
     */
    public function __construct(
        public string $identifier,
        public readonly string $outcomeIdentifier,
        public readonly Visibility $showHide,
        public readonly ?string $title = null,
        public readonly ?ContentBody $contentBody = null,
        public readonly array $stylesheets = [],
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
            'outcome-identifier' => $this->outcomeIdentifier,
            'show-hide' => $this->showHide->value,
            'title' => $this->title,
        ];
    }

    public function children(): array
    {
        return [
            ...$this->stylesheets,
            $this->contentBody,
        ];
    }
}
