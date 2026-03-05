<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Filesystem;

use League\Flysystem\Filesystem;
use League\Flysystem\FilesystemOperator;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\FlysystemPackageWriter;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\QtiPackage;

class FlysystemPackageWriterTest extends TestCase
{
    #[Test]
    public function writeCreatesDirectoryAndWritesFiles(): void
    {
        $dataStorage = $this->createMock(FilesystemOperator::class);

        $dataStorage->expects($this->once())
            ->method('createDirectory')
            ->with('output-folder');

        $dataStorage->expects($this->exactly(2))
            ->method('writeStream')
            ->willReturnCallback(function (string $path, $stream): void {
                $this->assertIsResource($stream);
                $content = stream_get_contents($stream);
                if ($path === 'output-folder/manifest.xml') {
                    $this->assertSame('<manifest/>', $content);
                } elseif ($path === 'output-folder/item.xml') {
                    $this->assertSame('<item/>', $content);
                } else {
                    $this->fail('Unexpected file path: ' . $path);
                }
            });

        $file1 = new PackageFile('manifest.xml', new MemoryFileContent('<manifest/>'));
        $file2 = new PackageFile('item.xml', new MemoryFileContent('<item/>'));

        $qtiPackage = $this->createMock(QtiPackage::class);
        $qtiPackage->method('getFiles')
            ->willReturn(new PackageFileCollection([$file1, $file2]));

        $writer = new FlysystemPackageWriter('output-folder', $dataStorage);
        $writer->write($qtiPackage);
    }

    #[Test]
    public function writeHandlesEmptyPackage(): void
    {
        $dataStorage = $this->createMock(FilesystemOperator::class);

        $dataStorage->expects($this->once())
            ->method('createDirectory')
            ->with('output-folder');

        $dataStorage->expects($this->never())
            ->method('writeStream');

        $qtiPackage = $this->createMock(QtiPackage::class);
        $qtiPackage->method('getFiles')
            ->willReturn(new PackageFileCollection());

        $writer = new FlysystemPackageWriter('output-folder', $dataStorage);
        $writer->write($qtiPackage);
    }

    #[Test]
    public function getPublicUrlReturnsPublicUrlFromDataStorage(): void
    {
        // publicUrl is on the concrete Filesystem class, not on FilesystemOperator interface
        $dataStorage = $this->createMock(Filesystem::class);
        $dataStorage->expects($this->once())
            ->method('publicUrl')
            ->with('output-folder')
            ->willReturn('https://cdn.example.com/output-folder');

        $writer = new FlysystemPackageWriter('output-folder', $dataStorage);

        $this->assertSame('https://cdn.example.com/output-folder', $writer->getPublicUrl());
    }
}
