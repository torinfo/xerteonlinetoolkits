<?php

declare(strict_types=1);

namespace Qti3\Package\Downloader\Resource;

use Exception;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Qti3\Package\Filesystem\FileSystemUtils;

readonly class PsrHttpClientResourceDownloader implements IResourceDownloader
{
    public function __construct(
        private FileSystemUtils $fileSystemUtils,
        private ClientInterface $httpClient,
        private RequestFactoryInterface $requestFactory,
        private string $dataFolder,
    ) {}

    public function downloadFileToFilesystem(
        string $sourceUrl,
        string $targetFilePath,
    ): string {
        $filename = $this->dataFolder . '/' . $targetFilePath;

        if ($this->fileSystemUtils->isValidFile($filename)) {
            return $filename; // already downloaded
        }

        $this->fileSystemUtils->ensureDirectory(dirname($filename));

        try {
            $request = $this->requestFactory->createRequest('GET', $sourceUrl);
            $response = $this->httpClient->sendRequest($request);

            if ($response->getStatusCode() >= 400) {
                throw new Exception(sprintf(
                    'Failed to download %s. Status code: %d',
                    $sourceUrl,
                    $response->getStatusCode(),
                ));
            }

            $body = $response->getBody();
            $handle = fopen($filename, 'w');
            if ($handle === false) {
                throw new Exception('Unable to open file for writing: ' . $filename);
            }

            try {
                while (!$body->eof()) {
                    $chunk = $body->read(8192);
                    if ($chunk !== '') {
                        fwrite($handle, $chunk);
                    }
                }
            } finally {
                fclose($handle);
            }
        } catch (Exception $e) {
            if (file_exists($filename)) {
                unlink($filename);
            }
            throw new Exception(sprintf('Failed to download %s.', $sourceUrl), 0, $e);
        }

        return $filename;
    }

    public function downloadFileToStream(string $sourceUrl): iterable
    {
        try {
            $request = $this->requestFactory->createRequest('GET', $sourceUrl);
            $response = $this->httpClient->sendRequest($request);

            if ($response->getStatusCode() >= 400) {
                throw new Exception(sprintf(
                    'Failed to download %s. Status code: %d',
                    $sourceUrl,
                    $response->getStatusCode(),
                ));
            }

            $body = $response->getBody();
            while (!$body->eof()) {
                $chunk = $body->read(8192);
                if ($chunk !== '') {
                    yield $chunk;
                }
            }
        } catch (Exception $e) {
            throw new Exception(sprintf('Failed to download %s.', $sourceUrl), 0, $e);
        }
    }
}
