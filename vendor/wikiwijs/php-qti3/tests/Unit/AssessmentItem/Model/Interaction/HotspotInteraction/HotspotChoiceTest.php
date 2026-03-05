<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction\HotspotInteraction;

use Qti3\AssessmentItem\Model\Interaction\HotspotInteraction\HotspotChoice;
use Qti3\AssessmentItem\Model\Shape\Circle;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class HotspotChoiceTest extends TestCase
{
    private HotspotChoice $hotspotChoice;

    protected function setUp(): void
    {
        $this->hotspotChoice = new HotspotChoice(
            shape: Circle::fromString('418,29,40'),
            identifier: 'I',
        );
    }

    #[Test]
    public function testAttributes(): void
    {
        $expectedAttributes = [
            'shape' => 'circle',
            'coords' => '418,29,40',
            'identifier' => 'I',
        ];

        $this->assertSame($expectedAttributes, $this->hotspotChoice->attributes());
    }
}
