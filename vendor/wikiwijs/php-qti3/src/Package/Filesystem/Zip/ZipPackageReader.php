<?php

declare(strict_types=1);

namespace Qti3\Package\Filesystem\Zip;

use Qti3\Package\Model\FileContent\IFileContent;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\IPackageReader;
use DateTimeImmutable;
use RuntimeException;
use ZipArchive;

readonly class ZipPackageReader implements IPackageReader
{
    private ZipArchive $zip;

    public function __construct(
        string $zipfilePath,
        ZipArchiveFactory $zipArchiveFactory,
    ) {
        $this->zip = $zipArchiveFactory->create();

        if ($this->zip->open($zipfilePath) !== true) {
            throw new RuntimeException('Could not open ZIP file');
        }
    }

    public function getFileContent(string $filepath): IFileContent
    {
        $content = $this->zip->getFromName($filepath);
        if ($content === false) {
            throw new RuntimeException(sprintf('File %s not found in ZIP', $filepath));
        }

        return new MemoryFileContent($content);
    }

    public function getLastModified(): ?DateTimeImmutable
    {
        return null;
    }
}
