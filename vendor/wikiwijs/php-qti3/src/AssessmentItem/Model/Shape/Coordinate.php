<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Shape;

use InvalidArgumentException;
use Stringable;

readonly class Coordinate implements Stringable
{
    public function __construct(
        private string $value,
    ) {
        if (!preg_match('/^\d+%?$/', $value)) {
            throw new InvalidArgumentException(sprintf('Invalid coordinate value: %s', $value));
        }
    }

    public function __toString(): string
    {
        return $this->value;
    }

    public function toFloat(): float
    {
        return (float) $this->value;
    }
}
