<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\Resource;

use Qti3\Package\Model\Resource\Webcontent;
use Qti3\Package\Downloader\Resource\IResourceDownloader;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class WebcontentTest extends TestCase
{
    private string $tempDir;
    private string $filename;
    private string $originalPath;
    private bool $isBinary;
    private IResourceDownloader $resourceDownloader;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tempDir = sys_get_temp_dir();
        $this->filename = 'file.xml';
        $this->originalPath = $this->tempDir . '/' . $this->filename;
        $this->isBinary = true;
        $this->resourceDownloader = $this->createMock(IResourceDownloader::class);
    }

    #[Test]
    public function itShouldReturnTheFilename(): void
    {
        $webcontent = new Webcontent(
            'https://example.com/file.xml',
            'ID',
            $this->filename,
            $this->resourceDownloader,
            $this->isBinary,
        );

        $this->assertEquals($this->filename, $webcontent->href);
        $this->assertEquals('https://example.com/file.xml', $webcontent->files->first()->getContent()->url);
    }

    #[Test]
    public function itShouldReturnTheContent(): void
    {
        $str = 'This is a binary file';

        file_put_contents($this->originalPath, $str);

        $webcontent = new Webcontent($this->originalPath, 'ID', $this->filename, $this->resourceDownloader, $this->isBinary);

        $this->assertNotEmpty($webcontent->files->first()->getContent());

        unlink($this->originalPath);
    }

    #[Test]
    public function itShouldReturnTrueIfTheFileIsBinary(): void
    {
        $resourceFile = new Webcontent('https://example.com/file.xml', 'ID', $this->filename, $this->resourceDownloader, $this->isBinary);

        $this->assertTrue($resourceFile->files->first()->isBinary());
    }
}
