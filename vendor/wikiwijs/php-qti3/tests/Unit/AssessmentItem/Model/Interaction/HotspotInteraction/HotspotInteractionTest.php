<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction\HotspotInteraction;

use Qti3\AssessmentItem\Model\Interaction\HotspotInteraction\HotspotChoice;
use Qti3\AssessmentItem\Model\Interaction\HotspotInteraction\HotspotInteraction;
use Qti3\AssessmentItem\Model\Shape\Circle;
use Qti3\Shared\Model\HTMLTag;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class HotspotInteractionTest extends TestCase
{
    private HotspotInteraction $hotspotInteraction;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hotspotInteraction = new HotspotInteraction(
            image: new HTMLTag('img', ['alt' => 'altText', 'src' => 'https://path-to-image.url']),
            choices: [new HotspotChoice(shape: Circle::fromString('418,29,40'), identifier: 'I')],
            maxChoices: 1,
        );
    }

    #[Test]
    public function testAttributes(): void
    {
        $expectedAttributes = [
            'max-choices' => '1',
            'response-identifier' => 'RESPONSE',
        ];

        $this->assertSame($expectedAttributes, $this->hotspotInteraction->attributes());
    }

    #[Test]
    public function testChildren(): void
    {
        $expectedChildren = [
            $this->hotspotInteraction->image,
            ...$this->hotspotInteraction->choices,
        ];

        $this->assertSame($expectedChildren, $this->hotspotInteraction->children());
    }
}
