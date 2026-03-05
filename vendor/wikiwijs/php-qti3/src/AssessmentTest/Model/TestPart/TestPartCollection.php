<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\TestPart;

use Qti3\Shared\Collection\AbstractCollection;

/**
 * @template-extends AbstractCollection<TestPart>
 */
class TestPartCollection extends AbstractCollection
{
    public function getType(): string
    {
        return TestPart::class;
    }
}
