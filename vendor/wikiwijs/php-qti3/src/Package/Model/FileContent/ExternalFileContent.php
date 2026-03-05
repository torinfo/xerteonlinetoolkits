<?php

declare(strict_types=1);

namespace Qti3\Package\Model\FileContent;

use Qti3\Package\Downloader\Resource\IResourceDownloader;
use RuntimeException;

readonly class ExternalFileContent implements IFileContent
{
    public const MAX_MEMORY_USAGE = 8388608; // 8MB

    public function __construct(
        public string $url,
        private IResourceDownloader $resourceDownloader,
    ) {}

    public function getContent(): string
    {
        $content = '';
        foreach ($this->getStream() as $chunk) {
            if (strlen($content) + strlen($chunk) > self::MAX_MEMORY_USAGE) {
                throw new RuntimeException(sprintf('File content exceeds maximum memory usage of %d bytes', self::MAX_MEMORY_USAGE));
            }
            $content .= $chunk;
        }
        return $content;
    }

    public function getStream(): iterable
    {
        return $this->resourceDownloader->downloadFileToStream($this->url);
    }
}
