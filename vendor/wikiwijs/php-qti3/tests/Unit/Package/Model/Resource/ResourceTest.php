<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\Resource;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResourceTest extends TestCase
{
    #[Test]
    public function createResourceInstanceWithInvalidHrefThrowsException(): void
    {
        // Arrange & Act & Assert

        $this->expectException(InvalidArgumentException::class);

        new Resource(
            'test',
            ResourceType::ASSESSMENT_ITEM,
            'invalid.xml',
            new PackageFileCollection([
                new PackageFile('test.xml', new MemoryFileContent('content')),
            ]),
            new ManifestResourceDependencyCollection(),
        );
    }

    #[Test]
    public function getMainFileReturnsMainResourceFile(): void
    {
        // Arrange

        $resource = new Resource(
            'test',
            ResourceType::ASSESSMENT_ITEM,
            'test.xml',
            new PackageFileCollection([
                new PackageFile('test.xml', new MemoryFileContent('content')),
            ]),
            new ManifestResourceDependencyCollection(),
        );

        // Act

        $mainFile = $resource->getMainFile();

        // Assert

        $this->assertInstanceOf(PackageFile::class, $mainFile);
        $this->assertEquals('test.xml', $mainFile->getFilepath());
    }

    #[Test]
    public function getMainFileReturnsNullWhenHrefIsNull(): void
    {
        // Arrange

        $resource = new Resource(
            'test',
            ResourceType::ASSESSMENT_ITEM,
            null,
            new PackageFileCollection(),
            new ManifestResourceDependencyCollection(),
        );

        // Act

        $mainFile = $resource->getMainFile();

        // Assert

        $this->assertNull($mainFile);
    }
}
