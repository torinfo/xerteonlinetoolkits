<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\Section;

use Qti3\Shared\Model\QtiElement;

class Selection extends QtiElement
{
    public function __construct(
        public readonly int $select,
        public readonly bool $withReplacement,
    ) {}

    /**
     * @return array<string, string|null>
     */
    public function attributes(): array
    {
        return [
            'select' => (string) $this->select,
            'with-replacement' => $this->withReplacement ? 'true' : 'false',
        ];
    }
}
