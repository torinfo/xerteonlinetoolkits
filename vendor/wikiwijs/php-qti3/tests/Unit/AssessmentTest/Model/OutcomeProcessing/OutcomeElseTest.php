<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\OutcomeProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeElse;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OutcomeElseTest extends TestCase
{
    private OutcomeElse $outcomeElse;

    protected function setUp(): void
    {
        $this->outcomeElse = new OutcomeElse(
            new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value')),
        );
    }

    #[Test]
    public function testOutcomeElseChildren(): void
    {
        $children = $this->outcomeElse->children();
        $this->assertInstanceOf(SetOutcomeValue::class, $children[0]);
    }
}
