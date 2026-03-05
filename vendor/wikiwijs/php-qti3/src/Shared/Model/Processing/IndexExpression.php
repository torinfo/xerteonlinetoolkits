<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\AssessmentItem\Model\State\ItemState;
use RuntimeException;

class IndexExpression
{
    public function __construct(
        public string $value,
    ) {}

    public function evaluate(ItemState $state): int
    {
        if (is_numeric($this->value)) {
            return (int) $this->value;
        }

        // value is identifier
        $value = $state->getValue($this->value);

        if (!is_numeric($value)) {
            throw new RuntimeException('Value is not numeric');
        }

        return (int) $value;
    }
}
