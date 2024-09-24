//combines xml from xerte with xml from ai api
function build_xerte_xml(xml_tree, parent_name, parser){
    //if not root we combine basic with openai
    if (xml_tree.tagName !== parent_name) {
        var index = wizard_data[parent_name]?.new_nodes.indexOf(xml_tree.tagName);
        var basic_xml = parser.parseFromString(wizard_data[parent_name]?.new_nodes_defaults[index], "text/xml").children[0];

        for (var i = 0; i < basic_xml.attributes.length; i++){
            var attr = basic_xml.attributes[i];
            if (xml_tree.getAttribute(attr.name) == null) {
                xml_tree.setAttribute(attr.name, attr.value)
            }
        }
    }
    //recursively do this for all children
    //TODO Alek: if it is top level and does not have children
    if (xml_tree.hasChildNodes()) {
        //var children = xml_tree.children;
        var children = xml_tree.childNodes;
        for (let i = 0; i < children.length; i++) {
            build_xerte_xml(children[i], xml_tree.tagName, parser);
        }
    }
}

//changes ai api result into data usable by xerte, also adds it to the xerte data tree
/*function ai_to_xerte_content(data, key, pos, tree) {
    $('body').css("cursor", "default");
    var parser = new DOMParser();
    debugger
    var result = JSON.parse(data);
    if (result.status == 'success') {

        var x = parser.parseFromString(result["result"], "text/xml").children[0];
        debugger
        //merge xerte object root with ai result at root level.
            //TODO change lo_data[key].attributes get key from toolbox
            for (var prop in x.attributes) {
                if (Object.prototype.hasOwnProperty.call(x.attributes, prop)) {
                    const prop_name = x.attributes[prop];
                    if (Object.prototype.hasOwnProperty.call(lo_data[key].attributes, prop_name.nodeName)) {
                        lo_data[key].attributes[prop_name.nodeName] = x.attributes[prop].value;
                    } else {
                        //the property does not exist (prob optional)
                        //so we add it to the xml
                        //todo maybe check if it is one of the possibilities
                        lo_data[key].attributes[prop_name.nodeName] = x.attributes[prop].value;
                    }

                }
            }
        build_xerte_xml(x, x.tagName, parser);

        var children = x.children;
        var size = children.length;
        //add all populated children of top level object for example "quiz"
        for (let i = 0; i < size; i++) {
            addNodeToTree(key, pos, children[i].tagName, children[i], tree, true, true);
        }
        alert("Make sure to check the generated results for mistakes!!");
        console.log("done!")
    } else {
        console.log(result.message);
    }
}*/

function ai_to_xerte_content(data, key, pos, tree, realParent) {
    $('body').css("cursor", "default");
    var parser = new DOMParser();
    //
    var result = JSON.parse(data);
    if (result.status == 'success') {
        //rename x eventually
        var x = parser.parseFromString(result["result"], "text/xml").children[0];
        // Merge Xerte object root with AI result at root level.
        for (var prop in x.attributes) {
            if (Object.prototype.hasOwnProperty.call(x.attributes, prop)) {
                const prop_name = x.attributes[prop];
                if (Object.prototype.hasOwnProperty.call(lo_data[key].attributes, prop_name.nodeName)) {
                    lo_data[key].attributes[prop_name.nodeName] = x.attributes[prop].value;
                } else {
                    lo_data[key].attributes[prop_name.nodeName] = x.attributes[prop].value;
                }
            }
        }
          if (lo_data[key].data !== null && x.textContent !== null) {
              if (x.firstChild && x.firstChild.nodeType === 4){
                  lo_data[key].data = x.textContent;
              }

          }
        console.log(x.tagName);
        build_xerte_xml(x, x.tagName, parser);

        //var children = x.children;
        var children = x.childNodes;
        var size = children.length;
        // Add all populated children of top level object for example "quiz"
        for (let i = 0; i < size; i++) {
            addAINodeToTree(key, pos, children[i].tagName, children[i], tree, true, true);
        }
        alert("Make sure to check the generated results for mistakes!!");
         var node = tree.get_node(key, false);
         if (node) {
             // Refresh the node to reflect the updated attributes
             //tree.refresh_node(node);
             realParent.tree.showNodeData(node.id, true);
         }
        console.log("done!")
    } else {
        console.log(result.message);
    }
}

//cleaner function for prompts, removes unwanted sequences
function clean_prompt(prompt, api){
    //clean prompt
    if (api === "openai") {
        for (const param in prompt) {
            prompt[param] = prompt[param].replace(/(\r\n|\n|\r)/gm, "");
            prompt[param] = prompt[param].replace(/<\/?[^>]+(>|$)/g, "");
        }
    } else {
        //no api match
    }
    return prompt;
}

//handles ai api calls originated from users during xerte usage at runtime
function ai_request_runtime(prompt, type, api, callback){

    prompt = clean_prompt(prompt, api);

    $.ajax({
        url: "editor/openai/openAI.php",
        type: "POST",
        data: { type: type, prompt: prompt, api: api},
        success: function(data){
            var parser = new DOMParser();
            var result = JSON.parse(data);
            if (result.status == 'success') {
                var resultXml = parser.parseFromString(result["result"], "text/xml").children[0];
                callback(resultXml)
            } else {
                console.log(result.message);
            }
        },
    });
}