<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model;

use InvalidArgumentException;
use Stringable;
use Symfony\Component\Uid\Uuid;

final class AssessmentTestId implements Stringable
{
    private readonly string $value;

    private function __construct(string $value)
    {
        $this->value = $value;
    }

    public static function isValid(string $value): bool
    {
        return $value !== '';
    }

    public static function fromString(string $value): self
    {
        if (!self::isValid($value)) {
            throw new InvalidArgumentException(sprintf('The provided value `%s` is invalid', $value));
        }

        return new self($value);
    }

    public static function generate(): self
    {
        return new self(Uuid::v4()->toRfc4122());
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
