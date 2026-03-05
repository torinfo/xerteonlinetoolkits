<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model;

use Qti3\Shared\Model\Comment;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class CommentTest extends TestCase
{
    private Comment $comment;

    protected function setUp(): void
    {
        $content = '<!--This is a comment-->';
        $this->comment = new Comment($content);
    }

    #[Test]
    public function aCommentCanBeCreatedWithContent(): void
    {
        $this->assertEquals($this->comment->getContentForXml(), '<!--This is a comment-->');
    }
}
