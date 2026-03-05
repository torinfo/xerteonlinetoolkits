<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Resource;

use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\Metadata\Metadata;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use InvalidArgumentException;

class Resource
{
    public function __construct(
        public readonly string $identifier,
        public readonly ResourceType $type,
        public readonly ?string $href,
        public readonly PackageFileCollection $files,
        public readonly ManifestResourceDependencyCollection $resourceDependencies,
        public ?Metadata $metadata = null,
    ) {
        $this->validateHref();
    }

    public function getMainFile(): ?PackageFile
    {
        if (!$this->href) {
            return null;
        }

        foreach ($this->files as $file) {
            if ($file->getFilepath() === $this->href) {
                return $file;
            }
        }

        return null; // @codeCoverageIgnore
    }

    private function validateHref(): void
    {
        if (!$this->href) {
            return;
        }

        /** @var PackageFile $file */
        foreach ($this->files->all() as $file) {
            if ($file->getFilepath() === $this->href) {
                return;
            }
        }

        throw new InvalidArgumentException(sprintf('Resource with identifier %s has invalid href %s', $this->identifier, $this->href));
    }
}
