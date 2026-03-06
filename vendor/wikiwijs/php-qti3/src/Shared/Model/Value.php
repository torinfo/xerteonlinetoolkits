<?php

declare(strict_types=1);

namespace Qti3\Shared\Model;

use Stringable;

final class Value extends QtiElement implements Stringable
{
    public function __construct(
        public string|int|float|bool $value,
    ) {}

    /**
     * @return array<int,IContentNode>
     */
    public function children(): array
    {
        return [new TextNode($this->serialize())];
    }

    public function __toString(): string
    {
        return $this->serialize();
    }

    private function serialize(): string
    {
        return match(true) {
            is_bool($this->value) => $this->value ? 'true' : 'false',
            default               => (string) $this->value,
        };
    }
}
