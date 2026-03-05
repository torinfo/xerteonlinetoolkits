<?php

declare(strict_types=1);

namespace Qti3\Package\Filesystem\Zip;

use Qti3\Package\Model\FileContent\IMemoryFileContent;
use Qti3\Package\Model\IPackageWriter;
use Qti3\Package\Model\PackageFile\IPackageFile;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Filesystem\FileSystemUtils;
use Qti3\Package\Filesystem\Zip\Exception\ZipArchiveOpenFileException;
use RuntimeException;
use ZipArchive;

class ZipPackageWriter implements IPackageWriter
{
    /** @var array<int,string> */
    private array $tmpFiles = [];

    public function __construct(
        private readonly string $zipFilepath,
        private readonly ZipArchiveFactory $zipArchiveFactory,
        private readonly FileSystemUtils $fileSystemUtils,
    ) {}

    public function write(QtiPackage $qtiPackage): void
    {
        $zipArchive = $this->getZipArchive($this->zipFilepath);

        foreach ($qtiPackage->getFiles() as $file) {
            $this->addFile($file, $zipArchive);
        }

        $success = $zipArchive->close();
        $this->cleanup();
        if ($success === false) {
            throw new RuntimeException(sprintf('Unable to close zip: %s', $zipArchive->getStatusString())); // @codeCoverageIgnore
        }
    }

    public function getPublicUrl(): string
    {
        return $this->zipFilepath;
    }

    private function getZipArchive(string $archiveFilePath): ZipArchive
    {
        $zipArchive = $this->zipArchiveFactory->create();

        $this->fileSystemUtils->ensureDirectory(dirname($archiveFilePath));

        $openResult = $zipArchive->open($archiveFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        if ($openResult !== true) {
            throw new ZipArchiveOpenFileException($archiveFilePath);
        }

        return $zipArchive;
    }

    private function addFile(IPackageFile $file, ZipArchive $zipArchive): void
    {
        $content = $file->getContent();
        if ($content instanceof IMemoryFileContent) {
            $success = $zipArchive->addFromString($file->getFilepath(), $content->getContent());
            if ($success === false) {
                throw new RuntimeException(sprintf('Unable to add file %s to zip: %s', $file->getFilepath(), $zipArchive->getStatusString())); // @codeCoverageIgnore
            }
            return;
        }
        $localTmpFile = tempnam(sys_get_temp_dir(), 'qti_package_');
        if (!$localTmpFile) {
            throw new RuntimeException('Unable to create temporary file'); // @codeCoverageIgnore
        }
        $f = fopen($localTmpFile, 'w');
        if ($f === false) {
            throw new RuntimeException('Unable to open file: ' . $localTmpFile); // @codeCoverageIgnore
        }
        $this->tmpFiles[] = $localTmpFile;
        foreach ($content->getStream() as $chunk) {
            fwrite($f, $chunk);
        }
        fclose($f);
        $success = $zipArchive->addFile($localTmpFile, $file->getFilepath());
        if ($success === false) {
            throw new RuntimeException(sprintf('Unable to add file %s to zip: %s', $file->getFilepath(), $zipArchive->getStatusString())); // @codeCoverageIgnore
        }
    }

    private function cleanup(): void
    {
        foreach ($this->tmpFiles as $tmpFile) {
            unlink($tmpFile);
        }
        $this->tmpFiles = [];
    }
}
