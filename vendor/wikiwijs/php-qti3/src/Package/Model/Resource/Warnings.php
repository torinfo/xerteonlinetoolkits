<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Resource;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Shared\Collection\StringCollection;

class Warnings extends Resource
{
    public const string WARNINGS_FILE_NAME = 'warnings.txt';

    public function __construct(StringCollection $warnings)
    {
        parent::__construct(
            'WARNINGS',
            ResourceType::CONTROLFILE,
            self::WARNINGS_FILE_NAME,
            new PackageFileCollection([
                new PackageFile(self::WARNINGS_FILE_NAME, new MemoryFileContent($warnings->join(PHP_EOL))),
            ]),
            new ManifestResourceDependencyCollection(),
        );
    }
}
