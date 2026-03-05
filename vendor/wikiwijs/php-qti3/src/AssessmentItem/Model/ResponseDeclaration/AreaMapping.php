<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\ResponseDeclaration;

use Qti3\Shared\Model\QtiElement;

class AreaMapping extends QtiElement
{
    /**
     * @param array<int,AreaMapEntry> $entries
     */
    public function __construct(
        public readonly array $entries,
        public readonly ?string $defaultValue = null,
    ) {}

    public function attributes(): array
    {
        return [
            'default-value' => $this->defaultValue,
        ];
    }

    public function children(): array
    {
        return $this->entries;
    }
}
