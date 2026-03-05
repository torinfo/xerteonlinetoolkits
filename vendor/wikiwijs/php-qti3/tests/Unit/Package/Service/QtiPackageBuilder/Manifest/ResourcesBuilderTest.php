<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Service\QtiPackageBuilder\Manifest;

use Qti3\Package\Model\Manifest\ManifestResource;
use Qti3\Package\Model\Manifest\ManifestResourceCollection;
use Qti3\Package\Model\Manifest\ManifestResourceDependency;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\Manifest\ManifestResourceFile;
use Qti3\Package\Model\Manifest\ManifestResourceFileCollection;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\ResourcesBuilder;
use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResourcesBuilderTest extends TestCase
{
    private ResourcesBuilder $resourcesBuilder;
    private DOMDocument $document;
    private DOMElement $rootNode;

    protected function setUp(): void
    {
        parent::setUp();
        $this->resourcesBuilder = new ResourcesBuilder();
        $this->document = new DOMDocument();
        $this->rootNode = $this->document->createElement('root');
    }

    #[Test]
    public function anResourcesNodeCanBeAddedToTheManifest(): void
    {
        $resources = new ManifestResourceCollection([
            new ManifestResource(
                'identifier',
                ResourceType::WEBCONTENT,
                new ManifestResourceFileCollection([
                    new ManifestResourceFile('image.jpg'),
                ]),
                new ManifestResourceDependencyCollection([
                    new ManifestResourceDependency('identifierref'),
                ]),
                'href',
            ),
        ]);

        $this->resourcesBuilder->addResourcesNode($this->document, $this->rootNode, $resources);
        $resourcesNode = $this->rootNode->getElementsByTagName('resources')->item(0);

        $this->assertNotNull($resourcesNode);
        $this->assertSame($resourcesNode, $this->rootNode->firstChild);
    }

    #[Test]
    public function aManifestWithoutDependenciesCanBeAddedToTheManifest(): void
    {
        $resources = new ManifestResourceCollection([
            new ManifestResource('identifier', ResourceType::WEBCONTENT, new ManifestResourceFileCollection(), new ManifestResourceDependencyCollection(), 'href'),
        ]);

        $this->resourcesBuilder->addResourcesNode($this->document, $this->rootNode, $resources);
        $resourcesNode = $this->rootNode->getElementsByTagName('resources')->item(0);

        $this->assertNotNull($resourcesNode);
        $this->assertSame($resourcesNode, $this->rootNode->firstChild);
    }
}
