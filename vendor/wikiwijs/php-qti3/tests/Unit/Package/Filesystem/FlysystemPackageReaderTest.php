<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Filesystem;

use DateTimeImmutable;
use League\Flysystem\FilesystemOperator;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\FlysystemPackageReader;
use Qti3\Package\Model\FileContent\FlysystemFileContent;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Shared\Exception\NotFoundException;

class FlysystemPackageReaderTest extends TestCase
{
    #[Test]
    public function constructorThrowsNotFoundExceptionWhenDirectoryDoesNotExist(): void
    {
        $dataStorage = $this->createMock(FilesystemOperator::class);
        $dataStorage->method('directoryExists')
            ->with('missing-folder')
            ->willReturn(false);

        $this->expectException(NotFoundException::class);
        $this->expectExceptionMessage('Folder `missing-folder` not found');

        new FlysystemPackageReader('missing-folder', $dataStorage);
    }

    #[Test]
    public function constructorSucceedsWhenDirectoryExists(): void
    {
        $dataStorage = $this->createMock(FilesystemOperator::class);
        $dataStorage->method('directoryExists')
            ->with('existing-folder')
            ->willReturn(true);

        $reader = new FlysystemPackageReader('existing-folder', $dataStorage);

        $this->assertInstanceOf(FlysystemPackageReader::class, $reader);
    }

    #[Test]
    public function getFileContentReturnsFlysystemFileContentWhenLazyLoading(): void
    {
        $dataStorage = $this->createMock(FilesystemOperator::class);
        $dataStorage->method('directoryExists')
            ->with('my-folder')
            ->willReturn(true);

        $reader = new FlysystemPackageReader('my-folder', $dataStorage, true);

        $fileContent = $reader->getFileContent('item.xml');

        $this->assertInstanceOf(FlysystemFileContent::class, $fileContent);
    }

    #[Test]
    public function getFileContentReturnsMemoryFileContentWhenNotLazyLoading(): void
    {
        $dataStorage = $this->createMock(FilesystemOperator::class);
        $dataStorage->method('directoryExists')
            ->with('my-folder')
            ->willReturn(true);
        $dataStorage->method('read')
            ->with('my-folder/item.xml')
            ->willReturn('<qti-assessment-item/>');

        $reader = new FlysystemPackageReader('my-folder', $dataStorage, false);

        $fileContent = $reader->getFileContent('item.xml');

        $this->assertInstanceOf(MemoryFileContent::class, $fileContent);
        $this->assertSame('<qti-assessment-item/>', $fileContent->getContent());
    }

    #[Test]
    public function getLastModifiedReturnsDateTimeImmutable(): void
    {
        $timestamp = 1700000000;

        $dataStorage = $this->createMock(FilesystemOperator::class);
        $dataStorage->method('directoryExists')
            ->with('my-folder')
            ->willReturn(true);
        $dataStorage->method('lastModified')
            ->with('my-folder')
            ->willReturn($timestamp);

        $reader = new FlysystemPackageReader('my-folder', $dataStorage);

        $lastModified = $reader->getLastModified();

        $this->assertInstanceOf(DateTimeImmutable::class, $lastModified);
        $this->assertSame($timestamp, $lastModified->getTimestamp());
    }
}
