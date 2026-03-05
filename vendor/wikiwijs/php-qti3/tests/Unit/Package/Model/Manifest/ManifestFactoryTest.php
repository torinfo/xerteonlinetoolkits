<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\Manifest;

use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestFactory;
use Qti3\Shared\Xml\Reader\XmlReader;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ManifestFactoryTest extends TestCase
{
    #[Test]
    public function createReturnsManifest(): void
    {
        $manifestFactory = new ManifestFactory(
            new XmlReader(),
        );

        $manifest = $manifestFactory->createFromXmlString('<manifest />');

        $this->assertInstanceOf(Manifest::class, $manifest);
    }
}
