<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseProcessing;

use Qti3\AssessmentItem\Model\ResponseProcessing\MapResponse;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class MapResponseTest extends TestCase
{
    private MapResponse $mapResponse;

    protected function setUp(): void
    {
        $this->mapResponse = new MapResponse('identifier');
    }

    #[Test]
    public function testMapResponse(): void
    {
        $this->assertEquals(
            [
                'identifier' => 'identifier',
            ],
            $this->mapResponse->attributes(),
        );
    }
}
