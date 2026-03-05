<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Collection;

use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use stdClass;

class AbstractCollectionTest extends TestCase
{
    private ContentNodeCollection $collection;

    protected function setUp(): void
    {
        $this->collection = new ContentNodeCollection();
    }

    #[Test]
    public function offsetExistsReturnsTrueForExistingOffset(): void
    {
        $node = new TextNode('hello');
        $this->collection->add($node);

        $this->assertTrue(isset($this->collection[0]));
    }

    #[Test]
    public function offsetExistsReturnsFalseForMissingOffset(): void
    {
        $this->assertFalse(isset($this->collection[0]));
    }

    #[Test]
    public function offsetSetWithSpecificOffsetSetsAtThatPosition(): void
    {
        $node1 = new TextNode('first');
        $node2 = new TextNode('second');

        $this->collection[] = $node1;
        $this->collection[0] = $node2;

        $this->assertSame($node2, $this->collection[0]);
        $this->assertCount(1, $this->collection);
    }

    #[Test]
    public function offsetSetWithNullOffsetAppendsItem(): void
    {
        $node = new TextNode('appended');

        $this->collection[] = $node;

        $this->assertSame($node, $this->collection[0]);
        $this->assertCount(1, $this->collection);
    }

    #[Test]
    public function offsetUnsetRemovesItemAtOffset(): void
    {
        $node1 = new TextNode('first');
        $node2 = new TextNode('second');
        $this->collection->add($node1);
        $this->collection->add($node2);

        unset($this->collection[0]);

        $this->assertFalse(isset($this->collection[0]));
        $this->assertCount(1, $this->collection);
    }

    #[Test]
    public function removeFiltersOutTheGivenItem(): void
    {
        $node1 = new TextNode('first');
        $node2 = new TextNode('second');
        $node3 = new TextNode('third');
        $this->collection->add($node1);
        $this->collection->add($node2);
        $this->collection->add($node3);

        $this->collection->remove($node2);

        $this->assertCount(2, $this->collection);
        $this->assertFalse($this->collection->has($node2));
        $this->assertTrue($this->collection->has($node1));
        $this->assertTrue($this->collection->has($node3));
    }

    #[Test]
    public function validateThrowsInvalidArgumentExceptionForWrongType(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Only instances of');

        $this->collection->add(new stdClass());
    }

    #[Test]
    public function constructorThrowsInvalidArgumentExceptionForWrongType(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Only instances of');

        new ContentNodeCollection([new stdClass()]);
    }

    #[Test]
    public function offsetSetThrowsInvalidArgumentExceptionForWrongType(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Only instances of');

        $this->collection[0] = new stdClass();
    }

    #[Test]
    public function isEmptyReturnsTrueWhenCollectionHasNoItems(): void
    {
        $this->assertTrue($this->collection->isEmpty());
    }

    #[Test]
    public function isEmptyReturnsFalseWhenCollectionHasItems(): void
    {
        $this->collection->add(new TextNode('hello'));

        $this->assertFalse($this->collection->isEmpty());
    }
}
