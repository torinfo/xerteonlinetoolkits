<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\Section;

use Qti3\Shared\Model\QtiElement;

class Ordering extends QtiElement
{
    public function __construct(
        public readonly bool $shuffle,
    ) {}

    /**
     * @return array<string, string|null>
     */
    public function attributes(): array
    {
        return [
            'shuffle' => $this->shuffle ? 'true' : 'false',
        ];
    }
}
