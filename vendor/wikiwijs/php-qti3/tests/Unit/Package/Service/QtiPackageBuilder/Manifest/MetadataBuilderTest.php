<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Service\QtiPackageBuilder\Manifest;

use Qti3\Package\Service\QtiPackageBuilder\Manifest\MetadataBuilder;
use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class MetadataBuilderTest extends TestCase
{
    private MetadataBuilder $metadataBuilder;
    private DOMDocument $document;
    private DOMElement $rootNode;

    protected function setUp(): void
    {
        parent::setUp();

        $this->metadataBuilder = new MetadataBuilder();
        $this->document = new DOMDocument();
        $this->rootNode = $this->document->createElement('root');
    }

    #[Test]
    public function anOrganizationsNodeCanBeAddedToTheManifest(): void
    {
        $this->metadataBuilder->addMetadataNode($this->document, $this->rootNode);
        $metadataNode = $this->rootNode->getElementsByTagName('metadata')->item(0);

        $this->assertNotNull($metadataNode);

        $schemaNode = $metadataNode->getElementsByTagName('schema')->item(0);
        $this->assertNotNull($schemaNode);
        $this->assertEquals('QTI Package', $schemaNode->textContent);

        $schemaVersionNode = $metadataNode->getElementsByTagName('schemaversion')->item(0);
        $this->assertNotNull($schemaVersionNode);
        $this->assertEquals('3.0.0', $schemaVersionNode->textContent);

        $this->assertSame($metadataNode, $this->rootNode->firstChild);
    }
}
