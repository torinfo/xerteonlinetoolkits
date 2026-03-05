<?php

declare(strict_types=1);

namespace Qti3\Package\Model\FileContent;

readonly class MemoryFileContent implements IMemoryFileContent
{
    public function __construct(
        public string $content,
    ) {}

    public function __toString(): string
    {
        return $this->content;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getStream(): iterable
    {
        return [$this->content];
    }
}
