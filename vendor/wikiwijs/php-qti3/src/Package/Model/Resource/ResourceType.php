<?php

// phpcs:disable PHPCompatibility.Variables.ForbiddenThisUseContexts.OutsideObjectContext

declare(strict_types=1);

namespace Qti3\Package\Model\Resource;

enum ResourceType: string
{
    case ASSESSMENT_TEST = 'imsqti_test_xmlv3p0';
    case ASSESSMENT_ITEM = 'imsqti_item_xmlv3p0';
    case WEBCONTENT = 'webcontent';
    case LEARNING_APPLICATION_RESOURCE = 'associatedcontent/learning-application-resource';
    case CONTROLFILE = 'controlfile';
    case RESOURCE_METADATA = 'resourcemetadata/xml';

    public function requiresHref(): bool
    {
        return in_array($this, [self::ASSESSMENT_TEST, self::ASSESSMENT_ITEM, self::RESOURCE_METADATA]);
    }
}
