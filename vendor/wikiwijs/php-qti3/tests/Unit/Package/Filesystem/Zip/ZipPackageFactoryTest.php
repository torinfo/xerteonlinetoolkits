<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Filesystem\Zip;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\FileSystemUtils;
use Qti3\Package\Filesystem\Zip\ZipArchiveFactory;
use Qti3\Package\Filesystem\Zip\ZipPackageFactory;
use Qti3\Package\Filesystem\Zip\ZipPackageReader;
use Qti3\Package\Filesystem\Zip\ZipPackageWriter;
use ZipArchive;

class ZipPackageFactoryTest extends TestCase
{
    private string $tempZipFile;

    protected function setUp(): void
    {
        $this->tempZipFile = tempnam(sys_get_temp_dir(), 'qti_factory_test_') . '.zip';

        // Create a valid zip file for the reader test
        $zip = new ZipArchive();
        $zip->open($this->tempZipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $zip->addFromString('test.txt', 'test content');
        $zip->close();
    }

    protected function tearDown(): void
    {
        if (is_file($this->tempZipFile)) {
            unlink($this->tempZipFile);
        }
        // Clean up the tempnam file without extension if it exists
        $baseName = preg_replace('/\.zip$/', '', $this->tempZipFile);
        if (is_file($baseName)) {
            unlink($baseName);
        }
    }

    #[Test]
    public function getReaderReturnsZipPackageReader(): void
    {
        $factory = new ZipPackageFactory(
            new ZipArchiveFactory(),
            new FileSystemUtils(),
        );

        $reader = $factory->getReader($this->tempZipFile);

        $this->assertInstanceOf(ZipPackageReader::class, $reader);
    }

    #[Test]
    public function getWriterReturnsZipPackageWriter(): void
    {
        $factory = new ZipPackageFactory(
            new ZipArchiveFactory(),
            new FileSystemUtils(),
        );

        $writer = $factory->getWriter($this->tempZipFile);

        $this->assertInstanceOf(ZipPackageWriter::class, $writer);
    }
}
