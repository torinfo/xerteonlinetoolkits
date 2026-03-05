<?php

declare(strict_types=1);

namespace Qti3\Package\Model\FileContent;

interface IFileContent
{
    public function getContent(): string;

    /**
     * @return iterable<string>
     */
    public function getStream(): iterable;
}
