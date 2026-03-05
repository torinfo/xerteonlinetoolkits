<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Stylesheet;

use Qti3\AssessmentItem\Model\Stylesheet\Stylesheet;
use Qti3\AssessmentItem\Model\Stylesheet\StylesheetCollection;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class StylesheetCollectionTest extends TestCase
{
    private StylesheetCollection $stylesheetCollection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->stylesheetCollection = new StylesheetCollection();
    }

    #[Test]
    public function testGetType(): void
    {
        $this->assertEquals(Stylesheet::class, $this->stylesheetCollection->getType());
    }
}
