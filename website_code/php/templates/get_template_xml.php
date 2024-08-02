<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @param SimpleXMLElement $parentNode the node to add the new node to.
 * @param SimpleXMLElement $oldNode the node to replace.
 * @param string $newName the new name of the node.
 * @param string|null $newText the text in the node. optional
 * @return SimpleXMLElement the newly created node
 */
function duplicateNode($parentNode, $oldNode, $newName, $newText = null){
	$newNode = $parentNode->addChild($newName, $newText, "");
	foreach ($oldNode->attributes() as $attr) {
		$newNode->addAttribute($attr->getName(), $attr);
	}
	return $newNode;
}

require_once("../../../config.php");

// Check that xml file is stored beneath root of project
// be VERY paranoid over the path the user is requesting to download.
// Even if the file starts with a correct pattern (old implementation) the user could travers path
// like 542-tom-Notingham/../database.php or like 542-tom-Notingham/../../../../etc/passwd
$unsafe_file_path = $_GET['file'];

$full_unsafe_file_path = $xerte_toolkits_site->root_file_path . $unsafe_file_path;

// Account for Windows, because realpath changes / to \
if(DIRECTORY_SEPARATOR !== '/') {
    $full_unsafe_file_path = str_replace('/', DIRECTORY_SEPARATOR, $full_unsafe_file_path);
}
// This gets the canonical file name, so in case of 542-tom-Notingham/../../../../etc/passwd -> /etc/passwd
$realpath = realpath($full_unsafe_file_path);
// Check that is start with root_path/USER-FILES
if ($realpath !== false && $realpath === $full_unsafe_file_path) {
    $xml = new SimpleXMLElement(file_get_contents($realpath));
	$toDeleteNodes = [];
	foreach($xml->documentation as $documentation){
		foreach($documentation->page as $page){
			$newPage = duplicateNode($documentation, $page, "docpage");
			foreach ($page as $item) {
				if($item->getName() == "section"){
					$newSection = duplicateNode($newPage, $item, "docsection");
					foreach ($item as $subItem){
						duplicateNode($newSection, $subItem, $subItem->getName(), $subItem);
					}
				} else {
					duplicateNode($newPage, $item, $item->getName(), $item);
				}
			}
			$toDeleteNodes[] = $page;
		}
	}
	foreach ($toDeleteNodes as $node) {
		unset($node[0]);
	}
	echo $xml->asXML();
}
else{
    echo "Not found!";
}
