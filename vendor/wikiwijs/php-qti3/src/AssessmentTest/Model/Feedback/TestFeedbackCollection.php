<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\Feedback;

use Qti3\Shared\Collection\AbstractCollection;

/**
 * @template-extends AbstractCollection<TestFeedback>
 */
class TestFeedbackCollection extends AbstractCollection
{
    public function getType(): string
    {
        return TestFeedback::class;
    }
}
