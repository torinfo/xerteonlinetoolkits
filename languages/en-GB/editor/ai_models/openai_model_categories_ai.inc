<?php

    define("LEARNING_PROMPT_CATEGORIES", "Generate 3 words for each of the following categories: fruits, vegetables, baked goods.");
    define("DEFAULT_PROMPT_CATEGORIES", "Using the exact same xml layout generate one category node appropriate for people in the following age-range: ,range, for each of the following categories: ,subject,. Each category should contain a number of items as listed here, respective to the category (based on the order in which the categories were originally listed): ,wpc,. If only one amount was listed, generate that amount of items for each category. If there is an uploaded file you can access, you ,access, explicit permission to use the content outside of the uploaded file. The words must be different from ; ");
    define("LEARNING_RESULT_CATEGORIES", "<categories><category name='fruit'><item name='banana'/><item name='apple'/><item name='pear'/></category><category name='vegetables'><item name='carrot'/><item name='potato'/><item name='kale'/></category><category name='baked goods'><item name='cake'/><item name='muffin'/><item name='bread'/></category></categories>");