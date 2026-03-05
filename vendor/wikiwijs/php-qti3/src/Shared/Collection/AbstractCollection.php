<?php

declare(strict_types=1);

namespace Qti3\Shared\Collection;

use ArrayAccess;
use ArrayIterator;
use Closure;
use Countable;
use InvalidArgumentException;
use IteratorAggregate;
use Traversable;

/**
 * @template T
 * @implements IteratorAggregate<T>
 * @implements ArrayAccess<int,T>
 */
abstract class AbstractCollection implements ArrayAccess, IteratorAggregate, Countable
{
    /** @var array<int, T> */
    protected array $items = [];
    protected string $type;

    /** @param array<int, T> $items */
    final public function __construct(array $items = [])
    {
        $this->type = $this->getType();
        foreach ($items as $item) {
            $this->validate($item);
        }
        $this->items = $items;
    }

    public function offsetExists(mixed $offset): bool
    {
        return isset($this->items[$offset]);
    }

    /**
     * @return T
     */
    public function offsetGet(mixed $offset): mixed
    {
        return $this->items[$offset];
    }

    /**
     * @param int|null $offset
     * @param T $value
     */
    public function offsetSet(mixed $offset, mixed $value): void
    {
        $this->validate($value);
        if (is_null($offset)) {
            $this->items[] = $value;
        } else {
            $this->items[$offset] = $value;
        }
    }

    public function offsetUnset(mixed $offset): void
    {
        unset($this->items[$offset]);
    }

    /**
     * @return Traversable<int|string,T>
     */
    public function getIterator(): Traversable
    {
        return new ArrayIterator($this->items);
    }

    public function count(): int
    {
        return count($this->items);
    }

    /**
     * @param T $item
     */
    public function add(mixed $item): void
    {
        $this->validate($item);
        $this->items[] = $item;
    }

    /**
     * @param T $item
     */
    public function remove(mixed $item): void
    {
        $this->items = array_filter($this->items, fn($i): bool => $i !== $item);
    }

    protected function validate(mixed $item): void
    {
        if (!($item instanceof $this->type)) {
            throw new InvalidArgumentException(
                sprintf("Only instances of %s are allowed in this collection.", $this->type),
            );
        }
    }

    abstract protected function getType(): string;

    /** @return array<int, T> */
    public function all(): array
    {
        return $this->items;
    }

    /** @return static<T> */
    public function filter(Closure $param): static
    {
        return new static(array_values(array_filter($this->items, $param)));
    }

    /**
     * @return T|null
     */
    public function first(): mixed
    {
        return reset($this->items) ?: null;
    }

    /**
     * @param T $item
     */
    public function has(mixed $item): bool
    {
        return in_array($item, $this->items, true);
    }

    public function isEmpty(): bool
    {
        return $this->items === [];
    }
}
