<?php

declare(strict_types=1);

namespace Qti3\Shared\Model;

interface IXmlElement extends IContentNode
{
    public function tagName(): string;

    /**
     * @return array<string, string|null>
     */
    public function attributes(): array;

    /**
     * @return array<int,IContentNode|null>
     */
    public function children(): array;
}
