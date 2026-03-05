<?php

declare(strict_types=1);

namespace Qti3\Shared\Collection;

use InvalidArgumentException;

/**
 * @extends AbstractCollection<string>
 */
class StringCollection extends AbstractCollection
{
    public function join(string $separator): string
    {
        return implode($separator, $this->items);
    }

    /**
     * @return string
     */
    protected function getType(): string
    {
        return 'string';
    }

    protected function validate(mixed $item): void
    {
        if (!is_string($item)) {
            throw new InvalidArgumentException('Only strings are allowed in this collection.');
        }
    }

    public function mergeWith(StringCollection $mergeWithCollection): StringCollection
    {
        return new StringCollection(array_merge($this->items, $mergeWithCollection->items));
    }

    public function unique(): StringCollection
    {
        return new StringCollection(array_values(array_unique($this->items)));
    }

    public function sort(callable $sortFunction): void
    {
        usort($this->items, $sortFunction);
    }
}
