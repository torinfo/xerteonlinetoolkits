<?php

declare(strict_types=1);

namespace Qti3\Package\Filesystem;

use Qti3\Shared\Exception\NotFoundException;
use Qti3\Package\Model\FileContent\IFileContent;
use Qti3\Package\Model\FileContent\FlysystemFileContent;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\IPackageReader;
use DateTimeImmutable;
use League\Flysystem\FilesystemOperator;

readonly class FlysystemPackageReader implements IPackageReader
{
    public function __construct(
        private string $folderName,
        private FilesystemOperator $dataStorage,
        private bool $lazyLoading = true,
    ) {
        if (!$this->dataStorage->directoryExists($this->folderName)) {
            throw new NotFoundException(sprintf('Folder `%s` not found', $this->folderName), 'folder_not_found');
        }
    }

    public function getFileContent(string $filepath): IFileContent
    {
        if ($this->lazyLoading) {
            return new FlysystemFileContent(
                $this->dataStorage,
                $this->folderName . '/' . $filepath,
            );
        }
        return new MemoryFileContent($this->dataStorage->read($this->folderName . '/' . $filepath));
    }

    public function getLastModified(): ?DateTimeImmutable
    {
        return (new DateTimeImmutable())->setTimestamp($this->dataStorage->lastModified($this->folderName));
    }
}
