<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\Metadata;

use Qti3\Package\Model\Metadata\Metadata;
use DOMDocument;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class MetadataTest extends TestCase
{
    #[Test]
    public function itCanRetrieveLomDocument(): void
    {
        $domDocument = new DOMDocument();
        $xml = <<<XML
        <lom xmlns="http://ltsc.ieee.org/xsd/LOM">
        </lom>
        XML;
        $domDocument->loadXML($xml);
        $metadata = new Metadata($domDocument);

        $this->assertSame($domDocument, $metadata->lomDocument);
    }
}
