<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Stylesheet;

use Qti3\Shared\Collection\AbstractCollection;

/**
 * @template-extends AbstractCollection<Stylesheet>
 */
class StylesheetCollection extends AbstractCollection
{
    public function getType(): string
    {
        return Stylesheet::class;
    }
}
