<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model;

use Qti3\Shared\Model\BaseType;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class BaseTypeTest extends TestCase
{
    #[Test]
    public function fitsIsReflexive(): void
    {
        foreach (BaseType::cases() as $case) {
            self::assertTrue($case->fits($case), sprintf('Expected %s to fit itself', $case->value));
        }
    }

    #[Test]
    public function floatFitsIntegerAndFloat(): void
    {
        self::assertTrue(BaseType::FLOAT->fits(BaseType::INTEGER));
        self::assertTrue(BaseType::FLOAT->fits(BaseType::FLOAT));
        self::assertFalse(BaseType::FLOAT->fits(BaseType::STRING));
        self::assertFalse(BaseType::FLOAT->fits(BaseType::BOOLEAN));
        self::assertFalse(BaseType::FLOAT->fits(BaseType::IDENTIFIER));
        self::assertFalse(BaseType::FLOAT->fits(BaseType::URI));
    }

    #[Test]
    public function stringFitsStringIdentifierIntegerFloat(): void
    {
        self::assertTrue(BaseType::STRING->fits(BaseType::STRING));
        self::assertTrue(BaseType::STRING->fits(BaseType::IDENTIFIER));
        self::assertTrue(BaseType::STRING->fits(BaseType::INTEGER));
        self::assertTrue(BaseType::STRING->fits(BaseType::FLOAT));

        self::assertFalse(BaseType::STRING->fits(BaseType::BOOLEAN));
        self::assertFalse(BaseType::STRING->fits(BaseType::POINT));
        self::assertFalse(BaseType::STRING->fits(BaseType::PAIR));
        self::assertFalse(BaseType::STRING->fits(BaseType::DIRECTED_PAIR));
        self::assertFalse(BaseType::STRING->fits(BaseType::DURATION));
        self::assertFalse(BaseType::STRING->fits(BaseType::FILE));
        self::assertFalse(BaseType::STRING->fits(BaseType::URI));
    }

    #[Test]
    public function otherTypesOnlyFitThemselves(): void
    {
        $specials = [
            BaseType::BOOLEAN,
            BaseType::POINT,
            BaseType::PAIR,
            BaseType::DIRECTED_PAIR,
            BaseType::DURATION,
            BaseType::FILE,
            BaseType::IDENTIFIER,
            BaseType::URI,
            BaseType::INTEGER,
        ];

        foreach ($specials as $left) {
            foreach (BaseType::cases() as $right) {
                if ($left === $right) {
                    self::assertTrue($left->fits($right), sprintf('%s should fit itself', $left->value));
                } else {
                    // Note: FLOAT and STRING rules are tested separately.
                    if ($left !== BaseType::FLOAT && $left !== BaseType::STRING) {
                        self::assertFalse($left->fits($right), sprintf('%s should not fit %s', $left->value, $right->value));
                    }
                }
            }
        }
    }
}
