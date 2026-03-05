<?php

declare(strict_types=1);

namespace Qti3\Package\Model\Resource;

use Qti3\Shared\Collection\AbstractCollection;

/**
 * @template-extends AbstractCollection<Resource>
 */
class ResourceCollection extends AbstractCollection
{
    public function filterByType(ResourceType $type): ResourceCollection
    {
        return $this->filter(fn(Resource $resource): bool => $resource->type === $type);
    }

    protected function getType(): string
    {
        return Resource::class;
    }
}
