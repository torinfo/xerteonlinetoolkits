<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Filesystem\Zip;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\Zip\ZipFileFinder;

class ZipFileFinderTest extends TestCase
{
    private string $tempDir;

    /** @var list<string> */
    private array $tempFiles = [];

    protected function setUp(): void
    {
        $this->tempDir = sys_get_temp_dir() . '/qti_zipfinder_test_' . uniqid();
        mkdir($this->tempDir);
    }

    protected function tearDown(): void
    {
        foreach ($this->tempFiles as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        if (is_dir($this->tempDir)) {
            rmdir($this->tempDir);
        }
    }

    #[Test]
    public function findInReturnsZipFilesInDirectory(): void
    {
        $zipFile = $this->tempDir . '/test.zip';
        touch($zipFile);
        $this->tempFiles[] = $zipFile;

        $finder = new ZipFileFinder();
        $results = $finder->findIn($this->tempDir);

        $filenames = [];
        foreach ($results as $file) {
            $filenames[] = $file->getPathname();
        }

        $this->assertCount(1, $filenames);
        $this->assertSame($zipFile, $filenames[0]);
    }

    #[Test]
    public function findInReturnsEmptyIteratorForDirectoryWithoutZipFiles(): void
    {
        $txtFile = $this->tempDir . '/test.txt';
        touch($txtFile);
        $this->tempFiles[] = $txtFile;

        $finder = new ZipFileFinder();
        $results = $finder->findIn($this->tempDir);

        $filenames = [];
        foreach ($results as $file) {
            $filenames[] = $file->getPathname();
        }

        $this->assertCount(0, $filenames);
    }

    #[Test]
    public function findInReturnsMultipleZipFiles(): void
    {
        $zip1 = $this->tempDir . '/first.zip';
        $zip2 = $this->tempDir . '/second.zip';
        touch($zip1);
        touch($zip2);
        $this->tempFiles[] = $zip1;
        $this->tempFiles[] = $zip2;

        $finder = new ZipFileFinder();
        $results = $finder->findIn($this->tempDir);

        $filenames = [];
        foreach ($results as $file) {
            $filenames[] = $file->getPathname();
        }

        sort($filenames);

        $this->assertCount(2, $filenames);
        $this->assertSame($zip1, $filenames[0]);
        $this->assertSame($zip2, $filenames[1]);
    }
}
