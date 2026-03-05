<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\TestPart;

use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRef;
use Qti3\AssessmentTest\Model\Section\AssessmentSectionCollection;
use Qti3\Shared\Model\IContentNode;
use Qti3\Shared\Model\QtiElement;

class TestPart extends QtiElement
{
    public function __construct(
        public readonly string $identifier,
        public readonly NavigationMode $navigationMode,
        public readonly SubmissionMode $submissionMode,
        public AssessmentSectionCollection $sections,
    ) {}

    /**
     * @return array<string, string|null>
     */
    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
            'navigation-mode' => $this->navigationMode->value,
            'submission-mode' => $this->submissionMode->value,
        ];
    }

    /**
     * @return array<int,IContentNode>
     */
    public function children(): array
    {
        return $this->sections->all();
    }

    /**
     * @return array<int,AssessmentItemRef>
     */
    public function getItemRefs(): array
    {
        $itemRefs = [];
        foreach ($this->sections as $section) {
            $itemRefs = [...$itemRefs, ...$section->assessmentItemRefs->all()];
        }

        return $itemRefs;
    }
}
