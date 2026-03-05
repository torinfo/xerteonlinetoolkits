<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model;

use Qti3\Shared\Model\QtiTagName;
use Qti3\Tests\Unit\AssessmentItem\Model\Interaction\ExtendedTextInteraction\ExtendedTextInteractionStub;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class QtiTagNameTest extends TestCase
{
    private QtiTagName $tagName;

    protected function setUp(): void
    {
        $textInteraction = new ExtendedTextInteractionStub();
        $this->tagName = new QtiTagName($textInteraction::class);
    }

    #[Test]
    public function aQTITagNameConvertsAClassnameToQTIElementTagName(): void
    {
        $this->assertEquals('qti-extended-text-interaction-stub', (string) $this->tagName);
    }
}
