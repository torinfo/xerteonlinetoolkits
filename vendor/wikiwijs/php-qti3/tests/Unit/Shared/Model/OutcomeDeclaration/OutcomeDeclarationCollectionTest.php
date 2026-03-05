<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model\OutcomeDeclaration;

use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclaration;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OutcomeDeclarationCollectionTest extends TestCase
{
    private OutcomeDeclarationCollection $collection;

    protected function setUp(): void
    {
        $this->collection = new OutcomeDeclarationCollection();
    }

    #[Test]
    public function itShouldReturnOutcomeDeclarationClassAsType(): void
    {
        $this->assertEquals(
            OutcomeDeclaration::class,
            $this->collection->getType(),
        );
    }

    #[Test]
    public function requestingANonExistingIdentifierThrowsException(): void
    {
        // Act & Assert

        $this->expectException(InvalidArgumentException::class);
        $this->collection->getByIdentifier('non-existing');
    }
}
