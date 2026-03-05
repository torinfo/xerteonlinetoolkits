<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\Metadata\Metadata;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\ResourceType;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class QtiPackageTest extends TestCase
{
    private QtiPackage $qtiPackage;
    private ResourceCollection $resources;
    private Manifest $manifest;

    protected function setUp(): void
    {
        $this->resources = $this->createMock(ResourceCollection::class);
        $this->manifest = $this->createMock(Manifest::class);

        $this->qtiPackage = new QtiPackage(
            $this->resources,
            $this->manifest,
        );
    }

    #[Test]
    public function addResourceFileUpdatesCollections(): void
    {
        $resourceFile = new Resource(
            'file',
            ResourceType::WEBCONTENT,
            'file',
            new PackageFileCollection([
                new PackageFile('file', new MemoryFileContent('test')),
            ]),
            new ManifestResourceDependencyCollection(),
        );

        $this->resources
            ->expects($this->once())
            ->method('add')
            ->with($resourceFile);

        $this->manifest
            ->expects($this->once())
            ->method('addResource');

        $this->qtiPackage->addResource($resourceFile);
    }

    #[Test]
    public function getFilesReturnsCorrectCollection(): void
    {
        $resourceFile = new Resource(
            'file',
            ResourceType::WEBCONTENT,
            'file',
            new PackageFileCollection([
                new PackageFile('file', new MemoryFileContent('test')),
            ]),
            new ManifestResourceDependencyCollection(),
        );

        $this->resources
            ->method('all')
            ->willReturn([$resourceFile]);

        $packageFiles = $this->qtiPackage->getFiles();

        $this->assertInstanceOf(PackageFileCollection::class, $packageFiles);
    }

    #[Test]
    public function getMetadataReturnsMetadataIfAssessmentTestExists(): void
    {
        $metadata = $this->createMock(Metadata::class);
        $assessmentTestFile = $this->createMock(Resource::class);
        $assessmentTestFile->metadata = $metadata;

        $filteredCollection = $this->createMock(ResourceCollection::class);
        $filteredCollection
            ->method('first')
            ->willReturn($assessmentTestFile);

        $this->resources
            ->method('filterByType')
            ->with(ResourceType::ASSESSMENT_TEST)
            ->willReturn($filteredCollection);

        $this->assertSame($metadata, $this->qtiPackage->getMetadata());
    }

    #[Test]
    public function getMetadataReturnsNullIfNoAssessmentTestExists(): void
    {
        $filteredCollection = $this->createMock(ResourceCollection::class);
        $filteredCollection
            ->method('first')
            ->willReturn(null);

        $this->resources
            ->method('filterByType')
            ->with(ResourceType::ASSESSMENT_TEST)
            ->willReturn($filteredCollection);

        $this->assertNull($this->qtiPackage->getMetadata());
    }

    #[Test]
    public function getAssessmentTestIdentifierExists(): void
    {
        $qtiPackageMock = new QtiPackageMock(
            resources: new ResourceCollection([
                new Resource('id', ResourceType::ASSESSMENT_TEST, 'test.xml', new PackageFileCollection([
                    new PackageFile('test.xml', new MemoryFileContent('content')),
                ]), new ManifestResourceDependencyCollection()),
            ]),
        );

        $this->assertEquals('id', $qtiPackageMock->getAssessmentTestIdentifier());
    }

    #[Test]
    public function hasFileReturnsIfPackageHasFile(): void
    {
        $qtiPackageMock = new QtiPackageMock();

        $this->assertTrue($qtiPackageMock->hasFile('test.xml'));
        $this->assertFalse($qtiPackageMock->hasFile('non-existing.xml'));
    }
}
