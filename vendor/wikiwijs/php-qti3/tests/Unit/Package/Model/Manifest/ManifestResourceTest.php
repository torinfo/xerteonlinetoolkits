<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\Manifest;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\ManifestResource;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\Manifest\ManifestResourceFileCollection;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ManifestResourceTest extends TestCase
{
    #[Test]
    public function testFromResourceFile(): void
    {
        $resourceFile = new Resource(
            'id',
            ResourceType::WEBCONTENT,
            'file.txt',
            new PackageFileCollection([
                new PackageFile('file.txt', new MemoryFileContent('content')),
            ]),
            new ManifestResourceDependencyCollection(),
        );

        $manifestResource = ManifestResource::fromResource($resourceFile);

        $this->assertEquals($resourceFile->identifier, $manifestResource->identifier);
    }

    #[Test]
    public function testMetadataResourceThrowsExceptionWhenHrefIsNull(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new ManifestResource(
            'id',
            ResourceType::RESOURCE_METADATA,
            new ManifestResourceFileCollection(),
            new ManifestResourceDependencyCollection(),
        );
    }
}
