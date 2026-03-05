<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Manifest;

use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use InvalidArgumentException;

readonly class ManifestResource
{
    public function __construct(
        public string $identifier,
        public ResourceType $type,
        public ManifestResourceFileCollection $files,
        public ManifestResourceDependencyCollection $dependencies,
        public ?string $href = null,
    ) {
        if ($type->requiresHref() && empty($href)) {
            throw new InvalidArgumentException(sprintf('Resource type %s requires href', $type->value));
        }
    }

    public static function fromResource(Resource $resource): self
    {
        return new self(
            $resource->identifier,
            $resource->type,
            new ManifestResourceFileCollection(array_map(
                fn(PackageFile $file): ManifestResourceFile => new ManifestResourceFile($file->getFilepath()),
                $resource->files->all(),
            )),
            $resource->resourceDependencies,
            $resource->href,
        );
    }
}
