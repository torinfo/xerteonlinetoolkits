<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Stylesheet;

use Qti3\Shared\Model\IQtiResourceProvider;
use Qti3\Shared\Model\QtiElement;
use Qti3\Shared\Model\QtiResource;

class Stylesheet extends QtiElement implements IQtiResourceProvider
{
    protected ?QtiResource $resource = null;

    public function __construct(
        public readonly string $filePath,
    ) {}

    public function getSource(): ?string
    {
        return $this->filePath;
    }

    public function isBinary(): bool
    {
        return false;
    }

    public function getResource(): ?QtiResource
    {
        return $this->resource;
    }

    public function setResource(QtiResource $resource): void
    {
        $this->resource = $resource;
    }

    /**
     * @return array<string, string|null>
     */
    public function attributes(): array
    {
        return [
            'href' => $this->resource ? ($this->resource->relativePath . $this->resource->filename) : '',
            'type' => 'text/css',
        ];
    }
}
