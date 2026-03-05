<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model;

use InvalidArgumentException;
use Stringable;

final class AssessmentItemId implements Stringable
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

    public function __toString(): string
    {
        return $this->value;
    }

    public function equals(AssessmentItemId $assessmentItemId): bool
    {
        return $this->value === $assessmentItemId->value;
    }
}
