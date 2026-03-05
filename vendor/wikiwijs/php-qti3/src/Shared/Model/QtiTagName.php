<?php

declare(strict_types=1);

namespace Qti3\Shared\Model;

use Stringable;

readonly class QtiTagName implements Stringable
{
    public function __construct(private string $className) {}

    public function __toString(): string
    {
        $classNameParts = explode('\\', $this->className);
        $shortName = end($classNameParts);
        return  'qti-' . strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $shortName) ?? '');
    }
}
