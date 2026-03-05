<?php

declare(strict_types=1);

namespace Qti3\Shared\Model;

final class ContentBody extends QtiElement
{
    /**
     * @var array<int,string>
     */
    public const array ALLOWED_HTML_TAGS = [
        'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'address', 'dl', 'ol', 'ul', 'br', 'hr', 'img', 'blockquote',
        'em', 'a', 'code', 'span', 'sub', 'acronym', 'big', 'tt', 'kbd', 'q', 'i', 'dfn', 'abbr', 'strong', 'sup',
        'var', 'small', 'samp', 'b', 'cite', 'table', 'div', 'bdo', 'bdi', 'figure', 'audio', 'video', 'article',
        'aside', 'footer', 'header', 'label', 'nav', 'section', 'ruby', 'picture', 'details',
    ];

    public function __construct(
        public ContentNodeCollection $content,
    ) {}

    /**
     * @return array<int,IContentNode>
     */
    public function children(): array
    {
        return $this->content->all();
    }
}
