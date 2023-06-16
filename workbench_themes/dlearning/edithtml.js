createMenu = function (){
    var $accordion = $(".accordion");
    $.each(menu_data.menu, function () {
        if (!this.deprecated && (this.simple_enabled || advanced_toggle)) {

            var text = document.createTextNode(this.name);

            var button = document.createElement("button");
            button.setAttribute('id', this.name.replace(/ +/g, "").replace("/","")+'-heading');
            button.setAttribute('class', 'accordion-button collapsed');
            button.setAttribute('type', 'button');
            button.setAttribute('data-bs-toggle', 'collapse');
            button.setAttribute('data-bs-target', '#'+this.name.replace(/ +/g, "").replace("/","")+'-collapse');
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-controls', 'flush'+this.name.replace(/ +/g, "").replace("/","")+'-collapse');
            button.appendChild(text);


            var header  = document.createElement("h2");
            header.setAttribute('class', 'accordion-header');
            header.setAttribute('id', 'flush-headingOne');
            header.appendChild(button);


            var collapsebody = document.createElement("div");
            collapsebody.setAttribute('class', 'accordion-body d-flex flex-wrap ');

            $.each(this.submenu, function(){
                var item = this.item
                var name = document.createTextNode(this.name);
                var p = document.createElement("p");
                p.appendChild(name)
                var image = document.createElement("img");
                image.src = moduleurlvariable + 'icons/' + this.icon + '-dlearning.png';

                var module = document.createElement("div");
                module.setAttribute('class', 'd-flex align-items-center item');
                module.appendChild(image)
                module.appendChild(p)
                module.ondblclick = function (){
                    toolbox.add_page_ondbclick(item, "after")
                }

                collapsebody.appendChild(module);
            })




            var collapse = document.createElement("div");
            collapse.setAttribute('id', this.name.replace(/ +/g, "").replace("/","")+'-collapse');
            collapse.setAttribute('class', 'accordion-collapse collapse');
            collapse.setAttribute('aria-labelledby', this.name.replace(/ +/g, "").replace("/","")+'-heading');
            collapse.setAttribute('data-bs-parent', '#accordion');
            collapse.appendChild(collapsebody);


            var item = document.createElement("div");
            item.setAttribute('class', 'accordion-item');
            item.appendChild(header);
            item.appendChild(collapse);




            $accordion.append(item);

        };
    });
}


evaluateConditionExpression = function(ctree, key, currtheme) {
    switch (ctree.type) {
        case "Literal":
            return ctree.value;
        case "LogicalExpression":
            if (ctree.operator == "&&") {
                return evaluateConditionExpression(ctree.left, key) && evaluateConditionExpression(ctree.right, key);
            } else {
                return evaluateConditionExpression(ctree.left, key) || evaluateConditionExpression(ctree.right, key);
            }
        case "BinaryExpression":
            switch (ctree.operator) {
                case "==":
                    return evaluateConditionExpression(ctree.left, key) == evaluateConditionExpression(ctree.right, key);
                case "!=":
                    return evaluateConditionExpression(ctree.left, key) != evaluateConditionExpression(ctree.right, key);
                case "<":
                    return evaluateConditionExpression(ctree.left, key) < evaluateConditionExpression(ctree.right, key);
                case "<=":
                    return evaluateConditionExpression(ctree.left, key) <= evaluateConditionExpression(ctree.right, key);
                case ">":
                    return evaluateConditionExpression(ctree.left, key) > evaluateConditionExpression(ctree.right, key);
                case ">=":
                    return evaluateConditionExpression(ctree.left, key) >= evaluateConditionExpression(ctree.right, key);
                default:
                    return null;
            }
        case "MemberExpression":
            debugger
            if (ctree.object.name == 'parent') {
                var tree = $.jstree.reference("#treeview");
                var parent = tree.get_parent(key);
                return evaluateConditionExpression(ctree.property, parent)
            } else if (ctree.object.object.name == 'theme_list') {
                return theme_list[currtheme][ctree.property.name];
            } else {
                return null;
            }
            break;
        case "Identifier":
            var attrs = lo_data[key]['attributes'];
            if (typeof attrs[ctree.name] != "undefined") {
                return attrs[ctree.name];
            } else {
                try {
                    var value = eval(ctree.name);
                    return value;
                }
                catch (e){};
                return null;
            }
        default:
            // Unexpected node parsed
            return null;
    }
},
evaluateCondition = function(condition, key, currtheme)
{
    var tree = jsep(condition);
    var result = evaluateConditionExpression(tree, key, currtheme);
    return (result == null ? false : result);
},
getOptionValue = function (all_options, key)
{
    var value="";
    for (var i=0; i<all_options.length; i++) {
        if (all_options[i].name == key)
        {
            value = all_options[i].value;
            break;
        }
    }
    return value;
}

customDisplayParameter = function (id, all_options, name, value, key, nodelabel, currtheme){

    var options = (nodelabel ? wizard_data[name].menu_options : getOptionValue(all_options, name));
    var label = (nodelabel ? nodelabel : options.label);
    var deprecated = false,
        groupChild = $(id).parents('.wizardgroup').length > 0 ? true : false;

    if (options != null)
    {
        var flashonly = $('<img>')
            .attr('src', 'editor/img/flashonly.png')
            .attr('title', 'Flash only attribute');

        if (options.condition)
        {
            //var visible = evaluateCondition(options.condition, key, currtheme);
            // if (!visible)
            // {
            //     return;
            // }
        }
        var tr = $('<tr>');
        var trv = $('<tr>');
        if (options.deprecated) {
            var td = $('<td>')
                .addClass("deprecated")
                .append($('<i>')
                    .attr('id', 'deprbtn_' + name)
                    .addClass('fa')
                    .addClass('fa-exclamation-triangle')
                    .addClass("xerte-icon")
                    .attr('title', options.deprecated)
                    .height(14)
                    .addClass("deprecated deprecatedIcon"));

            if (options.optional == 'true' && groupChild == false) {
                var opt = $('<i>').attr('id', 'optbtn_' + name)
                    .addClass('fa')
                    .addClass('fa-trash')
                    .addClass("xerte-icon")
                    .height(14)
                    .addClass("optional");
                td.addClass("wizardoptional");
                td.prepend(opt);
            }
            if (options.flashonly)
            {
                td.addClass('flashonly');
                td.append(flashonly);
            }
            tr.attr('id', 'depr_' + name)
                .addClass("wizardattribute")
                .addClass("wizarddeprecated")
                .append(td);
            deprecated = true;
        }
        else if (options.optional == 'true' && groupChild == false) {
            var td = $('<td>')
                .addClass("wizardoptional")
                .append($('<i>')
                    .attr('id', 'optbtn_' + name)
                    .addClass('fa')
                    .addClass('fa-trash')
                    .addClass("xerte-icon")
                    .height(14)
                    .addClass("optional"));
            if (options.flashonly)
            {
                td.addClass('flashonly');
                td.append(flashonly);
            }
            tr.attr('id', 'opt_' + name)
                .addClass("wizardattribute")
                .append(td);
        }

        else
        {
            var td = $('<td>')
                .addClass("wizardparameter");
            if (options.flashonly)
            {
                td.addClass('flashonly');
                td.append(flashonly);
            }
            tr.attr('id', 'param_'+ name)
                .addClass("wizardattribute")
                .append(td);
        }
        var tdlabel = $('<td>')
            .addClass("wizardlabel");
        if (deprecated)
        {
            tdlabel.addClass("wizarddeprecated")
        }
        tdlabel.append(label);

        if (options.tooltip) {
            $('<i class="tooltipIcon iconEnabled fa fa-info-circle"></i>')
                .attr('title', options.tooltip)
                .appendTo(tdlabel);
        }

        if (options.type.toLowerCase() === "info") {
            tdlabel.attr("colspan", "2");
            tr.append(tdlabel)
        }
        else
        {
            var tdv = $('<td>')
            tr.append(tdlabel);
            trv.append(tdv);
            trv.append($('<td>')
                    .addClass("wizardvalue")
                    .append($('<div>')
                        .addClass("wizardvalue_inner")
                        .append(displayDataType(value, options, name, key))));
        }



        $(id).append(tr);
        $(id).append(trv);
        if (options.optional == 'true' && groupChild == false) {
            $("#optbtn_"+ name).on("click", function () {
                var this_name = name;
                removeOptionalProperty(this_name);
            });
        }
    }
}

hideMenu = function (){
    $(".accordion").empty();
    $(".modules").addClass("modules-icon")
    $("#arrow-left").addClass("hide")
    $("#arrow-right").removeClass("hide")
    createIconMenu();
}

collapseMenu = function (){
    $(".accordion").empty();
    $(".modules").removeClass("modules-icon")
    $("#arrow-left").removeClass("hide")
    $("#arrow-right").addClass("hide")
    createMenu();
}

toggleSubMenu = function (id){
    $(".sub-menu-icon").each(function (){
        debugger
        if(!$(this).hasClass("hide") && !$(this).hasClass(id)){
            $(this).addClass("hide")
        }
    })
    var submenu = $("."+id);
    if(submenu.hasClass("hide")){
        submenu.removeClass("hide")
    }else{
        submenu.addClass("hide")
    }
}

createIconMenu = function (){
    var $accordion = $(".accordion");
    var iconList = document.createElement("div");
    iconList.setAttribute('class', 'd-flex flex-column align-items-center');
    let icons = {
        text:{name: 'text', img:'icPageWhiteInfo'},
        media:{name: 'media', img:'icPageWhiteFilm'},
        navigators:{name: 'navigators', img:'icPages'},
        connectors:{name: 'connectors', img:'icConHotSpotImage'},
        charts:{name: 'charts', img:'icChart'},
        interactivity:{name: 'interactivity', img:'icPageWhiteGear'},
        games:{name: 'games', img:'game'},
        links:{name: 'links', img:'icWorld'},
        tracking:{name: 'tracking', img:'icResults'},
    }
    for (var icon in icons){
        var atag = document.createElement("a");
        atag.setAttribute('id', icons[icon].name);
        //var id = icons[icon].name.toLowerCase();
        atag.onclick = function (){
            toggleSubMenu(this.id);
        }
        var img = document.createElement("img");
        img.setAttribute('class', 'menu-icon');
        img.src = moduleurlvariable + 'icons/' + icons[icon].img + '-dlearning.png';

        atag.append(img);
        iconList.append(atag);
    }

    $accordion.append(iconList);
    var counter = 0;
    $.each(menu_data.menu, function () {
        if (!this.deprecated && (this.simple_enabled || advanced_toggle)) {

            var menu = document.createElement("div");

            if(this.name === "Links / Feeds"){
                menu.setAttribute('class', 'sub-menu-icon animate hide links');
            }
            if(this.name === "Tracking / xAPI"){
                menu.setAttribute('class', 'sub-menu-icon animate hide tracking');
            }else{
                menu.setAttribute('class', 'sub-menu-icon animate hide ' + this.name.toLowerCase());
            }
            menu.style.top = 144 + (counter * 45) + "px";

            $.each(this.submenu, function(){
                var item = this.item
                var name = document.createTextNode(this.name);
                var p = document.createElement("p");
                p.appendChild(name)
                var image = document.createElement("img");
                image.src = moduleurlvariable + 'icons/' + this.icon + '-dlearning.png';

                var module = document.createElement("div");
                module.setAttribute('class', 'd-flex align-items-center item');
                module.appendChild(image)
                module.appendChild(p)
                module.ondblclick = function (){
                    add_page_ondbclick(item, "after")
                }

                menu.appendChild(module);
            })

            $accordion.append(menu)
            counter++;

        };
    });
}

