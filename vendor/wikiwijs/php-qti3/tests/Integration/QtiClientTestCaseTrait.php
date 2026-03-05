<?php

namespace Qti3\Tests\Integration;

use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamInterface;
use Qti3\Package\Downloader\Resource\PsrHttpClientResourceDownloader;
use Qti3\Package\Filesystem\FileSystemUtils;
use Qti3\Package\Filesystem\FlysystemPackageFactory;
use Qti3\Package\Service\IFilesystemPackageFactory;
use Qti3\Package\Validator\Resource\PsrHttpClientResourceValidator;
use Qti3\QtiClient;
use Qti3\Package\Downloader\Resource\IResourceDownloader;
use Qti3\Package\Validator\Resource\IResourceValidator;

trait QtiClientTestCaseTrait
{
    private string $tempDataDir;

    protected function setUpQtiClientTestCase(): void
    {
        $this->tempDataDir = sys_get_temp_dir() . '/qti_test_data_' . uniqid();
        mkdir($this->tempDataDir, 0777, true);
    }

    protected function tearDownQtiClientTestCase(): void
    {
        $this->removeDirectory($this->tempDataDir);
    }

    private function removeDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            (is_dir("$dir/$file")) ? $this->removeDirectory("$dir/$file") : unlink("$dir/$file");
        }
        rmdir($dir);
    }

    protected function createClient(
        ?IFilesystemPackageFactory $filesystemPackageFactory = null,
        ?IResourceValidator $resourceValidator = null,
        ?IResourceDownloader $resourceDownloader = null,
    ): QtiClient {
        $httpClient = $this->createMock(ClientInterface::class);
        $requestFactory = $this->createMock(RequestFactoryInterface::class);

        // Default response for http mock
        $response = $this->createMock(ResponseInterface::class);
        $response->method('getStatusCode')->willReturn(200);
        $stream = $this->createMock(StreamInterface::class);
        $stream->method('eof')->willReturn(true);
        $response->method('getBody')->willReturn($stream);

        $httpClient->method('sendRequest')->willReturn($response);

        return new QtiClient(
            $filesystemPackageFactory ?? new FlysystemPackageFactory(
                new Filesystem(new LocalFilesystemAdapter($this->tempDataDir))
            ),
            $resourceValidator ?? new PsrHttpClientResourceValidator(
                $httpClient,
                $requestFactory,
            ),
            $resourceDownloader ?? new PsrHttpClientResourceDownloader(
                new FileSystemUtils(),
                $httpClient,
                $requestFactory,
                $this->tempDataDir
            ),
        );
    }
}
