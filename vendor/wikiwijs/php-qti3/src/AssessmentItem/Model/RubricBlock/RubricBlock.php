<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\RubricBlock;

use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\QtiElement;

class RubricBlock extends QtiElement
{
    public function __construct(
        public readonly qtiUse $use,
        public readonly View $view,
        public readonly ContentBody $contentBody,
        public readonly ?string $class = null,
    ) {}

    public function attributes(): array
    {
        return [
            'use' => $this->use->value,
            'view' => $this->view->value,
            'class' => $this->class,
        ];
    }

    public function children(): array
    {
        return [$this->contentBody];
    }
}
