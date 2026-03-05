<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\Section;

use Qti3\Shared\Collection\AbstractCollection;

/**
 * @template-extends AbstractCollection<AssessmentSection>
 */
class AssessmentSectionCollection extends AbstractCollection
{
    public function getType(): string
    {
        return AssessmentSection::class;
    }
}
