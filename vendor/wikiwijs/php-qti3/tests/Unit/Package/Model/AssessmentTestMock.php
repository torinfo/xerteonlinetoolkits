<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\Metadata\Metadata;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;

class AssessmentTestMock extends Resource
{
    public function __construct(
        string $identifier,
        ?Metadata $metadata = null,
    ) {
        parent::__construct(
            $identifier,
            ResourceType::ASSESSMENT_TEST,
            $identifier . '.xml',
            new PackageFileCollection([
                new PackageFile($identifier . '.xml', new MemoryFileContent('content')),
            ]),
            new ManifestResourceDependencyCollection(),
            $metadata,
        );
    }
}
