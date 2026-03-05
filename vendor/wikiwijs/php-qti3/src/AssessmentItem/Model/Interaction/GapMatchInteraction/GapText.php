<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\GapMatchInteraction;

use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\QtiElement;

final class GapText extends QtiElement
{
    public function __construct(
        public readonly string $identifier,
        public readonly int $matchMax,
        public readonly ContentNodeCollection $content,
        public readonly int $matchMin = 0,
        public readonly ?string $matchGroup = null,
        //	Identifier of a template variable used to control the visibility of the qti-gap-text
        public readonly ?string $templateIdentifier = null,
        public readonly string $showHide = 'show',
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
            'match-max' => (string) $this->matchMax,
            'match-min' => (string) $this->matchMin,
            'match-group' => $this->matchGroup,
            'template-identifier' => $this->templateIdentifier,
            'show-hide' => $this->showHide,
        ];
    }

    public function children(): array
    {
        return $this->content->all();
    }
}
