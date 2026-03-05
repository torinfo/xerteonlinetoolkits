<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Collection;

use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Shared\Collection\StringCollection;

class StringCollectionTest extends TestCase
{
    private StringCollection $collection;

    protected function setUp(): void
    {
        $this->collection = new StringCollection();
    }

    #[Test]
    public function validateThrowsInvalidArgumentExceptionForNonString(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Only strings are allowed in this collection.');

        $this->collection->add(123);
    }

    #[Test]
    public function constructorThrowsInvalidArgumentExceptionForNonString(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Only strings are allowed in this collection.');

        new StringCollection([42]);
    }

    #[Test]
    public function uniqueReturnsDeduplicated(): void
    {
        $collection = new StringCollection(['apple', 'banana', 'apple', 'cherry', 'banana']);

        $unique = $collection->unique();

        $this->assertCount(3, $unique);
        $this->assertSame(['apple', 'banana', 'cherry'], $unique->all());
    }

    #[Test]
    public function uniqueReturnsNewInstance(): void
    {
        $collection = new StringCollection(['a', 'a', 'b']);

        $unique = $collection->unique();

        $this->assertNotSame($collection, $unique);
        $this->assertCount(3, $collection);
        $this->assertCount(2, $unique);
    }

    #[Test]
    public function sortReordersItemsUsingCallback(): void
    {
        $collection = new StringCollection(['cherry', 'apple', 'banana']);

        $collection->sort(fn(string $a, string $b): int => strcmp($a, $b));

        $this->assertSame(['apple', 'banana', 'cherry'], $collection->all());
    }

    #[Test]
    public function sortDescendingOrder(): void
    {
        $collection = new StringCollection(['apple', 'cherry', 'banana']);

        $collection->sort(fn(string $a, string $b): int => strcmp($b, $a));

        $this->assertSame(['cherry', 'banana', 'apple'], $collection->all());
    }
}
