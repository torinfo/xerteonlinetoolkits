<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\OutcomeProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeCondition;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeIf;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeProcessing;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\Processing\Variable;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OutcomeProcessingTest extends TestCase
{
    private OutcomeProcessing $outcomeProcessing;

    protected function setUp(): void
    {
        $this->outcomeProcessing = new OutcomeProcessing([
            new OutcomeCondition(
                if: new OutcomeIf(
                    new IsNull(new Variable('variable')),
                    new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value')),
                ),
            ),
        ]);
    }

    #[Test]
    public function testOutcomeProcessingChildren(): void
    {
        $children = $this->outcomeProcessing->children();
        $this->assertInstanceOf(OutcomeCondition::class, $children[0]);
    }
}
