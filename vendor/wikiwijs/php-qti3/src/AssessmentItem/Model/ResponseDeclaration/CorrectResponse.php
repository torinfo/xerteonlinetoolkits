<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\ResponseDeclaration;

use Qti3\Shared\Model\QtiElement;
use Qti3\Shared\Model\Value;
use InvalidArgumentException;

class CorrectResponse extends QtiElement
{
    /**
     * @param array<int,Value> $values
     */
    public function __construct(
        public readonly array $values,
    ) {
        if (count($values) === 0) {
            throw new InvalidArgumentException('CorrectResponse must have at least one value');
        }
    }

    public function attributes(): array
    {
        return [];
    }

    public function children(): array
    {
        return $this->values;
    }
}
