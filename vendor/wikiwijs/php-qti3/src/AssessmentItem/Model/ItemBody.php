<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model;

use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\QtiElement;
use InvalidArgumentException;

class ItemBody extends QtiElement
{
    /**
     * @var array<int,string>
     */
    public const array ALLOWED_HTML_TAGS = [
        'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'address', 'dl', 'ol', 'ul', 'hr', 'blockquote',
        'table', 'div', 'article', 'aside', 'audio', 'figure', 'footer', 'header', 'nav', 'section', 'video',
    ];

    public function __construct(
        public readonly ContentNodeCollection $content,
    ) {
        if (count($content) === 0) {
            throw new InvalidArgumentException('ItemBody must have at least one child element');
        }
        foreach ($content as $child) {
            if ($child instanceof HTMLTag && !in_array($child->tagName(), self::ALLOWED_HTML_TAGS)) {
                throw new InvalidArgumentException(sprintf('HTML tag %s is not allowed as direct child of ItemBody', $child->tagName()));
            }
        }
    }

    public function children(): array
    {
        return $this->content->all();
    }
}
