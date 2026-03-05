<?php

declare(strict_types=1);

namespace Qti3\Package\Filesystem;

use Qti3\Package\Model\FileContent\IFileContent;
use Qti3\Package\Model\IPackageWriter;
use Qti3\Package\Model\QtiPackage;
use Exception;
use League\Flysystem\FilesystemOperator;

readonly class FlysystemPackageWriter implements IPackageWriter
{
    public function __construct(
        private string $folderName,
        private FilesystemOperator $dataStorage,
    ) {}

    public function write(QtiPackage $qtiPackage): void
    {
        $this->dataStorage->createDirectory($this->folderName);

        foreach ($qtiPackage->getFiles() as $resourceFile) {
            $filePath = $this->folderName . '/' . $resourceFile->getFilepath();
            $this->writeStream($resourceFile->getContent(), $filePath);
        }
    }

    public function getPublicUrl(): string
    {
        return $this->dataStorage->publicUrl($this->folderName);
    }

    private function writeStream(IFileContent $fileContent, string $filename): void
    {
        // Opens a temporary file in memory or on disk when larger than 8MB
        $stream = fopen('php://temp/maxmemory=8388608', 'w+');

        try {
            if ($stream === false) {
                throw new Exception(sprintf('Unable to open stream for file %s', $filename)); // @codeCoverageIgnore
            }
            foreach ($fileContent->getStream() as $chunk) {
                fwrite($stream, $chunk);
            }
            rewind($stream);

            $this->dataStorage->writeStream($filename, $stream);
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }
        }
    }
}
