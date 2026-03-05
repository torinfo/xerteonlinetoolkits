<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Service\QtiPackageBuilder\Manifest;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\ManifestBuilder;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\MetadataBuilder;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\OrganizationsBuilder;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\ResourcesBuilder;
use Qti3\Package\Service\QtiPackageBuilder\XmlBuilder;
use Qti3\Shared\Xml\Reader\XmlReader;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ManifestBuilderTest extends TestCase
{
    private XmlBuilder $xmlBuilder;
    private MetadataBuilder|MockObject $metadataBuilder;
    private OrganizationsBuilder|MockObject $organizationsBuilder;
    private ResourcesBuilder|MockObject $resourcesBuilder;
    private ManifestBuilder $manifestBuilder;

    protected function setUp(): void
    {
        parent::setUp();

        $this->xmlBuilder = new XmlBuilder();
        $this->metadataBuilder = $this->createMock(MetadataBuilder::class);
        $this->organizationsBuilder = $this->createMock(OrganizationsBuilder::class);
        $this->resourcesBuilder = $this->createMock(ResourcesBuilder::class);

        $this->manifestBuilder = new ManifestBuilder(
            $this->xmlBuilder,
            $this->metadataBuilder,
            $this->organizationsBuilder,
            $this->resourcesBuilder,
            new XmlReader(),
        );
    }

    #[Test]
    public function aManifestCanBeCreatedForResources(): void
    {
        $manifest = $this->manifestBuilder->buildForResources(new ResourceCollection([
            new Resource('id', ResourceType::WEBCONTENT, 'file.txt', new PackageFileCollection([
                new PackageFile('file.txt', new MemoryFileContent('content')),
            ]), new ManifestResourceDependencyCollection()),
        ]));
        $this->assertInstanceOf(Manifest::class, $manifest);
    }
}
