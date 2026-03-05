<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Resource;

use Qti3\Package\Model\FileContent\ExternalFileContent;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Downloader\Resource\IResourceDownloader;
use RuntimeException;

class Webcontent extends Resource
{
    public function __construct(
        public readonly string $originalPath,
        string $identifier,
        string $filepath,
        private readonly IResourceDownloader $resourceDownloader,
        bool $isBinary = true,
    ) {
        $isExternal = (bool) preg_match('~^https?://~i', $originalPath);

        if ($isExternal) {
            $content = new ExternalFileContent($originalPath, $this->resourceDownloader);
        } else {
            $fileContent = file_get_contents($this->originalPath);
            if ($fileContent === false) {
                throw new RuntimeException('Unable to read file: ' . $this->originalPath); // @codeCoverageIgnore
            }
            $content = new MemoryFileContent($fileContent);
        }
        parent::__construct(
            $identifier,
            ResourceType::WEBCONTENT,
            $filepath,
            new PackageFileCollection(
                [new PackageFile(
                    $filepath,
                    $content,
                    $isBinary,
                )],
            ),
            new ManifestResourceDependencyCollection(),
        );
    }
}
