<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Service\QtiPackageBuilder\Manifest;

use Qti3\Package\Service\QtiPackageBuilder\Manifest\OrganizationsBuilder;
use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OrganizationsBuilderTest extends TestCase
{
    private OrganizationsBuilder $organizationsBuilder;
    private DOMDocument $document;
    private DOMElement $rootNode;

    protected function setUp(): void
    {
        parent::setUp();
        $this->organizationsBuilder = new OrganizationsBuilder();
        $this->document = new DOMDocument();
        $this->rootNode = $this->document->createElement('root');
    }

    #[Test]
    public function anOrganizationsNodeCanBeAddedToTheManifest(): void
    {
        $this->organizationsBuilder->addOrganizationsNode($this->document, $this->rootNode);
        $organizationsNode = $this->rootNode->getElementsByTagName('organizations')->item(0);

        $this->assertNotNull($organizationsNode);
        $this->assertSame($organizationsNode, $this->rootNode->firstChild);
    }
}
