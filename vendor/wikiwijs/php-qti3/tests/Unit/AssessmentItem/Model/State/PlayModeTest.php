<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\State;

use Qti3\AssessmentItem\Model\State\PlayMode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class PlayModeTest extends TestCase
{
    #[Test]
    public function playModeFromString(): void
    {
        $this->assertTrue(PlayMode::fromString('preview') === PlayMode::PREVIEW);
        $this->assertTrue(PlayMode::fromString('formative') === PlayMode::FORMATIVE);
        $this->assertTrue(PlayMode::fromString('summative') === PlayMode::SUMMATIVE);
    }
}
