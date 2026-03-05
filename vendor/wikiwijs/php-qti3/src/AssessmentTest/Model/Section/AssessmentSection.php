<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\Section;

use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRefCollection;
use Qti3\Shared\Model\IContentNode;
use Qti3\Shared\Model\QtiElement;

class AssessmentSection extends QtiElement
{
    public function __construct(
        public readonly string $identifier,
        public readonly string $title,
        public readonly AssessmentItemRefCollection $assessmentItemRefs,
        public readonly ?Selection $selection = null,
        public readonly ?Ordering $ordering = null,
        public readonly bool $visible = true,
    ) {}

    /**
     * @return array<string,string|null>
     */
    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
            'title' => $this->title,
            'visible' => $this->visible ? 'true' : 'false',
        ];
    }

    /**
     * @return array<int,IContentNode|null>
     */
    public function children(): array
    {
        return [
            $this->selection,
            $this->ordering,
            ...$this->assessmentItemRefs->all(),
        ];
    }
}
