<?php

declare(strict_types=1);

namespace Qti3\Shared\Model;

final class DefaultValue extends QtiElement
{
    public function __construct(
        public readonly Value $value,
    ) {}

    /**
     * @return array<int,IContentNode>
     */
    public function children(): array
    {
        return [$this->value];
    }
}
