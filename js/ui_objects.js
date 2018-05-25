Quintus.UIObjects=function(Q){
    var locationsMenu = {
        main:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-sm",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Actions",
                                            desc:"Give characters tasks for this week.",
                                            confirm:{func:"displayMenu",props:["actions"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Status",
                                            desc:"View character's status.",
                                            confirm:{func:"displayMenu",props:["status"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Equip",
                                            desc:"Outfit the party.",
                                            confirm:{func:"displayMenu",props:["equip"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Briony's Orders",
                                            desc:"Get insights from Briony.",
                                            confirm:{func:"displayMenu",props:["briony"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Options",
                                            desc:"Change game settings.",
                                            confirm:{func:"displayMenu",props:["options"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"System",
                                            desc:"Save, load, quit.",
                                            confirm:{func:"displayMenu",props:["system"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },  
        actions:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-sm",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Visit Town",
                                            desc:"Recruit, Shops, Refinery.",
                                            confirm:{func:"displayMenu",props:["town"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Reward",
                                            desc:"Give someone a bonus!",
                                            confirm:{func:"displayMenu",props:["reward"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Jobs",
                                            desc:"Task party members to jobs.",
                                            confirm:{func:"displayMenu",props:["jobs"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Missions",
                                            desc:"Continue with the story.",
                                            confirm:{func:"displayMenu",props:["missions"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Advance Week",
                                            desc:"Let one week pass.",
                                            confirm:{func:"displayMenu",props:["advanceWeek"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back to main menu.",
                                            confirm:{func:"displayMenu",props:["main"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        town:{
            music:"townMusic",
            bg:"townBG",
            screen:[
                {
                    cl:"w-sm",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Recruit",
                                            desc:"Find new party members.",
                                            confirm:{func:"displayMenu",props:["recruit"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Shop",
                                            desc:"Purchase consumables.",
                                            confirm:{func:"displayMenu",props:["shop"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Blacksmith",
                                            desc:"Purchase equipment.",
                                            confirm:{func:"displayMenu",props:["blacksmith"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Refinery",
                                            desc:"Refine or trade raw materials.",
                                            confirm:{func:"displayMenu",props:["refinery"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back to actions.",
                                            confirm:{func:"displayMenu",props:["actions"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        recruit:{
            music:"townMusic",
            bg:"townBG",
            screen:[{
                    cl:"w-s menu-style3-left borderless-top-right borderless-bottom-right",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:"roster"
                            }
                        ]
                    }
                },
                {
                    cl:"w-m menu-style3-middle borderless",
                    data:{
                        lists:[
                            {
                                listClass:"arrow-container",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            img:"arrow-left",
                                            desc:"Cycle menu left.",
                                            confirm:{func:"cycleMenu", props:["recruit", -1]}, 
                                            imgClass:"menu-option"
                                        }
                                    ]
                                ]
                            },
                            {
                                listClass:"arrow-container",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            img:"arrow-right",
                                            desc:"Cycle menu right.",
                                            confirm:{func:"cycleMenu", props:["recruit", 1]},
                                            imgClass:"menu-option"
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                },
                {
                    cl:"w-s menu-style3-right borderless-top-left borderless-bottom-left",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Recruit",
                                            desc:"Recruit.",
                                            confirm:{func:"confirmRecruit",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back to town.",
                                            confirm:{func:"displayMenu",props:["town"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        shop:{
            music:"townMusic",
            bg:"townBG",
            screen:[
                {
                    cl: "w-l",
                    data:{
                        lists:[
                            {
                                listClass:"w-xl h-xl",
                                rowClass:"flex-h w-xl h-xs retain-selected-row",
                                textClass:"item-category-heading retain-selected",
                                items:[
                                    [
                                        {
                                            text:"Accessories",
                                            desc:"",
                                            confirm:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            hover:{func:"showItemsList", props:["Accessories"]},
                                            pressDown:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            pressUp:{func:function(){}}
                                        },
                                        {
                                            text:"Consumables",
                                            desc:"",
                                            confirm:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            hover:{func:"showItemsList", props:["Consumables"]},
                                            pressDown:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            pressUp:{func:function(){}}
                                        },
                                        {
                                            text:"Materials",
                                            desc:"",
                                            confirm:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            hover:{func:"showItemsList", props:["Materials"]},
                                            pressDown:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            pressUp:{func:function(){}},
                                            pressRight:{func:function(){}}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                },
                {
                    cl: "w-s",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Purchase",
                                            desc:"",
                                            //Get the number of items and display the price
                                            confirm:{func:"askQuantityPurchaseItem",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Barter",
                                            desc:"",
                                            //Get the character to barter, as well as the number of items and proposed price (per unit)
                                            confirm:{func:"askQuantityBarterItem",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back.",
                                            confirm:{func:"displayMenu",props:["town"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        blacksmith:{
            music:"townMusic",
            bg:"townBG",
            screen:[
                {
                    cl: "w-l",
                    data:{
                        lists:[
                            {
                                listClass:"w-xl h-xl",
                                rowClass:"flex-h w-xl h-xs retain-selected-row",
                                textClass:"item-category-heading retain-selected",
                                items:[
                                    [
                                        {
                                            text:"Weapons",
                                            desc:"",
                                            confirm:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            hover:{func:"showItemsList", props:["Weapons"]},
                                            pressDown:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            pressUp:{func:function(){}}
                                        },
                                        {
                                            text:"Shields",
                                            desc:"",
                                            confirm:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            hover:{func:"showItemsList", props:["Shields"]},
                                            pressDown:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            pressUp:{func:function(){}}
                                        },
                                        {
                                            text:"Armour",
                                            desc:"",
                                            confirm:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            hover:{func:"showItemsList", props:["Armour"]},
                                            pressDown:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            pressUp:{func:function(){}}
                                        },
                                        {
                                            text:"Footwear",
                                            desc:"",
                                            confirm:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            hover:{func:"showItemsList", props:["Footwear"]},
                                            pressDown:{func:"selectCertainIndex", props:[0, 2, 0]},
                                            pressUp:{func:function(){}},
                                            pressRight:{func:function(){}}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                },
                {
                    cl: "w-s",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Purchase",
                                            desc:"",
                                            //Get the number of items and display the price
                                            confirm:{func:"askQuantityPurchaseItem",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Barter",
                                            desc:"",
                                            //Get the character to barter, as well as the number of items and proposed price (per unit)
                                            confirm:{func:"askQuantityBarterItem",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back.",
                                            confirm:{func:"displayMenu",props:["town"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        refinery:{
            music:"townMusic",
            bg:"townBG",
            screen:[
                
            ]
        },
        reward:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-s menu-style3",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                textClass:"retain-selected",
                                items:[
                                    [
                                        {
                                            text:"Award 200 Gold",
                                            desc:"Give a small bonus."
                                        }
                                    ],
                                    [
                                        {
                                            text:"Award 1000 Gold",
                                            desc:"Give a medium bonus."
                                        }
                                    ],
                                    [
                                        {
                                            text:"Award 5000 Gold",
                                            desc:"Give a large bonus."
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                },
                {
                    cl:"w-m menu-style5",
                    data:{}
                },
                {
                    cl:"w-s menu-style3",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Confirm",
                                            desc:"",
                                            confirm:{func:"confirmedGiveReward",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back.",
                                            confirm:{func:"displayMenu",props:["actions"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        jobs:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-s menu-style3",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                textClass:"retain-selected",
                                items:"jobs"
                            }
                        ]
                    }
                },
                {
                    cl:"w-m menu-style5",
                    data:{}
                },
                {
                    cl:"w-s menu-style3",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Confirm",
                                            desc:"",
                                            confirm:{func:"confirmedDoJob",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back.",
                                            confirm:{func:"displayMenu",props:["actions"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        missions:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-sm",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:"missions"
                            }
                        ]
                    }
                }
            ]
        },
        advanceWeek:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-sm",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Confirm",
                                            desc:"Are you sure you're ready to advance the week?",
                                            confirm:{func:"advanceWeek",props:["actions"]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back to town.",
                                            confirm:{func:"displayMenu",props:["actions"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        status:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-s menu-style3-left",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:"allies"
                            }
                        ]
                    }
                },
                {
                    cl:"w-m menu-style3-middle",
                    data:{
                        lists:[
                            {
                                listClass:"arrow-container",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            img:"arrow-left",
                                            desc:"Cycle menu left.",
                                            confirm:{func:"cycleMenu", props:["status", -1]}, 
                                            imgClass:"menu-option"
                                        }
                                    ]
                                ]
                            },
                            {
                                listClass:"arrow-container",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            img:"arrow-right",
                                            desc:"Cycle menu right.",
                                            confirm:{func:"cycleMenu", props:["status", 1]},
                                            imgClass:"menu-option"
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                },
                {
                    cl:"w-s menu-style3-right",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back to main menu.",
                                            confirm:{func:"displayMenu",props:["main"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        equip:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-s menu-style3-left",
                    data:{
                        lists:[
                            {
                                items:"allies"
                            }
                        ]
                    }
                },
                {
                    cl:"w-m menu-style3-middle",
                    data:{
                        lists:[
                            {
                                items:[
                                    [
                                    {
                                        img:"arrow-left",
                                        desc:"Cycle menu left.",
                                        confirm:{func:"cycleStatusMenu", props:[-1]}, 
                                        imgClass:"menu-option"
                                    }
                                    ]
                                ]
                            },
                            {
                                items:[
                                    [
                                    {
                                        img:"arrow-right",
                                        desc:"Cycle menu right.",
                                        confirm:{func:"cycleStatusMenu", props:[1]},
                                        imgClass:"menu-option"
                                    }]
                                ]
                            }
                        ]
                    }
                },
                {
                    cl:"w-s menu-style3-right",
                    data:{
                        lists:[
                            {
                                items:[
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back to main menu.",
                                            confirm:{func:"displayMenu",props:["main"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        briony:{
            music:"brionyMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-sm menu-style3",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back to main menu.",
                                            confirm:{func:"displayMenu",props:["main"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        options:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-l menu-style3",
                    data:{
                        lists:[
                            {
                                listClass:"w-xl h-m",
                                rowClass:"flex-h h-s",
                                items:[
                                    [
                                        {
                                            text:"Music",
                                            desc:"Toggle Music on/off.",
                                            confirm:{func:"changeOption", props:["musicEnabled", true]}
                                        },
                                        {
                                            text:"Text Speed",
                                            desc:"Change the speed at which text scrolls.",
                                            confirm:{func:"changeOption", props:["textSpeed", true]}
                                        },
                                        {
                                            text:"Auto Scroll",
                                            desc:"Turn on to automatically scroll to the next text.",
                                            confirm:{func:"changeOption", props:["autoScroll", true]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Music Volume",
                                            desc:"Adjust BGM Volume.",
                                            confirm:{func:"changeOption", props:["musicVolume", true]}
                                        },
                                        {
                                            text:"Pointer Speed",
                                            desc:"How fast the pointer moves in battles.",
                                            confirm:{func:"changeOption", props:["cursorSpeed", true]}
                                        },
                                        {
                                            text:"Damage Indicators",
                                            desc:"Show animated damage above characters who take damage.",
                                            confirm:{func:"changeOption", props:["damageIndicators", true]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Sound",
                                            desc:"Toggle Sound on/off.",
                                            confirm:{func:"changeOption", props:["soundEnabled", true]}
                                        },
                                        {
                                            text:"Faction Highlighting",
                                            desc:"Highlight different teams.",
                                            confirm:{func:"changeOption", props:["factionHighlighting", true]}
                                        },
                                        {
                                            text:"Recall Move",
                                            desc:"Allow moves to be recalled.",
                                            confirm:{func:"changeOption", props:["recallMove", true]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Sound Volume",
                                            desc:"Adjust SFX Volume.",
                                            confirm:{func:"changeOption", props:["soundVolume", true]}
                                        },
                                        {
                                            text:"Brightness",
                                            desc:"Adjust the brightness of the game.",
                                            confirm:{func:"changeOption", props:["pointerSpeed", true]}
                                        },
                                        {
                                            text:"Tooltips",
                                            desc:"Display a tooltip next to hovered options.",
                                            confirm:{func:"changeOption", props:["tooltips", true]}
                                        }
                                    ]
                                    
                                ]
                            }
                        ]
                    }
                },
                {
                    cl:"w-s menu-style3",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back to main menu.",
                                            confirm:{func:"displayMenu",props:["main"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        system:{
            music:"mainMusic",
            bg:"mainBG",
            screen:[
                {
                    cl:"w-sm",
                    data:{
                        lists:[
                            {
                                listClass:"v-list",
                                rowClass:"w-xl h-xl",
                                items:[
                                    [
                                        {
                                            text:"Save",
                                            desc:"Save the game.",
                                            confirm:{func:"saveGame",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Load",
                                            desc:"Load from previous save file.",
                                            confirm:{func:"loadGame",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Quit",
                                            desc:"Quit to loading screen.",
                                            confirm:{func:"quitToMainMenu",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Retire",
                                            desc:"Quit to desktop.",
                                            confirm:{func:"quitToDesktop",props:[]}
                                        }
                                    ],
                                    [
                                        {
                                            text:"Back",
                                            desc:"Back to main menu.",
                                            confirm:{func:"displayMenu",props:["main"]}
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    };
    Q.GameObject.extend("MenuBuilder",{
        init:function(p){
            var obj = this;
            //Set defaults for styles (TODO and probably mostly css) 
            this.p = {
                
            };
            Object.assign(obj.p,p);
            this.add("MBUtility");
            this.add("MenuControls");
        },
        text:function(cl, text, hoverText, bar){
            var elm = $("<div class='menu-text flex-h "+cl+"'><span>"+text+"</span></div>");
            if(hoverText){ 
                elm.addClass("menu-text-hoverable");
                elm.on("mouseover",function(){
                    Q.menuBuilder.MBUtility.changeBarText(bar, hoverText);
                });
            }
            return elm;
        },
        paragraph:function(cl, text){
            return $("<div class='text-paragraph "+cl+"'><span>"+text+"</span></div>");
        },
        cont:function(cl, w, h){
            var cont = $("<div class='menu-container "+cl+"'></div>");
            !w || cont.css("width",w);
            !h || cont.css("height",h);
            return cont;
        },
        //Set up the screen layout including any button lists (they can be re-positioned in the addCustomMenu function).
        screen:function(menus, controller){
            var bar = this.cont("text-bar "+Q.optionsController.options.menuStyleC);
            bar.append(this.text("bar-text",""));
            var screen = this.cont("screen "+Q.optionsController.options.menuStyleA);
            for(var i=0;i<menus.length;i++){
                var menu = this.cont("screen-menu menu-style3 "+menus[i].cl+" ");
                var data = menus[i].data;
                if(data.lists){
                    for(var j=0;j<data.lists.length;j++){
                        menu.append(this.optionsList(data.lists[j], controller, bar));
                    }
                }
                screen.append(menu);
            }
            screen.append(bar);
            return screen;
        },
        createOption:function(data, obj, descBar, textClass){
            textClass = textClass || "";
            var dataTC = data.textClass || "";
            var opt = data.text ? this.text(textClass+" "+dataTC+" menu-option", data.text) : data.img ? this.icon(data.imgClass || "menu-option", data.img) : false;
            var obj = obj || Window;
            if(data.confirm) this.MBUtility.clickFor(opt, obj, obj[data.confirm.func] || data.confirm.func, data.confirm.props);
            if(data.back) this.MBUtiltiy.setBack(opt, obj, obj[data.back.func] || data.back.func, data.back.props);
            if(data.hover) this.MBUtility.hoverFor(opt, obj, obj[data.hover.func] || data.hover.func, data.hover.props);
            if(data.pressUp) this.MBUtility.pressUpFor(opt, obj, obj[data.pressUp.func] || data.pressUp.func, data.pressUp.props);
            if(data.pressDown) this.MBUtility.pressDownFor(opt, obj, obj[data.pressDown.func] || data.pressDown.func, data.pressDown.props);
            if(data.pressLeft) this.MBUtility.pressLeftFor(opt, obj, obj[data.pressLeft.func] || data.pressLeft.func, data.pressLeft.props);
            if(data.pressRight) this.MBUtility.pressRightFor(opt, obj, obj[data.pressRight.func] || data.pressRight.func, data.pressRight.props);
            this.MBUtility.hoverMenuOption(opt, "menu-option-selected", descBar, data.desc);
            if(data.idx !== undefined) opt.attr("idx", data.idx);
            return opt;
        },
        optionsList:function(options, obj, descBar){
            var list = this.cont("options-list " + (options.listClass || ""));
            var items = this.MBUtility.getOptionsListItems(options.items, options.props);
            for(var i=0;i<items.length;i++){
                var row = this.cont("options-list-row " + (options.rowClass || ""));
                var textClass = options.textClass || "";
                for(var j=0;j<items[i].length;j++){
                    if(items[i][j].disabled) continue; // option is hidden (disabled)
                    var opt = this.createOption(items[i][j], obj, descBar, textClass);
                    row.append(opt);
                }
                list.append(row);
            }
            return list;
        },
        portrait:function(src){
            return $("<div class='char-portrait-container'><div class='char-portrait-bg'><img class='char-portrait-img' src='images/story/"+src+"'></div></div>");
        },
        getPortraitSection:function(click, back, portraitChar){
            var portraitSection = this.cont("h-xl flex-v portrait-section menu-option");
            this.MBUtility.hoverMenuOption(portraitSection,"menu-option-selected" ,$(".text-bar"), "Press ENTER to select a character.");
            portraitSection.append(this.portrait(portraitChar.sprite || "empty.png"));
            portraitSection.on("click",click);
            portraitSection.on("back",back);
            return portraitSection;
        },
        produceHeadingLists:function(statsShown, menu, characters, chooseChar, goBack){
            var MB = this;
            var listCont = MB.cont("w-ll h-xl options-list retain-selected-index left-right-border");

            var dynamicList = [
                ["NAME", "20%"]
            ];
            for(var i=0;i<statsShown.length;i++){
                dynamicList.push([statsShown[i].toUpperCase(), (80 / statsShown.length) + "%"]);
            }
            var lists = [
                [
                    ["NAME", "20%"],
                    ["STR", "9%"],
                    ["END", "9%"],
                    ["DEX", "9%"],
                    ["WSK", "9%"],
                    ["RFL", "9%"],
                    ["INI", "9%"],
                    ["ENR", "9%"],
                    ["SKL", "9%"],
                    ["EFF", "8%"]
                ],
                [
                    ["NAME", "20%"],
                    ["LVL", "10%"],
                    ["NAT", "20%"],
                    ["CLS", "20%"],
                    ["MOR", "10%"],
                    ["LOY", "10%"],
                    ["EXP", "10%"]
                ]
            ];
            lists.splice(0,0,dynamicList);
            var currentList = 0;
            function clickHeading(){
                var headingIndex = $(this).index();
                MB.MBUtility.sortBy = lists[currentList][headingIndex][0];
                MB.MBUtility.sortOrder *= -1;
                sortCharacters();
                Q.audioController.playSound("rotate_tech.mp3");
                MB.MenuControls.selectSelectedIdx();
                MB.MenuControls.setFocus();
                $(MB.MenuControls.getSelected()).mouseover();

            }
            function sortCharacters(){
                //var type = typeof MB.MBUtility.sortBy;
                characters = characters.sort(function(a, b){
                    //if(type === 'string'){
                        return MB.getConvertedStat(MB.MBUtility.sortBy, a) > MB.getConvertedStat(MB.MBUtility.sortBy, b) ? 1 * MB.MBUtility.sortOrder : -1 * MB.MBUtility.sortOrder;
                    /*} else if(type === 'number'){
                        return MB.getConvertedStat(MB.MBUtility.sortBy, a) * MB.MBUtility.sortOrder > MB.getConvertedStat(MB.MBUtility.sortBy, b);
                    }*/
                });
                showList();
            }
            function cycleList(event){
                currentList += event.data.amount;
                currentList = MB.MenuControls.checkWrap(lists.length, currentList);
                var selectedRowIdx = menu.children(".options-list:eq(1)").children(".options-list-row").index(menu.children(".options-list:eq(1)").children(".options-list-row").children(".menu-option-retained-index").parent());
                var selectedOptIdx = menu.children(".options-list:eq(1)").children(".options-list-row").children(".menu-option-retained-index").parent().children(".menu-option").index(menu.children(".options-list:eq(1)").children(".options-list-row").children(".menu-option-retained-index"));
                showList();
                selectedOptIdx = selectedOptIdx > 0 ? selectedOptIdx = menu.children(".options-list:eq(1)").children(".options-list-row:eq(0)").children(".menu-option").length - 1 : 0;
                menu.children(".options-list:eq(1)").children(".options-list-row:eq("+selectedRowIdx+")").children(".menu-option:eq("+selectedOptIdx+")").trigger("mouseover");

                $(this).trigger("mouseover");
            };
            function showList(){
                listCont.empty();
                var list = lists[currentList];
                var headingRow = MB.cont("w-xl h-xs table-row flex-h options-list-row heading-row");
                for(var j=0;j<list.length;j++){
                    var headingCont = MB.cont("w-xl h-xl menu-option item-table-item");
                    headingCont.css({width:list[j][1]});
                    headingCont.on("mouseover", {excludeLast:true}, MB.MBUtility.hoverTableOption);
                    MB.MBUtility.hoverMenuOption(headingCont, "menu-option-selected", $(".text-bar"), "Sort by "+list[j][0]);
                    headingCont.on("click",clickHeading);
                    headingCont.on("back",goBack);
                    headingCont.append(MB.text("w-xl h-xl justify-center", list[j][0]));
                    headingRow.append(headingCont);
                }
                listCont.append(headingRow);
                for(var j=0;j<characters.length;j++){
                    var char = characters[j];
                    var charCont = MB.cont("w-xl h-xs table-row flex-h options-list-row");
                    for(var k=0;k<list.length;k++){
                        var charOption = MB.cont("w-xl h-xl menu-option item-table-item");
                        charOption.css({width:list[k][1]});
                        charOption.on("mouseover", {excludeLast:true}, MB.MBUtility.hoverTableOption);
                        MB.MBUtility.hoverMenuOption(charOption, "menu-option-selected", $(".text-bar"), "Select "+char.name);
                        charOption.on("click",chooseChar);
                        charOption.on("back",goBack);
                        var text = MB.text("w-xl h-xl justify-center",MB.getConvertedStat(list[k][0], char));
                        text.children("span").addClass("small-font");
                        charOption.append(text);
                        charCont.append(charOption);
                    }
                    listCont.append(charCont);
                }
                var backCont = MB.cont("w-xl h-xs table-row options-list-row");
                var back = MB.text("w-xl h-xl menu-option remover", "Remove");
                MB.MBUtility.hoverMenuOption(back, "menu-option-selected", $(".text-bar"), "Remove character.");
                back.on("mouseover", {excludeLast:true}, MB.MBUtility.hoverTableOption);
                back.on("click",chooseChar);
                back.on("back",goBack);
                backCont.append(back);
                listCont.append(backCont);
                MB.MBUtility.squareList(listCont);
            }
            if(MB.MBUtility.sortBy){
                sortCharacters();
            } else {
                showList();
            }

            var leftArrowList = MB.cont("options-list arrow-container");
            var leftArrowCont = MB.cont("options-list-row w-xl h-xl");
            var leftArrow = MB.icon("menu-option", "arrow-left");
            leftArrow.on("click",{amount:-1},cycleList);
            leftArrow.on("back",goBack);
            MB.MBUtility.hoverMenuOption(leftArrow, "menu-option-selected", $(".text-bar"), "Change Menu.");

            leftArrowCont.append(leftArrow);
            leftArrowList.append(leftArrowCont);


            var rightArrowList = MB.cont("options-list arrow-container");
            var rightArrowCont = MB.cont("options-list-row w-xl h-xl");
            var rightArrow = MB.icon("menu-option", "arrow-right");
            rightArrow.on("click",{amount:1},cycleList);
            rightArrow.on("back",goBack);
            MB.MBUtility.hoverMenuOption(rightArrow, "menu-option-selected", $(".text-bar"), "Change Menu.");

            rightArrowCont.append(rightArrow);
            rightArrowList.append(rightArrowCont);
            menu.append(rightArrowList);

            menu.append(leftArrowList);
            menu.append(listCont);
            menu.append(rightArrowList);
        },
        getConvertedStat:function(stat, char){
            if(!char.name) return 0;
            var lower = stat.toLowerCase();
            switch(lower){
                case "name":
                    return char[lower];
                case "str":
                case "end":
                case "dex":
                case "wsk":
                case "rfl":
                case "ini":
                case "enr":
                case "skl":
                case "eff":
                    return char.baseStats[lower];
                case "lvl":
                    return char.level;
                case "nat":
                    return char.nationality;
                case "cls":
                    return char.charClass;
                case "mor":
                    return char.morale;
                case "loy":
                    return char.loyalty;
                case "exp":
                    return char.exp;
            }
        },
        //Displays 1-3 rectangles that can store a character portrait for sending them to do something.
        portraitsScreen:function(portraits, statsShown, weeks, requirements, tier, menu, backMenu, confirmButton, backButton){
            var MB = this;
            var portraitsCont = this.cont("w-xl h-ml options-list");
            var nameRow = this.cont("h-s flex-h");
            var portraitRow = this.cont("h-m flex-h options-list-row");
            var statsRow = this.cont("h-s flex-h");
            for(var i=0; i<portraits.length; i++){
                var portraitChar = portraits[i];
                //TEMP
                if(portraitChar.name) portraitChar.sprite = "knight.png";
                var nameCont = this.cont("w-xl");
                nameCont.append(this.text("w-xl h-xl", portraitChar.name || ""));
                var portraitSection = this.getPortraitSection(
                    function(){
                        if(Q.menuBuilder.MenuControls.disabled) return;
                        var idx = $(this).index();
                        var lastChar = portraits[idx];
                        lastChar.name ?  lastChar.tempAction = false : false;
                        menu.empty();

                        var menuClass = menu.attr("class");
                        var placeholder = $("<div class='"+menuClass+"'></div>");
                        var fader = $("<div id='fader' class='fader-black'></div>");
                        fader.css("opacity", 0.2);
                        $("#main-content").append(fader);
                        menu.addClass("above-fader");
                        var width = menu.outerWidth();
                        var height = menu.outerHeight();
                        var pos = menu.offset();

                        menu.replaceWith(placeholder);
                        $("#main-content").append(menu);
                        menu.css({width:width, height:height, top:pos.top, left:pos.left - width/2});

                        function chooseChar(){
                            var index = MB.MBUtility.getSelectedIdx(menu) - 2;
                            menu.empty();
                            portraits[idx] = characters[index] || {};
                            portraits[idx].tempAction = true;
                            MB.portraitsScreen(portraits, statsShown, weeks, requirements, tier, menu, backMenu, confirmButton, backButton);
                            menu.removeClass("above-fader");
                            menu.removeAttr('style');
                            placeholder.replaceWith(menu);
                            fader.remove();
                            MB.MenuControls.focusList = false;
                            MB.MenuControls.selectSelectedIdx([1,0,idx]);
                            menu.children(".options-list:eq(0)").children(".options-list-row:eq(0)").children(".menu-option:eq("+idx+")").trigger("mouseover");
                            var metAllRequirements = true;
                            var allCharsSelected = Q.partyManager.allies.filter(function(ally){return ally.tempAction;});
                            if(allCharsSelected.length){
                                //requirements are always baseStats
                                for(var i=0;i<requirements.length;i++){
                                    var req = requirements[i];
                                    var stat = req[0];
                                    var amount = req[1];
                                    var total = allCharsSelected.map(function(char){return MB.getConvertedStat(stat, char);}).reduce(function(a, b){return a + b;}, 0);
                                    if(total < amount) metAllRequirements = false;
                                }
                                if(metAllRequirements){ 
                                    confirmButton.removeClass("menu-option-disabled");
                                } else {
                                    confirmButton.addClass("menu-option-disabled");
                                }
                            }
                        }
                        //Go back by selecting the current character
                        function goBack(){
                            if(!lastChar){
                                menu.children(".options-list").children(".options-list-row").last().children(".menu-option").trigger("mouseover");
                            } else {
                                var lastCharIdx = characters.indexOf(lastChar);
                                menu.children(".options-list").children(".options-list-row:eq("+lastCharIdx+")").children(".menu-option").trigger("mouseover");
                            }
                            chooseChar();
                        }
                        //Show the list of characters with their statsShown as a special list
                        var characters = Q.partyManager.allies.filter(function(char){return !char.tempAction && !char.action;});
                        MB.produceHeadingLists(statsShown, menu, characters, chooseChar, goBack);
                        var lastCharIdx = Math.max(0,characters.indexOf(lastChar)) + 2;
                        menu.children(".options-list").children(".options-list-row:eq("+(lastCharIdx)+")").children(".menu-option").first().trigger("mouseover");

                        confirmButton.parent().parent().addClass("list-keyboard-disabled");
                        //MB.MenuControls.focusList = true;
                    }, 
                    function(){
                        backMenu.children(".options-list").children(".options-list-row").children(".menu-option-selected").trigger("mouseover");
                        Q.partyManager.resetTempAction();
                    },
                    portraitChar
                );
                nameRow.append(nameCont);
                portraitRow.append(portraitSection);
                var statsCont = this.cont("w-sm flex-v");
                for(var j=0; j<statsShown.length; j++){
                    var statCont = this.cont("w-xl flex-h");
                    statCont.append(this.text("justify-left w-ms",statsShown[j].toUpperCase()));
                    statCont.append(this.text("justify-right w-ms",MB.getConvertedStat(statsShown[j],portraitChar) || ""));
                    statsCont.append(statCont);
                }
                statsRow.append(statsCont);
            }
            portraitsCont.append(nameRow, portraitRow, statsRow);
            
            
            var infoCont = this.cont("w-xl h-sm flex-h");
            var left = this.cont("w-ms h-xl ");
            left.append(this.text("w-xl h-s", "Weeks: "+weeks));
            var right = this.cont("w-ml h-xl");
            
            left.append(this.text("w-xl h-s heading-text", "Required"));
            var jobDefaults = Q.state.get("jobsList").defaults;
            function getRating(){
                var chars = portraits.filter(function(char){return char.name;});    
                if(!chars.length) return 0;
                var tiermin = jobDefaults.tiermin[0] + jobDefaults.tiermin[1] * tier;
                var tiermax = tiermin + jobDefaults.tiermax[0] + jobDefaults.tiermax[1] * tier;
                var eachRating = [];
                for(var i=0;i<statsShown.length;i++){
                    var base = 0;
                    for(var j=0;j<requirements.length;j++){
                        if(requirements[j][0]===statsShown[i]) base += requirements[i][1];
                    }
                    var weight = jobDefaults.weighted[statsShown.length-1][i];
                    
                    var reducedCharStats = chars.map(function(char){return MB.getConvertedStat(statsShown[0], char); }).reduce(function(a, b){return a + b;}, 0);
                    eachRating.push((reducedCharStats - base)* weight);
                    
                }
                for(var i=0;i<eachRating.length;i++){
                    var num = eachRating[i];
                    if(num < 0){
                        return 0;
                    }
                }
                var rating = 0;
                var added = eachRating.reduce(function(a, b) {return a + b;},0);
                if(added < tiermin){
                    rating = 1;
                } else if(added > tiermax){
                    rating = 3;
                } else { 
                    rating = 2;
                }
                return rating;
            }
            if(requirements.length) {
                var reqsCont = this.cont("w-xl h-m flex-v");
                for(var i=0;i<requirements.length;i++){
                    var req = requirements[i];
                    reqsCont.append(this.text("w-xl", req[0].toUpperCase()+": "+req[1]));
                }
                left.append(reqsCont);
            } else {
                left.append(this.text("w-xl h-s", "-"));
            }
            var rating = getRating();
            right.append(this.text("w-xl h-xl align-left text-paragraph",jobDefaults.texts[rating]));
            
            backButton.on("click", Q.partyManager.resetTempAction);
            confirmButton.on("click", Q.partyManager.resetTempAction);
            confirmButton.addClass("menu-option-disabled");
            
            infoCont.append(left);
            
            infoCont.append(right);
            menu.append(portraitsCont, infoCont);
            confirmButton.parent().parent().removeClass("list-keyboard-disabled");
        },
        replaceList:function(elm, list, obj, bar){
            elm.replaceWith(this.optionsList(list, obj, bar));
        },
        icon:function(cl, sprite){
            //return $("<div class='icon-container flex-v w-xl h-xl "+cl+"'><img class='w-xl h-xl "+sprite+"'></div>");
            return $("<div class='icon-container flex-v h-xl "+cl+"'><img src='images/ui-sprite-images/"+sprite+".png' class='auto-dimensions'></div>");
        },
        equipment:function(cl, eq){
            var cont = this.cont("eq-"+eq.quality);
            cont.append(this.icon(cl, eq.material));
            cont.append(this.text(cl, eq.gear));
            return cont;
        },
        quantifier:function(cl, numCl, start, step, min, max, bigBooster){
            function inBounds(val){
                var min = amountNum.attr("min");
                var max = amountNum.attr("max");
                if(val < min) return min;
                if(val > max) return max;
                return val;
            }
            
            var upCont = this.cont(cl);
            var upIcon = this.icon("menu-option","quantifier-up-arrow");
            this.MBUtility.hoverMenuOption(upIcon, "menu-option-selected");
            upCont.append(upIcon);
            
            var downCont = this.cont(cl);
            var downIcon = this.icon("menu-option", "quantifier-down-arrow");
            this.MBUtility.hoverMenuOption(downIcon, "menu-option-selected");
            downCont.append(downIcon);
            
            var amountNum = this.text(numCl, start);
            amountNum.attr("step", step);
            amountNum.attr("min", min);
            amountNum.attr("max", max);
            
            if(bigBooster){
                var upBigCont = this.cont(cl);
                var upBigIcon = this.icon("menu-option", "quantifier-up-big-arrow");
                this.MBUtility.hoverMenuOption(upBigIcon, "menu-option-selected");
                upBigCont.append(upBigIcon);
                
                var downBigCont = this.cont(cl);
                var downBigIcon = this.icon("menu-option", "quantifier-down-big-arrow");
                this.MBUtility.hoverMenuOption(downBigIcon, "menu-option-selected");
                downBigCont.append(downBigIcon);
                
                downBigIcon.on("click", function(){
                    if(Q.menuBuilder.MenuControls.disabled) return;
                    var num = parseInt(amountNum.attr("step")) * 10;
                    var oldVal = parseInt(amountNum.children("span").text());
                    var newVal = oldVal - num;
                    amountNum.children("span").text(inBounds(newVal));
                    amountNum.trigger("changed", [-num, oldVal]);
                });
                upBigIcon.on("click", function(){
                    if(Q.menuBuilder.MenuControls.disabled) return;
                    var num = parseInt(amountNum.attr("step")) * 10;
                    var oldVal = parseInt(amountNum.children("span").text());
                    var newVal = oldVal + num;
                    amountNum.children("span").text(inBounds(newVal));
                    amountNum.trigger("changed", [num, oldVal]);
                });
            }
            
            downIcon.on("click", function(){
                if(Q.menuBuilder.MenuControls.disabled) return;
                var num = parseInt(amountNum.attr("step"));
                var oldVal = parseInt(amountNum.children("span").text());
                var newVal = oldVal - num;
                amountNum.children("span").text(inBounds(newVal));
                amountNum.trigger("changed", [-num, oldVal]);
            });
            upIcon.on("click", function(){
                if(Q.menuBuilder.MenuControls.disabled) return;
                var num = parseInt(amountNum.attr("step"));
                    var oldVal = parseInt(amountNum.children("span").text());
                var newVal = oldVal + num;
                amountNum.children("span").text(inBounds(newVal));
                amountNum.trigger("changed", [num, oldVal]);
            });
            
            if(bigBooster){
                return this.MBUtility.roundVerticalList(upBigCont.add(upCont).add(amountNum).add(downCont).add(downBigCont));
            }
            return this.MBUtility.roundVerticalList(upCont.add(amountNum).add(downCont));
        },
        qualityButtons:function(buttons){
            var cont = this.cont("quality-buttons-container");
            for(var i=0;i<buttons.length;i++){
                var b = buttons[i];
                var qcont = this.cont("quality-button");
                //Disabled buttons will not have hovering or selecting.
                qcont.append(this.icon(b));
                cont.append(qcont);
            }
            return cont;
        }
    });
    //Any functions that do not build a specific menu element, but are used by the built menus.
    Q.component("MBUtility",{
        sortBy:null,
        sortOrder: -1,
        setText:function(elm, text){
            elm.children("span").text(text);
        },
        changeBarText:function(descBar, text){
            descBar.children(".bar-text").children("span").text(text);
        },
        changeHoverDesc:function(itm, selectedClass, descBar, desc){
            this.hoverMenuOption(itm, selectedClass, descBar, desc);
        },
        hoverMenuOption:function(itm, selectedClass, descBar, desc){
            var util = this;
            itm.on("mouseover",function(){
                if(Q.menuBuilder.MenuControls.disabled || itm.hasClass("menu-option-disabled")) return;
                $("."+selectedClass).not(".retain-selected").removeClass(selectedClass);
                if($(this).hasClass("retain-selected") && $("."+selectedClass+".retain-selected").length){
                    var mousedListIdx = $(".options-list").index($(this).closest($(".options-list")));
                    $("."+selectedClass+".retain-selected").each(function(){
                        var idx = $(".options-list").index($(this).closest($(".options-list")));
                        if(mousedListIdx === idx){
                            $(this).removeClass(selectedClass);
                        }
                    });
                }
                $(this).addClass(selectedClass);
                if(descBar) util.changeBarText(descBar, desc);
                var MC = util.entity.MenuControls;
                if(this === $(MC.getSelected()).get(0)) return; //Don't do anything if we've mouse over'd the same element
                var toZ = $(".options-list").index($(this).closest($(".options-list")));
                MC.setIdx(toZ,$(this).closest($(".options-list-row")).parent().children(".options-list-row").index($(this).closest($(".options-list-row"))), $(this).index());
            });
        },
        hoverTableOption:function(event){
            $(".hovered-column").removeClass("hovered-column");
            $(".hovered-row").removeClass("hovered-row");
            $(".hovered-center").removeClass("hovered-center");
            $(".menu-option-retained-index").removeClass("menu-option-retained-index");
            if($(this).hasClass("remover")) return;
            var headIdx = $(this).index();
            var listIdx = $(this).parent().parent().children(".table-row").index($(this).parent());
            if(listIdx === 0){
                var cols = $(this).parent().parent().children(".options-list-row").not(":eq("+listIdx+")");
                if(event.data.excludeLast) cols = cols.not(":last");
                cols.each(function(){$(this).children(".item-table-item:eq("+headIdx+")").addClass("hovered-column");});
            } else {
                $(this).siblings().addClass("hovered-row");
                $(this).addClass("hovered-row menu-option-retained-index");
            }
        },
        clickFor:function(elm, obj, func, props){
            elm.on("click",function(){
                if(Q.menuBuilder.MenuControls.disabled || elm.hasClass("menu-option-disabled")) return;
                func.apply(obj, props);
            });
        },
        setBack:function(elm, obj, func, props){
            elm.on("back",function(){
                if(Q.menuBuilder.MenuControls.disabled || elm.hasClass("menu-option-disabled")) return;
                func.apply(obj, props);
            });
        },
        hoverFor:function(elm, obj, func, props){
            elm.on("mouseover",function(){
                if(Q.menuBuilder.MenuControls.disabled || elm.hasClass("menu-option-disabled")) return;
                func.apply(obj, props);
            });
        },
        pressUpFor:function(elm, obj, func, props){
            elm.on("pressUp",function(){
                if(Q.menuBuilder.MenuControls.disabled || elm.hasClass("menu-option-disabled")) return;
                func.apply(obj, props);
            });
        },
        pressDownFor:function(elm, obj, func, props){
            elm.on("pressDown",function(){
                if(Q.menuBuilder.MenuControls.disabled || elm.hasClass("menu-option-disabled")) return;
                func.apply(obj, props);
            });
        },
        pressLeftFor:function(elm, obj, func, props){
            elm.on("pressLeft",function(){
                if(Q.menuBuilder.MenuControls.disabled || elm.hasClass("menu-option-disabled")) return;
                func.apply(obj, props);
            });
        },
        pressRightFor:function(elm, obj, func, props){
            elm.on("pressRight",function(){
                if(Q.menuBuilder.MenuControls.disabled || elm.hasClass("menu-option-disabled")) return;
                func.apply(obj, props);
            });
        },
        getOptionsListItems:function(items, props){
            if(Array.isArray(items)) return items;
            //Keywords
            switch(items){
                case "allies":
                    var allies = Q.partyManager.allies;
                    if(props){ 
                        if(props.includes("removeActed")){
                            allies = allies.filter(function(char){return !char.action;})
                        } 
                        /*if(props.includes("removeAlex")){
                            allies = allies.filter(function(char){return char.name !== "Alex";});
                        }*/
                    };
                    
                    return allies.map(function(char){ return [{text:char.name, desc: "Displaying "+char.name, textClass:"retain-selected"}]; });
                case "jobs":
                    var jobs = Q.jobsController.currentJobs;
                    return jobs.map(function(job, idx){return [{text:job.name, desc: job.desc, textClass:"retain-selected"+(job.inProgress ? " job-in-progress menu-option-disabled" : ""), idx:idx}];});
                case "missions":
                    var missions = Q.missionsController.currentMissions;
                    var items = missions.map(function(mission, idx){return [{text:mission.name, desc: mission.desc, idx:idx, confirm:{func:"changeEvent",props:[mission.name]}}];});
                    items.push([{text:"Back", desc:"Back to actions.", confirm:{func:"displayMenu",props:["actions"]}}]);
                    return items;
                case "roster":
                    var roster = Q.partyManager.roster;
                    return roster.map(function(char){ return [{text:char.name, desc: "Displaying "+char.name, textClass:"retain-selected"}]; });
                case "techniques":
                    var techniques = props;
                    return techniques.map(function(tech){ return [{text:tech.name, desc: tech.desc, textClass:"retain-selected"}]; });
            }
            alert(items +" keyword does not exist!");
        },
        
        //Applies some styles to the edges of a matrix list to create a nice, smooth border.
        roundList:function(list){
            var left = list.children(".menu-option:first-child");
            left.first().addClass("borderless-bottom-left");
            left.not(":first").not(":last").addClass("borderless-top-left borderless-bottom-left");
            left.last().addClass("borderless-top-left");
            var right = list.children(".menu-option:last-child");
            right.first().addClass("borderless-bottom-right");
            right.not(":first").not(":last").addClass("borderless-top-right borderless-bottom-right");
            right.last().addClass("borderless-top-right");
            return list;
        },
        roundVerticalList:function(list){
            var top = list.first();
            top.children(".menu-option").addClass("round-border-top");
            
            var bottom = list.last();
            bottom.children(".menu-option").addClass("round-border-bottom");
            return list;
        },
        squareList:function(list){
            list.children(".options-list-row").children(".menu-option").addClass("borderless");
        },
        getSelectedIdx:function(screenMenu){
            return screenMenu.children(".options-list").children(".options-list-row").index(screenMenu.children(".options-list").children(".options-list-row").children(".menu-option-selected").parent());
        }
    });
    
    //Enables controlling of menus
    //Includes up, down, confirm, and esc.
    Q.component("MenuControls", {
        disabled:false,
        turnOn:function(){
            var menu = this;
            $(document).keydown(function( e ){
                if(!menu.disabled){
                    if(e.which == Q.KEY_NAMES.UP){
                        menu.pressUp();
                    } else if(e.which == Q.KEY_NAMES.DOWN){
                        menu.pressDown();
                    }
                    if(e.which == Q.KEY_NAMES.LEFT){
                        menu.pressLeft();
                    } else if(e.which == Q.KEY_NAMES.RIGHT){
                        menu.pressRight();
                    }
                    if(e.which == Q.KEY_NAMES.ENTER){
                        menu.pressConfirm();
                    } else if(e.which == Q.KEY_NAMES.ESC){
                        menu.pressBack();
                    }
                }
            });
        },
        turnOff:function(){
            $(document).unbind("keydown");
        },
        reset:function(){
            this.selectedIdx = [0, 0, 0];
            this.noWrap = false;
            
            this.pressUp = function(){ 
                var elm = this.getSelected().get(0);
                var ev = $._data(elm, 'events');
                if(ev && ev.pressUp){
                    $(elm).trigger("pressUp");
                } else {
                    this.cycleIndex(this.selectedIdx[0], this.selectedIdx[1] - 1, this.selectedIdx[2]); 
                }
            };
            this.pressDown = function(){ 
                var elm = this.getSelected().get(0);
                var ev = $._data(elm, 'events');
                if(ev && ev.pressDown){
                    $(elm).trigger("pressDown");
                } else {
                    this.cycleIndex(this.selectedIdx[0], this.selectedIdx[1] + 1, this.selectedIdx[2]); 
                }
            };
            this.pressLeft = function(){ 
                var elm = this.getSelected().get(0);
                var ev = $._data(elm, 'events');
                if(ev && ev.pressLeft){
                    $(elm).trigger("pressLeft");
                } else {
                    this.cycleIndex(this.selectedIdx[0], this.selectedIdx[1], this.selectedIdx[2] - 1); 
                }
            };
            this.pressRight = function(){ 
                var elm = this.getSelected().get(0);
                var ev = $._data(elm, 'events');
                if(ev && ev.pressRight){
                    $(elm).trigger("pressRight");
                } else {
                    this.cycleIndex(this.selectedIdx[0], this.selectedIdx[1], this.selectedIdx[2] + 1); 
                }
            };
            this.pressConfirm = function(){ 
                var elm = this.getSelected().get(0);
                var ev = $._data(elm, 'events');
                if(ev && ev.click){
                    $(elm).trigger("click");
                } else {
                    this.changeMenu(1, this.selectedIdx[0]);
                }
            };
            this.pressBack = function(){ 
                var elm = this.getSelected().get(0);
                var ev = $._data(elm, 'events');
                if(ev && ev.back){
                    $(elm).trigger("back");
                } else {
                    //this.changeMenu(-1, this.selectedIdx[0]);
                }
            };
        },
        selectSelectedIdx:function(idx){
            idx = idx || this.selectedIdx;
            this.setIdx(idx[0], idx[1], idx[2]);
        },
        setIdx:function(z, y, x, yAdd, xAdd){
            if(z !== this.selectedIdx[0]) this.trigger("changedMenu");
            yAdd = yAdd || 1;
            xAdd = xAdd || 1;
            if(this.selectedIdx[0] === z && this.selectedIdx[1] === y && this.selectedIdx[2] === x) return;
            this.selectedIdx = [z, y, x];
            var elm = this.getSelected();
            if(elm.hasClass("menu-option-disabled") || !elm.is(':visible')){ 
                var disabledInList = elm.parent().parent().children(".options-list-row").children(".menu-option-disabled").length;
                var options = elm.parent().parent().children(".options-list-row").children(".menu-option").length;
                if(disabledInList === options) x += xAdd;
                this.cycleIndex(z, y + yAdd, x);
            } else {
                this.setFocus();
                Q.audioController.playSound("option-hover.mp3");
            }
        },
        setFocus:function(){
            $(".focussed-selected-menu-option").removeClass("focussed-selected-menu-option");
            $(this.getSelected()).addClass("focussed-selected-menu-option");
        },
        getSelected:function(){
            var idx = this.selectedIdx;
            var y = this.checkWrap($(".options-list:eq("+idx[0]+")").children(".options-list-row").length, idx[1]);
            return $(".options-list:eq("+idx[0]+")").children(".options-list-row:eq("+y+")").children(".menu-option:eq("+idx[2]+")");
        },
        cycleIndex:function(toZ, toY, toX){
            var cur = this.selectedIdx;
            var width = $(".options-list:eq("+cur[0]+")").children(".options-list-row:eq("+cur[1]+")").children(".menu-option").length;
            var lastX = false;
            var xAdd = toX - cur[0];
            var yAdd = toY - cur[1];
            var mod = 0;
            if(toX >= width){
                mod = 1;
                toX = 0;
            } else if(toX < 0){
                mod = -1;
                lastX = true;
            }
            toZ += mod;
            var newZ = this.checkWrap($(".options-list").length, toZ);
            //If we're not allowed to wrap this screen from max -> min and the opposite.
            if(this.noWrap && newZ !== toZ){return;} else if(this.focusList && newZ !== this.selectedIdx[0]){return;} else { toZ = newZ;};
            if(toZ !== this.selectedIdx[0]){
                //If the list is disabled, cycle again
                if($(".options-list:eq("+toZ+")").hasClass("list-keyboard-disabled")) return this.cycleIndex(toZ, toY, toX + mod);
                //If the elm at that index should be held, go to that idx.
                var list = $(".options-list:eq("+toZ+")");
                var row = list.children(".options-list-row:eq("+0+")");
                var itm = row.children(".menu-option:eq("+0+")");
                //Only works for single row option lists
                if(itm.hasClass("retain-selected")){
                    var idx = list.children(".options-list-row").children(".menu-option").index(list.children(".options-list-row").children(".retain-selected.menu-option-selected"));
                    toY = idx >= 0 ? idx : 0;
                }
                if(row.hasClass("retain-selected-row")){
                    var idx = list.children(".options-list-row").index(list.children(".options-list-row").children(".menu-option-retained-index").parent());
                    toY = idx >= 0 ? idx : 0;
                }
                
            }
            toY = this.checkWrap($(".options-list:eq("+toZ+")").children(".options-list-row").length, toY);
            if(toY !== this.selectedIdx[1]){
                //If we're cycling in the y direction and there is a heading that is retained
                var hasRetainIdx = $(".options-list:eq("+toZ+")").children(".options-list-row:eq("+toY+").retain-selected-row").children(".menu-option").index($(".options-list:eq("+toZ+")").children(".retain-selected-row").children(".menu-option-selected"));
                if(hasRetainIdx >= 0) toX = hasRetainIdx;
            }
            if($(".options-list:eq("+toZ+")").children(".options-list-row:eq("+toY+")").children(".menu-option").length !== $(".options-list:eq("+toZ+")").children(".options-list-row:eq("+this.selectedIdx[1]+")").children(".menu-option").length){
                width = $(".options-list:eq("+toZ+")").children(".options-list-row:eq("+toY+")").children(".menu-option").length;
            }
            if(lastX) {
                width = $(".options-list:eq("+toZ+")").children(".options-list-row:eq("+toY+")").children(".menu-option").length;
                toX = width - 1;
            }
            
            toX = this.checkWrap(width, toX);
            this.setIdx(toZ, toY, toX, yAdd, xAdd);
            $(this.getSelected()).mouseover();
        },
        //Move the menu based on menu idx
        changeMenu:function(change, curIdx){
            curIdx = curIdx || this.selectedIdx[0];
            change = change || 1;
            var idx = this.checkWrap($(".options-list").length, curIdx + change);
            this.cycleIndex(idx, this.selectedIdx[1], this.selectedIdx[2]);
        },
        //If the idx is less than 0 or greater than the len, wrap to other side
        checkWrap:function(len, idx){
            if(idx < 0) return len - 1;
            if(idx >= len) return 0;
            return idx;
        }
    });
    
    Q.GameObject.extend("LocationController",{
        //Contains all of the menus that are always available
        baseMenu:locationsMenu,
        characterCombatStats:[
            ["maxAtkDmg","damageReduction","defensiveAbility","atkAccuracy","atkSpeed","counterChance","critChance","moveSpeed","totalWeight"],
            ["Attack","DMG Reduction","DFN Ability","Accuracy","Attack Speed","Counter","Critical","Move","Weight"],
            ["Maximum attack damage before damage calculation.", "Damage reduction from armour.", "Defensive ability from reflexes and equipped shield.", "Attack accuracy from weapon skill and wield from equipped weapon.", "Attack speed contributes to how many hits a character can make with one regular attack. It is based on dexterity and the speed of both equipped weapons.", "Percent chance of countering an enemy attack.", "Percent chance of making a critical hit while doing a regular attack.", "The number of spaces that can be moved each turn.", "The amount of weight the character is currently carrying."]
        ],
        statusMenus:["CharStatus","CharTechniques"],
        recruitMenus:["CharStatus","CharTechniques"],
        rewardMenus:["CharStatus","CharTechniques"],
        equipmentMenus:["AdjustEquipment"],
        brionyMusic:"02-Briony.mp3",
        savedElements:[],
        rewardAmounts:[200, 1000, 5000],
        menuNum:0,
        curChar:{},
        startEvent:function(data){
            this.mainMusic = data.mainMusic;
            this.townMusic = data.townMusic;
            this.mainBG = data.mainBG;
            this.townBG = data.townBG;
            this.displayMenu("main", true);
            
            
            //TEMP
           /* $(".menu-option:eq(0)").trigger("click");
            $(".menu-option:eq(0)").trigger("click");
            $(".menu-option:eq(2)").trigger("click");*/
            /*$(".screen-menu:eq(1)").children(".options-list").children(".options-list-row").children(".menu-option:eq(1)").trigger("click");
            $(".menu-option:eq(0)").trigger("click");
            $(".screen-menu:eq(1)").children(".options-list:eq(1)").children(".options-list-row:eq(1)").children(".menu-option:eq(0)").trigger("mouseover");  
            $(".screen-menu:eq(1)").children(".options-list:eq(1)").children(".options-list-row:eq(1)").children(".menu-option:eq(0)").trigger("click");*/
            //$(".menu-option:eq(2)").trigger("click");
        },
        resetData:function(){
            this.curChar = {};
            this.menuNum = 0;
            $("#main-container").empty();
        },
        /* functions called from menus confirms START */
        displayMenu:function(name, noSound){
            if(!noSound) Q.audioController.playSound("rotate_tech.mp3");
            this.resetData();
            var data = this.baseMenu[name];
            this.currentPageName = name;
            this.currentPage = data;
            this.setMusic(data.music);
            this.setBG(data.bg);
            //Reset the controls so that there is default functionality for arrows, enter, and esc. This can be modified when buttons are created.
            Q.menuBuilder.MenuControls.reset();
            var screen = Q.menuBuilder.screen(this.currentPage.screen, this);
            $("#main-container").append(screen);
            this.addCustomMenu(screen, name);
            screen.children(".menu-container").children(".options-list").children(".options-list-row").children(".menu-option").not(".menu-option-disabled").first().trigger("mouseover");
            Q.menuBuilder.MenuControls.setIdx(Q.menuBuilder.MenuControls.selectedIdx[0], Q.menuBuilder.MenuControls.selectedIdx[1], Q.menuBuilder.MenuControls.selectedIdx[2]);
            //Set the focus to the selected menu item
            Q.menuBuilder.MenuControls.setFocus();
        },
        changeEvent:function(name){
            var type = Q.state.get("currentEvent").type;
            var act = Q.state.get("currentEvent").scene;
            $("#main-container").empty();
            Q.menuBuilder.MenuControls.disabled = true;
            Q.startScene(type, act, name);
        },  
        advanceWeek:function(pageTo){
            var controller = this;
            Q.menuBuilder.MenuControls.disabled = true;
            var music = Q.audioController.currentMusic;
            
            Q.audioController.stopMusic(music);
            Q.audioController.playSound("101-Week_End.mp3");
            Q.menuBuilder.MBUtility.changeBarText($(".text-bar"),"Going to sleep...");
            
            Q.timeController.cycleWeek(function(){
                Q.audioController.currentMusic = false;
                Q.audioController.playMusic(music,function(){
                    controller.displayMenu(pageTo, true);
                });
            });
        },
        cycleMenu:function(menuName, inc){
            var MB = Q.menuBuilder;
            var lastSelected = MB.MenuControls.getSelected();
            var data = this[menuName+"Menus"];
            var newMenuNum = MB.MenuControls.checkWrap(data.length, this.menuNum + inc);
            this.menuNum = newMenuNum;
            var id = "allies";
            if(menuName === "recruit") id = "roster";
            var char = this.getCurrentChar(id);
            this.curChar = char;
            this["build"+data[newMenuNum]](char);
            
            //Make sure that even if we've inserted another list that the currently selected item remains so.
            lastSelected.trigger("mouseover");
        },
        /* functions called from menus confirms END */
        setMusic:function(music){
            music = this[music];
            Q.audioController.playMusic(music);
        },
        setBG:function(bg){
            bg = this[bg];
            $("#background-container").css('background-image', 'url(images/bg/'+bg+')');
        },
        changeOption:function(option){
            var c = Q.optionsController;
            switch(option){
                case "musicEnabled":
                case "soundEnabled":
                case "factionHighlighting":
                case "autoScroll":
                case "recallMove":
                case "tooltips":
                case "damageIndicators":
                    c.toggleBoolOpt(option);
                    break;
                case "musicVolume":
                    Q.optionsController.musicVolume = Math.random();
                    Q.audioController.changeVolume(Q.optionsController.musicVolume);
                    
                    break;
                case "soundVolume":
                    Q.optionsController.soundVolume = Math.random();
                    break;
                case "textSpeed":
                    
                    break;
                case "pointerSpeed":
                    
                    break;
                case "brightness":
                    
                    break;
            }
        },
        
        addCustomMenu:function(screen, name){
            var MB = Q.menuBuilder;
            var controller = this;
            function buildStatusMenu(type){
                if(Q.menuBuilder.MenuControls.disabled) return;
                var char = controller.getCurrentChar(type);
                if(!char) char = $(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").children(".menu-option").children("span").text();
                if(char.name === controller.curChar.name) return;
                controller.curChar = char;
                controller["build"+controller[name+"Menus"][controller.menuNum]](char);
            }
            //Name is unique because it comes from the keys in the baseMenu.
            //Any custom functions for the menu (anything that is more than lists of buttons)
            switch(name){
                case "actions":
                    //If there are no characters available, cross out some options.
                    if(Q.jobsController.noCharsAvailable){
                        var list = screen.children(".screen-menu:eq(0)").children(".options-list");
                        list.children(".options-list-row:eq(1)").children(".menu-option").addClass("menu-option-disabled");
                        list.children(".options-list-row:eq(2)").children(".menu-option").addClass("menu-option-disabled");
                    }
                    var money = Q.state.get("saveData").money;
                    if(money < this.rewardAmounts[0]){
                        var list = screen.children(".screen-menu:eq(0)").children(".options-list");
                        list.children(".options-list-row:eq(1)").children(".menu-option").addClass("menu-option-disabled");
                    }
                    if(Q.jobsController.noJobsAvailable){
                        var list = screen.children(".screen-menu:eq(0)").children(".options-list");
                        list.children(".options-list-row:eq(2)").children(".menu-option").addClass("menu-option-disabled");
                    }
                    break;
                case "shop":
                    var allItems = Q.state.get("equipment");
                    MB.MenuControls.noWrap = true;
                    this.currentItems = {
                        Accessories:Q.locationController.data.shop.Accessories.map(function(itm){return allItems.Accessories[itm];}),
                        Consumables:Q.locationController.data.shop.Consumables.map(function(itm){return allItems.Consumables[itm];}),
                        Materials:Q.locationController.data.shop.Materials.map(function(itm){return allItems.Materials[itm];})
                    };
                    if(Q.jobsController.noCharsAvailable){
                        var list = screen.children(".screen-menu:eq(1)").children(".options-list");
                        list.children(".options-list-row:eq(1)").children(".menu-option").addClass("menu-option-disabled");
                    }
                    
                    
                    var headings = screen.children(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").first();
                    headings.children(".menu-text").first().addClass("borderless-bottom-left");
                    headings.children(".menu-text").last().addClass("borderless-bottom-right");
                    
                    
                    Q.locationController.sortOrder = 1;
                    this.showItemsList("Accessories");
                    break;
                case "blacksmith":
                    MB.MenuControls.noWrap = true;
                    //Gen items
                    this.currentItems = {
                        Weapons:Q.locationController.data.blacksmith.Weapons.map(function(itm){return CharacterGenerator.convertEquipment([itm[1], itm[2]], itm[0]);}),
                        Shields:Q.locationController.data.blacksmith.Shields.map(function(itm){return CharacterGenerator.convertEquipment([itm[1], itm[2]], itm[0]);}),
                        Armour:Q.locationController.data.blacksmith.Armour.map(function(itm){return CharacterGenerator.convertEquipment([itm[1], itm[2]], itm[0]);}),
                        Footwear:Q.locationController.data.blacksmith.Footwear.map(function(itm){return CharacterGenerator.convertEquipment([itm[1], itm[2]], itm[0]);})
                    };
                    
                    if(Q.jobsController.noCharsAvailable){
                        var list = screen.children(".screen-menu:eq(1)").children(".options-list");
                        list.children(".options-list-row:eq(1)").children(".menu-option").addClass("menu-option-disabled");
                    }
                    
                    
                    var headings = screen.children(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").first();
                    headings.children(".menu-text").first().addClass("borderless-bottom-left");
                    headings.children(".menu-text").last().addClass("borderless-bottom-right");
                    
                    Q.locationController.sortOrder = 1;
                    this.showItemsList("Weapons");
                
                    break;
                case "status":
                case "equip":
                    screen.children(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").children(".menu-text").each(function(){
                        $(this).on("mouseover",function(){
                            buildStatusMenu("allies");
                        });
                    });
                    //Append a placeholder for replacing
                    screen.children(".screen-menu:eq(1)").children(".arrow-container:eq(0)").after(MB.cont());
                    buildStatusMenu("allies");
                    break;
                case "town":
                    if(!Q.partyManager.roster.length){
                        screen.children(".screen-menu:eq(0)").children(".options-list").children(".options-list-row:eq(0)").children(".menu-option").addClass("menu-option-disabled");
                    }
                    break;
                case "reward":
                    MB.MenuControls.noWrap = true;
                    var leftMenu = screen.children(".screen-menu:eq(0)");
                    var middleMenu = screen.children(".screen-menu:eq(1)");
                    var rightMenu = screen.children(".screen-menu:eq(2)");
                    var confirmButton = rightMenu.children(".options-list").children(".options-list-row:eq(0)").children(".menu-option");
                    var backButton = rightMenu.children(".options-list").children(".options-list-row:eq(1)").children(".menu-option");
                    leftMenu.children(".options-list").children(".options-list-row").children(".menu-text").each(function(){
                        $(this).on("mouseover",function(){
                            if(Q.menuBuilder.MenuControls.disabled) return;
                            Q.partyManager.resetTempAction();
                            var idx = MB.MBUtility.getSelectedIdx(leftMenu);
                            middleMenu.empty();
                            middleMenu.append(MB.portraitsScreen([{}], ["loy"], idx + 1, [], 0, middleMenu, leftMenu, confirmButton, backButton));
                        });
                        $(this).on("click",function(){
                            if(Q.menuBuilder.MenuControls.disabled) return;
                            MB.MenuControls.selectSelectedIdx([1, 0, 0]);
                            middleMenu.children(".options-list:eq(0)").children(".options-list-row:eq(0)").children(".menu-option:eq(0)").mouseover();
                        });
                        $(this).on("back", function(){
                            rightMenu.children(".options-list").children(".options-list-row:eq(1)").children(".menu-option").trigger("click");
                        });
                    });
                    var money = Q.state.get("saveData").money;
                    for(var i=0;i<this.rewardAmounts.length;i++){
                        if(money < this.rewardAmounts[i]){
                            leftMenu.children(".options-list").children(".options-list-row:eq("+i+")").children(".menu-option").addClass("menu-option-disabled");
                        }
                    }
                    middleMenu.empty();
                    leftMenu.children(".options-list").addClass("list-keyboard-disabled");
                    middleMenu.append(MB.portraitsScreen([{}], ["loy"], 1, [], 0, middleMenu, leftMenu, confirmButton, backButton));
                    break; 
                case "jobs":
                    MB.MenuControls.noWrap = true;
                    var leftMenu = screen.children(".screen-menu:eq(0)");
                    var middleMenu = screen.children(".screen-menu:eq(1)");
                    var rightMenu = screen.children(".screen-menu:eq(2)");
                    var confirmButton = rightMenu.children(".options-list").children(".options-list-row:eq(0)").children(".menu-option");
                    var backButton = rightMenu.children(".options-list").children(".options-list-row:eq(1)").children(".menu-option");
                    var jobsList = Q.state.get("jobsList");
                    var jobData = Q.jobsController.currentJobs;
                    for(var i=0;i<jobData.length;i++){
                        if(jobData[i].inProgress) leftMenu.children(".options-list").children(".options-list-row").children(".menu-option:eq("+i+")").addClass("job-in-progress menu-option-disabled");
                    }
                    function chooseJob(){
                        if(Q.menuBuilder.MenuControls.disabled) return;
                        Q.partyManager.resetTempAction();
                        var jobIndex = parseInt(MB.MenuControls.getSelected().attr("idx"));
                        var data = jobsList.jobs[jobData[jobIndex].job][jobData[jobIndex].tier];
                        middleMenu.empty();
                        middleMenu.append(MB.portraitsScreen([{},{},{}], data.stats, data.weeks, data.reqs, jobData[jobIndex].tier, middleMenu, leftMenu, confirmButton, backButton));
                    };
                    leftMenu.children(".options-list").children(".options-list-row").children(".menu-text:not(.job-in-progress)").each(function(){
                        $(this).on("mouseover",chooseJob);
                        $(this).on("click",function(){
                            if(Q.menuBuilder.MenuControls.disabled) return;
                            MB.MenuControls.selectSelectedIdx([1, 0, 0]);
                            middleMenu.children(".options-list:eq(0)").children(".options-list-row:eq(0)").children(".menu-option:eq(0)").mouseover();
                        });
                        $(this).on("back", function(){
                            rightMenu.children(".options-list").children(".options-list-row:eq(1)").children(".menu-option").trigger("click");
                        });
                    });
                    leftMenu.children(".options-list").addClass("list-keyboard-disabled");
                    chooseJob();
                    
                    break;
                case "missions":
                    var list = screen.children(".screen-menu:eq(0)").children(".options-list");
                    
                    break;
                case "recruit":
                    function editCostText(){
                        var char = controller.curChar;
                        var desc = "Recruit "+char.name+" for "+char.cost+" gold?";
                        MB.MBUtility.changeHoverDesc(recruitButton, "menu-option-selected",$(".text-bar"), desc);
                        var money = Q.state.get("saveData").money;
                        if(money < char.cost){
                            recruitButton.addClass("menu-option-disabled");
                            $(recruitButton).css("pointer-events", "none");
                        } else {
                            recruitButton.removeClass("menu-option-disabled");
                            $(recruitButton).css("pointer-events", "auto");
                        }
                        recruitButton.children("span").text("Recruit ("+char.cost+")");
                    }
                    
                    var rightMenu = screen.children(".screen-menu:eq(2)");
                    var recruitButton = rightMenu.children(".options-list:eq(0)").children(".options-list-row:eq(0)").children(".menu-option").first();
                    screen.children(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").children(".menu-text").each(function(){
                        $(this).on("mouseover",function(){
                            buildStatusMenu("roster");
                            editCostText();
                        });
                        $(this).on("click",function(){
                            if(Q.menuBuilder.MenuControls.disabled) return;
                            MB.MenuControls.selectSelectedIdx([5, 0, 0]);
                            rightMenu.children(".options-list:eq(0)").children(".options-list-row:eq(0)").children(".menu-option").mouseover();
                        });
                    });
                    screen.children(".screen-menu:eq(1)").children(".arrow-container:eq(0)").after(MB.cont());
                    buildStatusMenu("roster");
                    editCostText();
                    break;
                case "options":
                    this.buildOptionsMenu();
                    break;
                    
            }
        },
        confirmRecruit:function(){
            var cont = $(".screen").children(".screen-menu:eq(2)");
            var MB = Q.menuBuilder;
            var char = this.curChar;
            this.savedElements.push(cont.children(".options-list:eq(0)").children(".options-list-row:eq(0)").children(".menu-option").detach());
            cont.children(".options-list:eq(0)").children(".options-list-row:eq(0)").append(MB.createOption({text:"Confirm",desc:"Are you sure you want to recruit "+char.name+" for "+char.cost+" gold?", confirm:{func:"confirmedRecruit", props:[char]}}, this, $(".text-bar")));
            MB.MenuControls.selectSelectedIdx([2, 0, 0]);
            cont.children(".options-list:eq(0)").children(".options-list-row:eq(0)").children(".menu-option").mouseover();
            var controller = this;
            Q.jobsController.noCharsAvailable = false;
            MB.MenuControls.on("changedMenu",function(){
                cont.children(".options-list:eq(0)").children(".options-list-row:eq(0)").children(".menu-text").replaceWith(controller.savedElements[0]);
                controller.savedElements.splice(0,1);
                MB.MenuControls.off("changedMenu");
            });
        },
        confirmedRecruit:function(char){
            var MB = Q.menuBuilder;
            MB.MenuControls.off("changedMenu");
            Q.variableProcessor.changeMoney(-char.cost);
            var idx = Q.partyManager.roster.indexOf(char);
            Q.partyManager.removeFromRoster(idx);
            Q.partyManager.addToAllies(char);
            var controller = this;
            Q.menuBuilder.MenuControls.disabled = true;
            Q.menuBuilder.MBUtility.changeBarText($(".text-bar"),char.name+" recruited!");
            Q.audioController.interruptMusic("102-Recruit_Roster_Character.mp3",function(){
                Q.audio.resume("bgm/"+Q.audioController.currentMusic);
                Q.menuBuilder.MenuControls.disabled = false;
                if(!Q.partyManager.roster.length) return controller.displayMenu("town");

                var cont = $(".screen").children(".screen-menu:eq(2)");
                cont.children(".options-list:eq(0)").children(".options-list-row:eq(0)").children(".menu-text").replaceWith(controller.savedElements[0]);
                controller.savedElements.splice(0,1);
                $(".screen").children(".screen-menu:eq(0)").children(".options-list").children(".options-list-row:eq("+idx+")").remove();
                
                MB.MenuControls.selectSelectedIdx([0, 0, 0]);
                MB.MenuControls.getSelected().mouseover();
            });
        },
        selectCertainIndex:function(z, y, x){
            var MB = Q.menuBuilder;
            MB.MenuControls.selectSelectedIdx([z, y, x]);
            MB.MenuControls.getSelected().mouseover();
        },
        showItemsList:function(field, sorted){
            var curItems = this.currentItems;
            var items = curItems[field];
            var allItems = Q.state.get("equipment");
            var MB = Q.menuBuilder;
            var maxItemsShown = 6;
            var highestQualityOfEqShown = 11;Q.partyManager.getRankProp("eqQualityRank");
            var cont = $(".screen-menu:eq(0)").children(".options-list:eq(0)");
            cont.children(".options-list-row:eq(0)").nextAll().remove();
            var currentHeadings = [];
            function getConvertedStat(value, item){
                item = typeof item === "string" ? allItems[field][item] : item;
                if(!item || !item.name) return 0;
                switch(value){
                    case "name":
                        return item.name;
                    case "cost":
                        return item.cost;
                    case "desc":
                        return item.desc;
                    case "damage":
                        return ~~((item.mindmg + item.maxdmg) / 2);
                    case "atkspeed":
                        return item.attackSpeed;
                    case "range":
                        return item.range;
                    case "defense":
                        return item.damageReduction;
                    case "block":
                        return item.block;
                }
            }
            function sortTable(){
                curItems[field] = curItems[field].sort(function(a, b){
                    return getConvertedStat(Q.locationController.sortBy, a) > getConvertedStat(Q.locationController.sortBy, b) ? 1 * Q.locationController.sortOrder : -1 * Q.locationController.sortOrder;
                });
                Q.locationController.showItemsList(field, true);
            }
            function clickHeading(){
                var headingIndex = $(this).index();
                Q.locationController.sortBy = currentHeadings[headingIndex][1];
                Q.locationController.sortOrder *= -1;
                sortTable();
                Q.audioController.playSound("rotate_tech.mp3");
                $(MB.MenuControls.getSelected()).mouseover();
                MB.MenuControls.setFocus();
            }
            function displayTable(headings){
                currentHeadings = headings;
                var headingCont = MB.cont("w-xl h-xs table-row flex-h options-list-row retain-selected-index");
                for(var i=0;i<headings.length;i++){
                    var container = MB.cont("w-xl h-xl item-table-item menu-option borderless");
                    var itm = MB.icon("h-xl","gear-heading-"+headings[i][1]);//MB.text("w-xl h-xl item-table-item menu-option borderless", headings[i]);
                    container.attr("field",headings[i]);
                    container.on("mouseover", {}, MB.MBUtility.hoverTableOption);
                    MB.MBUtility.hoverMenuOption(container, "menu-option-selected", $(".text-bar"), "Sort by: "+headings[i][0]);
                    container.on("click",clickHeading);
                    container.append(itm);
                    headingCont.append(container);
                }
                headingCont.children(".menu-option").first().on("pressLeft", function(){
                    headingCont.children(".menu-option").last().trigger("mouseover");
                });
                headingCont.children(".menu-option").last().on("pressRight", function(){
                    headingCont.children(".menu-option").first().trigger("mouseover");
                });
                cont.append(headingCont);
            }
            function displayTableItem(values, itemNum, equipment){
                var valueCont = MB.cont("w-xl h-xxs table-row flex-h options-list-row retain-selected-index");
                for(var i=0;i<values.length;i++){
                    var itm = MB.text("item-table-item menu-option borderless",values[i]);
                    itm.children("span").addClass("small-font");
                    var descString = values[0];
                    if(equipment){
                        var quality = equipment[0];
                        var material = equipment[1];
                        descString = quality + " " + material + " " + values[0];
                        if(i === 0){
                            itm.prepend(MB.icon("","material-"+(material.replace(/\s/g , "-").toLowerCase())));
                            itm.addClass("quality-bg-"+quality);
                        }
                    }
                    itm.on("mouseover", {} ,MB.MBUtility.hoverTableOption);
                    MB.MBUtility.hoverMenuOption(itm, "menu-option-selected", $(".text-bar"), descString);
                    itm.on("click",function(){MB.MenuControls.cycleIndex(1, 0, 0);});
                    $(itm).on("pressRight", function(){
                        $(this).trigger("click");
                    });
                    valueCont.append(itm);
                }
                cont.append(valueCont);
                if(itemNum >= maxItemsShown){ valueCont.hide(); };
            }
            var qKeys = Object.keys(allItems.Quality);
            
            function validToShow(quality){
                if(qKeys.indexOf(quality) <= highestQualityOfEqShown) return true;
            }
            var itemsShown = items.length;
            switch(field){
                case "Materials":
                    displayTable([["Name", "name"], ["Total Cost", "cost"]]);
                    for(var i=0;i<items.length;i++){
                        var itm = items[i];
                        displayTableItem([itm.name, itm.cost], i);
                    }
                    break;
                case "Consumables":
                    displayTable([["Name", "name"], ["Total Cost", "cost"],["Description","desc"]]);
                    for(var i=0;i<items.length;i++){
                        var itm = items[i];
                        displayTableItem([itm.name, itm.cost, itm.desc], i);
                    }
                    break;
                case "Accessories":
                    displayTable([["Name", "name"], ["Total Cost", "cost"],["Description","desc"]]);
                    for(var i=0;i<items.length;i++){
                        var itm = items[i];
                        displayTableItem([itm.name, itm.cost, itm.desc], i);
                    }
                    break;
                case "Weapons":
                    displayTable([["Name", "name"], ["Total Cost", "cost"], ["Damage", "damage"], ["Atk Speed", "atkspeed"],  ["Range", "range"], ["Description","desc"]]);
                    for(var i=0;i<items.length;i++){
                        var itm = items[i];
                        if(validToShow(itm.quality)){ 
                            displayTableItem([itm.name, itm.cost, ~~((itm.mindmg+itm.maxdmg)/2), itm.attackSpeed, itm.range,"Weapon desc..."], i, [itm.quality, itm.material]);
                        } else {
                            itemsShown --;
                        }
                    }
                    break;
                case "Shields":
                    displayTable([["Name", "name"], ["Total Cost", "cost"],["Block", "block"],["Description","desc"]]);
                    for(var i=0;i<items.length;i++){
                        var itm = items[i];
                        if(validToShow(itm.quality)){
                            displayTableItem([itm.name, itm.cost, itm.block, "Shield desc..."], i, [itm.quality, itm.material]);
                        } else {
                            itemsShown --;
                        }
                    }
                    break;
                case "Armour":
                    displayTable([["Name", "name"], ["Total Cost", "cost"],["Dmg Reduction", "defense"],["Description","desc"]]);
                    for(var i=0;i<items.length;i++){
                        var itm = items[i];
                        if(!validToShow(itm.quality)){
                            displayTableItem([itm.name, itm.cost, itm.damageReduction, "Armour desc..."], i, [itm.quality, itm.material]);
                        } else {
                            itemsShown --;
                        }
                    }
                    break;
                case "Footwear":
                    displayTable([["Name", "name"], ["Total Cost", "cost"],["Description","desc"]]);
                    for(var i=0;i<items.length;i++){
                        var itm = items[i];
                        if(!validToShow(itm.quality)){
                            displayTableItem([itm.name, itm.cost, "Footwear desc..."], i, [itm.quality, itm.material]);
                        } else {
                            itemsShown --;
                        }
                    }
                    break;
            }
            
            if(itemsShown >= maxItemsShown){
                var bottomIdx = 3;
                var curBottom = bottomIdx;
                var curTop = bottomIdx + maxItemsShown - 1;
                var maxTop = items.length + 2;
                
                var upArrow = MB.cont("options-list-row w-xl h-xxxs");
                var opt = MB.createOption({text:" ",desc:"Cycle list up"}, upArrow, $(".text-bar"), "");
                opt.on("click",function(){
                    if(curBottom - 1 < bottomIdx) { 
                        return;
                    } else {
                        curBottom --;
                        $(cont).children(".options-list-row:eq("+curBottom+")").show();
                        $(cont).children(".options-list-row:eq("+curTop+")").hide();
                        curTop --;
                    }
                });
                upArrow.append(opt);
                opt.children("span").replaceWith(MB.icon("menu-option", "quantifier-up-arrow"));
                cont.children(".options-list-row:eq(2)").before(upArrow);
                
                var downArrow = MB.cont("options-list-row w-xl h-xxxs");
                var opt = MB.createOption({text:" ",desc:"Cycle list down"}, downArrow, $(".text-bar"), "");
                opt.on("click",function(){
                    if(curTop + 1 > maxTop) { 
                        return;
                    } else {
                        curTop ++;
                        $(cont).children(".options-list-row:eq("+curBottom+")").hide();
                        $(cont).children(".options-list-row:eq("+curTop+")").show();
                        curBottom ++;
                    }
                });
                downArrow.append(opt);
                opt.children("span").replaceWith(MB.icon("menu-option", "quantifier-down-arrow"));
                cont.append(downArrow);
                if(!sorted) cont.children(".options-list-row:eq(3)").children(".menu-option:eq(0)").trigger("mouseover");
            } else {
                if(!sorted) cont.children(".options-list-row:eq(2)").children(".menu-option:eq(0)").trigger("mouseover");
            }
            if(!itemsShown){
                $(".screen-menu:eq(1)").children(".options-list").children(".options-list-row:eq(0)").children(".menu-option").addClass("menu-option-disabled");
                $(".screen-menu:eq(1)").children(".options-list").children(".options-list-row:eq(1)").children(".menu-option").addClass("menu-option-disabled");
            } else {
                $(".screen-menu:eq(1)").children(".options-list").children(".options-list-row:eq(0)").children(".menu-option").removeClass("menu-option-disabled");
                $(".screen-menu:eq(1)").children(".options-list").children(".options-list-row:eq(1)").children(".menu-option").removeClass("menu-option-disabled");
            }
        },
        askQuantityPurchaseItem:function(){
            var controller = this;
            var menu = $(".screen-menu:eq(0)").children(".options-list:eq(0)");
            var typeIdx = menu.children(".options-list-row:eq(0)").children(".menu-option-selected").text();
            var itmIdx = menu.children(".options-list-row").index(menu.children(".options-list-row").children(".hovered-row:eq(0)").parent()) - 3;
            if(!itmIdx || itmIdx < 0) itmIdx = 0;
            var item = controller.currentItems[typeIdx][itmIdx];
            var MB = Q.menuBuilder;
            var cont = MB.cont("screen-menu menu-style3 w-s");
            var list = MB.cont("w-xl h-l options-list");
            var text = MB.text("w-xl h-s text-paragraph", "Purchase how many "+item.name+"?");
            cont.append(text);
            list.append(MB.quantifier("w-m h-xs options-list-row flex-v", "w-xl h-xs flex-v", 1, 1, 1, 99));
            list.children(".menu-text").on("changed",function(){
                var amount = parseInt($(this).children("span").text());
                var cost = item.cost;
                var money = Q.state.get("saveData").money;
                if(amount * cost > money){
                    cont.children(".options-list").children(".options-list-row:eq(2)").children(".menu-option").addClass("menu-option-disabled");
                } else {
                    cont.children(".options-list").children(".options-list-row:eq(2)").children(".menu-option").removeClass("menu-option-disabled");
                }
            });
            var confirmCont = MB.cont("w-xl h-s options-list-row flex-v");
            var confirm = MB.text("w-xl h-xl menu-option", "Confirm");
            
            MB.MBUtility.hoverMenuOption(confirm, "menu-option-selected");
            confirm.on("click",function(){
                if($(this).hasClass("menu-option-disabled") || Q.menuBuilder.MenuControls.disabled) return;
                Q.menuBuilder.MenuControls.disabled = true;
                var amount = parseInt(cont.children(".options-list").children(".menu-text").children("span").text());
                var cost = item.cost;
                Q.variableProcessor.changeMoney(-amount * cost);
                Q.audioController.interruptMusic("103-Small_Reward.mp3",function(){
                    Q.audio.resume("bgm/"+Q.audioController.currentMusic);
                    Q.menuBuilder.MenuControls.disabled = false;
                    MB.MenuControls.selectSelectedIdx([1, 0, 0]);
                    MB.MenuControls.getSelected().mouseover();
                    $("#fader").remove();
                    $(".screen-menu:eq(2)").remove();
                    $(".screen-menu:eq(1)").css("visibility", "visible");
                    $(".screen-menu:eq(0)").children(".options-list").removeClass("list-keyboard-disabled");
                    $(".screen-menu:eq(1)").children(".options-list").removeClass("list-keyboard-disabled");
                });
            });
            var goBack = function(){
                if(Q.menuBuilder.MenuControls.disabled) return;
                $("#fader").remove();
                $(".screen-menu:eq(2)").remove();
                $(".screen-menu:eq(1)").css("visibility", "visible");
                MB.MenuControls.selectSelectedIdx([1, 0, 0]);
                MB.MenuControls.getSelected().mouseover();
                $(".screen-menu:eq(0)").children(".options-list").removeClass("list-keyboard-disabled");
                $(".screen-menu:eq(1)").children(".options-list").removeClass("list-keyboard-disabled");
            };
            confirm.on("back",goBack);
            confirmCont.append(confirm);
            var backCont = MB.cont("w-xl h-s options-list-row");
            var back = MB.text("w-xl h-xl menu-option", "Back");
            MB.MBUtility.hoverMenuOption(back, "menu-option-selected");
            back.on("click",goBack);
            backCont.append(back);
            list.append(confirmCont);
            list.append(backCont);
            cont.append(list);
            
            list.children(".menu-text").trigger("changed");
            MB.MenuControls.noWrap = true;
            $(".screen-menu:eq(0)").children(".options-list").addClass("list-keyboard-disabled");
            $(".screen-menu:eq(1)").children(".options-list").addClass("list-keyboard-disabled");
            
            var fader = $("<div id='fader' class='fader-black'></div>");
            fader.css("opacity", 0.2);
            $("#main-content").append(fader);
            cont.addClass("above-fader");
            var takeFrom = $(".screen-menu:eq(1)");
            var width = takeFrom.outerWidth();
            var height = takeFrom.outerHeight();
            var pos = takeFrom.offset();
            $("#main-content").append(cont);
            $(takeFrom).css("visibility", "hidden");
            cont.css({width:width, height:height, top:pos.top, left:pos.left});
            cont.children(".options-list").children(".options-list-row:eq(0)").children(".menu-option").first().trigger("mouseover");
        },
        askQuantityBarterItem:function(minCost, maxCost, minQuantity, char, item){
            var controller = this;
            var menu = $(".screen-menu:eq(0)").children(".options-list:eq(0)");
            if(!item){
                var typeIdx = menu.children(".options-list-row:eq(0)").children(".menu-option-selected").text();
                var itmIdx = menu.children(".options-list-row").index(menu.children(".options-list-row").children(".hovered-row:eq(0)").parent()) - 2;
                if(!itmIdx || itmIdx < 0) itmIdx = 0;
                item = controller.currentItems[typeIdx][itmIdx];
            }
            var MB = Q.menuBuilder;
            var cont = MB.cont("screen-menu menu-style3 w-l");
            $(".screen-menu:eq(0)").replaceWith(cont);
            var confirmButton = $(".screen-menu:eq(1)").children(".options-list").children(".options-list-row:eq(0)").children(".menu-option");
            confirmButton.addClass("menu-option-disabled");
            function goBack(){
                controller.displayMenu(controller.currentPageName, true);
                $(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").children(".menu-text").children("span:contains("+typeIdx+")").trigger("mouseover");
                $(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").children(".menu-text").children("span:contains("+itmIdx+")").trigger("mouseover");
            }
            
            var characters = Q.partyManager.allies.filter(function(char){return !char.tempAction && !char.action;});
            var lastChar = char || {};
            function getBarterChance(itemCost, quantity, priceOffered, offSkl){
                var fullCost = itemCost;
                var mltInf = 0.05;
                var halfCost = fullCost / 2;
                var sklInf = 0.001;
                var offInfluence = 1 + offSkl * sklInf + (quantity - 1) * mltInf;
                var percentageBetween = getPercentageBetween(halfCost, fullCost, priceOffered * offInfluence);
                return percentageBetween;
            }
            function getHalfway(min, max){
                return max - (max - min) / 2;
            }
            function getNumWanted(){
                return parseInt($(smallQuantifier[1]).children("span").text());
            }
            function getCost(){
                return parseInt($(bigQuantifier[2]).children("span").text());
            }
            function getPercentageBetween(min, max, target){
                var newMax = max - min;// 200 - 100 = 100
                var newTarget = target - min;// 200 - 100 = 100
                var onePercent = newMax / 100;// 100/100 = 1
                return newTarget / onePercent; //100 / 1 = 100;
            };
            function calcOffer(itemCost, quantity, priceOffered, offSkl){
                var fullCost = itemCost;
                var mltInf = 0.05;
                var halfCost = fullCost / 2;
                var sklInf = 0.001;
                var offInfluence = 1 + offSkl * sklInf + (quantity - 1) * mltInf;
                var percentValue = halfCost / 100;
                var rand = Math.random();
                var point = halfCost + percentValue * rand * 100;
                var offeredValue = priceOffered * offInfluence;
                
                /*
                var maxValue = halfCost + percentValue * 1 * 100;
                var minValue = halfCost + percentValue * 0 * 100;
                console.log("Range of possible points: ("+minValue+" - "+maxValue+")");
                */
                /*console.log(
                "Full Cost: "+fullCost, 
                "Half Cost: "+halfCost, 
                "OffInf: "+offInfluence, 
                "Percent Value: "+percentValue,
                "Point: "+ point, 
                "Price Offered: "+priceOffered,
                "Rand: "+rand,
                "Offered Value: "+offeredValue);
                 */
                if(point <= offeredValue){
                    return "success";
                } else if(halfCost + (percentValue * (rand * 100 - 20)) <= offeredValue){
                    return getHalfway(point, fullCost);
                } else {
                    return "failed";
                }
            }
            function processResult(cost, quantity, result){
                var fader = $("<div id='fader' class='fader-black'></div>");
                fader.css("opacity", 0.2);
                $("#main-container").append(fader);
                var resultCont = MB.cont("screen menu-style1-solid");
                resultCont.addClass("above-fader");
                $("#main-container").append(resultCont);
                if(result === "success"){
                    Q.variableProcessor.changeMoney(-cost);
                    Q.partyManager.bag.addItem(item.kind,{gear:item.name,amount:quantity, quality:item.quality, material:item.material});
                    resultCont.append(MB.text("w-xl h-s","Successfully saved "+((item.cost * quantity) - cost)+" gold on the purchase of "+quantity+" "+item.name+"!"));

                    Q.menuBuilder.MenuControls.disabled = true;
                    Q.audioController.interruptMusic("103-Small_Reward.mp3",function(){
                        Q.audio.resume("bgm/"+Q.audioController.currentMusic);
                        Q.menuBuilder.MenuControls.disabled = false;
                        $("#fader").remove();
                        resultCont.remove();
                        goBack();
                    });

                } else if(result === "failed"){
                    resultCont.append(MB.text("w-xl h-s","The deal fell through."));

                    Q.menuBuilder.MenuControls.disabled = true;
                    Q.audioController.interruptMusic("105-Bad_Thing.mp3",function(){
                        Q.audio.resume("bgm/"+Q.audioController.currentMusic);
                        Q.menuBuilder.MenuControls.disabled = false;
                        $("#fader").remove();
                        resultCont.remove();
                        goBack();
                    });
                } 
                //The shopkeeper will make his own deal here
                //Probably don't need to access this code elsewhere, so don't make a function for it.
                else {
                    var offSkl = lastChar.baseStats.skl;
                    var rand = ~~(Math.random() * 100);
                    var howManyAdded = ~~(rand / offSkl);
                    var newQuantity = quantity + howManyAdded;
                    var newCost = cost + ((cost / quantity) * howManyAdded);
                    var newFullCost = item.cost * newQuantity;
                    var percentage = getPercentageBetween(newFullCost/2, newFullCost, newCost);
                    var middlePercent = (100 - percentage) / 2;
                    newCost = ~~(newFullCost - (middlePercent / 100) * newFullCost / 2);

                    var sayingCont = MB.cont("w-m h-s");
                    var sayings = Q.state.get("jobsList").defaults.barterTexts[1];
                    var randSaying = sayings[~~(Math.random()*sayings.length)];
                    sayingCont.append(MB.text("w-xl h-xl", randSaying));
                    var dataCont = MB.cont("w-m h-m menu-style3 flex-h");
                    var left = MB.cont("w-m h-xl flex-v");
                    
                    var itemHeading = MB.cont("w-xl h-xs heading-text");
                    itemHeading.append(MB.text("w-xl h-xl", "Item"));
                    left.append(itemHeading);
                    
                    var itemCont = MB.cont("w-xl h-ms");
                    itemCont.append(MB.text("w-xl h-xl", item.name));
                    left.append(itemCont);
                    var fullCostHeading = MB.cont("w-xl h-xs heading-text");
                    fullCostHeading.append(MB.text("w-xl h-xl", "Full Cost"));
                    left.append(fullCostHeading);
                    
                    var fullCostCont = MB.cont("w-xl h-ms flex-h");
                    fullCostCont.append(MB.text("w-m h-xl crossed-out", item.cost * quantity));
                    fullCostCont.append(MB.text("w-m h-xl star-border", newFullCost));
                    left.append(fullCostCont);

                    var right = MB.cont("w-m h-xl flex-v");
                    
                    var quantHeading = MB.cont("w-xl h-xs heading-text");
                    quantHeading.append(MB.text("w-xl h-xl", "Quantity"));
                    right.append(quantHeading);
                    
                    var quantCont = MB.cont("w-xl h-ms flex-h");
                    quantCont.append(MB.text("w-m h-xl crossed-out", quantity));
                    quantCont.append(MB.text("w-m h-xl star-border", newQuantity));
                    right.append(quantCont);
                    
                    var newCostHeading = MB.cont("w-xl h-xs heading-text");
                    newCostHeading.append(MB.text("w-xl h-xl", "Discounted Price"));
                    right.append(newCostHeading);
                    
                    var newCostCont = MB.cont("w-xl h-ms flex-h");
                    newCostCont.append(MB.text("w-m h-xl crossed-out", cost));
                    newCostCont.append(MB.text("w-m h-xl star-border", newCost));
                    right.append(newCostCont);


                    dataCont.append(left);
                    dataCont.append(right);

                    var choicesCont = MB.cont("w-m h-s");
                    var list = {
                        listClass:"h-xl w-xl flex-v",
                        rowClass:"h-m w-xl flex-h",
                        textClass:"",
                        items:[
                            [
                                {text:"Accept", desc:"Accept the new offer.",
                                    confirm:{
                                        func:function(){
                                            $("#fader").remove();
                                            resultCont.remove();
                                            processResult(newCost, newQuantity, "success");
                                        }
                                    },
                                    disabled: newCost > Q.state.get("saveData").money ? true : false
                                },
                                {text:"Barter", desc:"Continue Bartering.", 
                                    confirm:{
                                        func:function(){
                                            $("#fader").remove();
                                            resultCont.remove();
                                            controller.askQuantityBarterItem(cost, newCost, newQuantity, lastChar, item);
                                        }
                                    }
                                },
                                {text:"Decline", desc:"Decline the offer.", 
                                    confirm:{
                                        func:function(){
                                            $("#fader").remove();
                                            resultCont.remove();
                                            processResult(newCost, newQuantity, "failed");

                                        }
                                    }
                                }
                            ]
                        ]
                    };
                    choicesCont.append(MB.optionsList(list, Q.locationsController, $(".text-bar")));
                    

                    resultCont.append(sayingCont);
                    resultCont.append(dataCont);
                    resultCont.append(choicesCont);

                }
            }
            function doResultOfOffer(){
                if(!lastChar.baseStats) return;
                Q.jobsController.addAction([lastChar], "barter", 1);
                var cost = getCost();
                var quantity = getNumWanted();
                var result = calcOffer(item.cost * quantity, quantity, cost, lastChar.baseStats.skl);
                if(cost === maxCost) result = "success";
                processResult(cost, quantity, result);
            }
            
            MB.replaceList(
                $(".screen-menu:eq(1)").children(".options-list:eq(0)"), 
                {
                    listClass:"v-list",
                    rowClass:"w-xl h-xl",
                    items:[
                        [
                            {
                                text:"Confirm",
                                desc:"Barter for "+item.name+"?",
                                confirm:{
                                    func:doResultOfOffer
                                }
                            }
                        ],
                        [
                            {
                                text:"Back",
                                desc:"",
                                confirm:{
                                    func:goBack
                                }
                            }
                        ]
                    ] 
                },
                controller,
                $(".text-bar")
            );
            var leftCont = MB.cont("options-list w-msm h-xl");
            var nameCont = MB.cont("w-m h-xs");
            var name = MB.text("w-xl h-xl", lastChar.name || "");
            nameCont.append(name);
            var row = MB.cont("options-list-row h-sm flex-h");
            
            
            var descPara = MB.cont();
            descPara.append(MB.text("w-xl text-paragraph","Select who will barter"));
            var portraitSection = MB.getPortraitSection(
                function(){
                    if(char) return;
                    function chooseChar(){
                        var index = MB.MBUtility.getSelectedIdx(cont.next()) - 2;
                        lastChar = characters[index] || {};
                        cont.show();
                        cont.children(".options-list").removeClass("list-keyboard-disabled");
                        cont.next().remove();
                        $(".screen-menu:eq(1)").children(".options-list").removeClass("list-keyboard-disabled");
                        
                        MB.MenuControls.selectSelectedIdx([0,0,0]);
                        MB.MenuControls.setFocus();
                        $(MB.MenuControls.getSelected()).trigger("mouseover");
                        if(lastChar.name){
                            //TEMP
                            if(lastChar.name) lastChar.sprite = "knight.png";
                            cont.children(".options-list").children(".menu-container:eq(1)").children(".menu-text").children("span").text(lastChar.name);
                            cont.children(".options-list").children(".options-list-row").children(".menu-option").children(".char-portrait-container").children(".char-portrait-bg").children(".char-portrait-img").attr("src","images/story/"+lastChar.sprite);
                            cont.children(".options-list").children(".menu-container:eq(3)").children(".menu-container").children(".menu-text").last().children("span").text(lastChar.baseStats.skl);
                        } else {
                            cont.children(".options-list").children(".menu-container:eq(1)").children(".menu-text").children("span").text("");
                            cont.children(".options-list").children(".options-list-row").children(".menu-option").children(".char-portrait-container").children(".char-portrait-bg").children(".char-portrait-img").attr("src","images/story/empty.png");
                            cont.children(".options-list").children(".menu-container:eq(3)").children(".menu-container").children(".menu-text").last().children("span").text("");
                        }
                        updatePrediction();
                    };
                    function backFromCharSelection(){
                        if(!lastChar.name){
                            cont.children(".options-list").children(".options-list-row").last().children(".menu-option").trigger("mouseover");
                        } else {
                            var lastCharIdx = characters.indexOf(lastChar);
                            MB.MenuControls.selectSelectedIdx([2,lastCharIdx + 1,0]);
                            $(MB.MenuControls.getSelected()).trigger("mouseover");
                        }
                        chooseChar();
                    }
                    cont.hide();
                    cont.children(".options-list").addClass("list-keyboard-disabled");
                    $(".screen-menu:eq(1)").children(".options-list").addClass("list-keyboard-disabled");
                    var newCont = MB.cont("screen-menu menu-style3 w-l");
                    cont.after(newCont);
                    MB.produceHeadingLists(["skl"], newCont, characters, chooseChar, backFromCharSelection);
                    
                    var lastCharIdx = Math.max(0, characters.indexOf(lastChar));
                    MB.MenuControls.selectSelectedIdx([3,lastCharIdx + 1,0]);
                    MB.MenuControls.setFocus();
                    $(MB.MenuControls.getSelected()).trigger("mouseover");

                },
                goBack,
                lastChar
            );
            function updatePrediction(){
                if(!lastChar.name){
                    descPara.children(".text-paragraph").children("span").text("Select who will barter");
                    return;
                }
                var reducedCost = getCost();
                var chance = 0;
                if(reducedCost === maxCost){
                    chance = 100;
                } else {
                    var amount = getNumWanted();
                    chance = Math.floor(Math.min(100, Math.max(getBarterChance(item.cost * amount , amount, reducedCost, lastChar.baseStats.skl), 0)));
                }
                var jobDefaults = Q.state.get("jobsList").defaults;
                var chanceTier = chance === 0 ? 0 : chance <= 20 ? 1 : chance <= 40 ? 2 :  chance <= 60 ? 3 : chance <= 80 ? 4 : chance <= 99 ? 5 : 6;
                var text = jobDefaults.barterTexts[0][chanceTier];
                descPara.children(".text-paragraph").children("span").text(text + " ("+chance+"%)");
                var confirmButton = $(".screen-menu:eq(1)").children(".options-list").children(".options-list-row:eq(0)").children(".menu-option");
                if(reducedCost > Q.state.get("saveData").money){
                    confirmButton.addClass("menu-option-disabled");
                } else {
                    confirmButton.removeClass("menu-option-disabled");
                }
            }
            var skillCont = MB.cont("w-sm flex-v");
            var skCont = MB.cont("menu-container w-xl flex-h");
            var skill = MB.text("menu-text flex-h justify-left w-m", "SKL");
            var skillText = MB.text("menu-text flex-h justify-right w-m", lastChar.baseStats ? lastChar.baseStats.skl : "");
            skCont.append(skill);
            skCont.append(skillText);
            skillCont.append(skCont);
            if(char) portraitSection.addClass("menu-option-disabled");
            leftCont.append(MB.cont("w-xl h-xs"));
            leftCont.append(nameCont);
            row.append(portraitSection);
            leftCont.append(row);
            leftCont.append(skillCont);
            leftCont.append(descPara);
            
            cont.append(leftCont);
            
            
            var maxQuantity = minQuantity || 99;
            var minQuantity = minQuantity || 1;
            var minCost = minCost || Math.ceil(item.cost / 2);
            minCost *= minQuantity;
            var maxCost = maxCost || item.cost;
            var rightCont = MB.cont("w-mm h-xl");
            var topTextCont = MB.cont("w-xl h-xs");
            topTextCont.append(MB.text("w-xl h-xl", "Barter for:"));
            var itemCont = MB.cont("w-xl h-xs");
            itemCont.append(MB.text("w-xl h-xl",item.name));
            var titlesCont = MB.cont("w-ms h-l flex-v");
            titlesCont.append(MB.text("w-xl h-s", "Quantity"));
            titlesCont.append(MB.text("w-xl h-xs", ""));
            titlesCont.append(MB.text("w-xl h-s", "Reduced Price"));
            titlesCont.append(MB.text("w-xl h-sm", "Regular Price"));
            var numsCont = MB.cont("w-ms h-l flex-v");
            var fullCost = MB.text("w-xl h-sm", item.cost * minQuantity);
            
            var arrowsCont = MB.cont("w-s h-l flex-v options-list");
            
            var smallQuantifier = MB.quantifier("w-l h-xs options-list-row flex-v", "w-xl h-s flex-v", minQuantity, 1, minQuantity, maxQuantity);
            var bigQuantifier = MB.quantifier("w-l h-xs options-list-row flex-v", "w-xl h-s flex-v", maxCost, minQuantity, minCost, maxCost, true);
            arrowsCont.append(smallQuantifier);
            arrowsCont.append(MB.text("w-xl h-xs", ""));
            arrowsCont.append(bigQuantifier);
            
            $(smallQuantifier[1]).on("changed",function(e, num, oldAmount){
                var amount = parseInt($(this).children("span").text());
                if(oldAmount === amount) return;
                var quantCost = amount * item.cost;
                var halfCost = quantCost / 2;
                $(bigQuantifier[2]).attr("step", amount);
                $(bigQuantifier[2]).attr("min", halfCost);
                $(bigQuantifier[2]).attr("max", quantCost);
                
                var curAsk = parseInt($(bigQuantifier[2]).children("span").text());
                var unitPrice = curAsk / (amount - num);
                curAsk += unitPrice * num;
                $(bigQuantifier[2]).children("span").text(curAsk);
                if(curAsk < halfCost) $(bigQuantifier[2]).children("span").text(halfCost);
                if(curAsk > quantCost) $(bigQuantifier[2]).children("span").text(quantCost);
                fullCost.children("span").text(quantCost);
                maxCost = quantCost;
                updatePrediction();
            });
            $(bigQuantifier[2]).on("changed",function(){
                updatePrediction();
            });
            
            numsCont.append(smallQuantifier[1]);
            numsCont.append(MB.text("w-xl h-xs", ""));
            numsCont.append(bigQuantifier[2]);
            numsCont.append(fullCost);
            
            rightCont.append(topTextCont);
            rightCont.append(itemCont);
            rightCont.append(titlesCont);
            rightCont.append(numsCont);
            rightCont.append(arrowsCont);
            cont.append(rightCont);
            
            var characters = Q.partyManager.allies.filter(function(char){return !char.tempAction && !char.action;});
            lastChar = characters.sort(function(a, b){return a.baseStats.skl < b.baseStats.skl;})[0];
            
            if(lastChar.name) lastChar.sprite = "knight.png";
            cont.children(".options-list").children(".menu-container:eq(1)").children(".menu-text").children("span").text(lastChar.name);
            cont.children(".options-list").children(".options-list-row").children(".menu-option").children(".char-portrait-container").children(".char-portrait-bg").children(".char-portrait-img").attr("src","images/story/"+lastChar.sprite);
            cont.children(".options-list").children(".menu-container:eq(3)").children(".menu-container").children(".menu-text").last().children("span").text(lastChar.baseStats.skl);
            
            updatePrediction();
            
            if(!char){
                MB.MenuControls.selectSelectedIdx([0,0,0]);
                MB.MenuControls.getSelected().mouseover();
            } else {
                MB.MenuControls.selectSelectedIdx([1,0,0]);
                MB.MenuControls.getSelected().mouseover();
                updatePrediction();
            }
        },
        confirmedGiveReward:function(){
            var MB = Q.menuBuilder;
            var controller = this;
            var idx = MB.MBUtility.getSelectedIdx($(".screen-menu:eq(0)"));
            var amount = this.rewardAmounts[idx];
            Q.variableProcessor.changeMoney(-amount);
            var char = Q.partyManager.allies.filter(function(ally){return ally.tempAction;})[0];
            char.tempAction = false;
            Q.menuBuilder.MBUtility.changeBarText($(".text-bar"),"Gave "+char.name+" "+amount+" gold!");
            Q.menuBuilder.MenuControls.disabled = true;
            var jingle = idx === 1 ? "103-Small_Reward.mp3" : idx === 2 ? "104-Large_Reward.mp3" : "102-Recruit_Roster_Character.mp3";
            char.loyalty = Math.min(100,char.loyalty + 3 + (idx*idx)*6);
            Q.jobsController.addAction([char], "reward", idx + 1);
            Q.audioController.interruptMusic(jingle,function(){
                Q.audio.resume("bgm/"+Q.audioController.currentMusic);
                Q.menuBuilder.MenuControls.disabled = false;
                if(Q.jobsController.noCharsAvailable) return controller.displayMenu("actions");
                var money = Q.state.get("saveData").money;
                for(var i=0;i<controller.rewardAmounts.length;i++){
                    if(money < controller.rewardAmounts[i]){
                        if(i === 0) return $(".screen-menu:eq(2)").children(".options-list").children(".options-list-row").children(".menu-option:eq(1)").trigger("click");
                        $(".screen-menu:eq(0)").children(".options-list").children(".options-list-row:eq("+i+")").children(".menu-option").addClass("menu-option-disabled");
                    }
                }
                MB.MenuControls.selectSelectedIdx([0, 0, 0]);
                MB.MenuControls.getSelected().mouseover();
            });
        },
        confirmedDoJob:function(){
            var MB = Q.menuBuilder;
            var controller = this;
            var jobElement = $(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").children(".menu-option-selected");
            jobElement.off("click");
            jobElement.off("mouseover");
            
            var idx = parseInt(jobElement.attr("idx"));
            var jobsData = Q.state.get("jobsList");
            var curJob = Q.jobsController.currentJobs[idx];
            var job = jobsData.jobs[curJob.job][curJob.tier];
            
            curJob.lootsTier = jobsData.defaults.texts.indexOf($(".screen-menu:eq(1)").children(".menu-container:eq(1)").children(".menu-container:eq(1)").children(".menu-text").children("span").text()) - 1;
            curJob.reward = job.reward;
            var characters = Q.partyManager.allies.filter(function(ally){return ally.tempAction;});
            
            characters.forEach(function(char, i){
                char.tempAction = false;
            });
            var descString = "";
            if(characters.length === 1){
                descString = "Sent "+characters[0].name+" to do "+curJob.name;
            } else if(characters.length === 2){
                descString = "Sent "+characters[0].name+" and "+characters[1].name+" to do "+curJob.name;
            } else if(characters.length === 3){
                descString = "Sent "+characters[0].name+", "+characters[1].name+", and "+characters[2].name+" to do "+curJob.name;
            }
            Q.jobsController.addAction(characters, curJob.job, job.weeks, curJob);
            Q.menuBuilder.MBUtility.changeBarText($(".text-bar"),descString);
            Q.menuBuilder.MenuControls.disabled = true;
            Q.audioController.interruptMusic("103-Small_Reward.mp3",function(){
                Q.audio.resume("bgm/"+Q.audioController.currentMusic);
                Q.menuBuilder.MenuControls.disabled = false;
                curJob.inProgress = characters;
                if(Q.jobsController.noCharsAvailable) return controller.displayMenu("actions");
                jobElement.addClass("job-in-progress menu-option-disabled");
                if($(".job-in-progress").length === $(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").children(".menu-option").length){
                    Q.jobsController.noJobsAvailable = true;
                    return controller.displayMenu("actions");
                }
                MB.MenuControls.selectSelectedIdx([0, 0, 0]);
                MB.MenuControls.getSelected().mouseover();
            });
        },
        getCurrentChar:function(type){
            return Q.partyManager[type].filter(function(ally){return ally.name === $(".screen-menu:eq(0)").children(".options-list").children(".options-list-row").children(".menu-option-selected").children("span").text();})[0];
        },
        buildCharEquipment:function(){
            var cont = $(".screen").children(".screen-menu:eq(1)");
        },
        buildCharStatus:function(char){
            this.menuNum = 0;
            var cont = $(".screen").children(".screen-menu:eq(1)");
            
            var MB = Q.menuBuilder;
            
            var meat = MB.cont("sub-menu w-ll");
            var mainStats = MB.cont("char-stats-main-container");
            mainStats.append(MB.portrait("knight.png"));
            var basicStatsCont = MB.cont("char-stats-basic flex-v");

            basicStatsCont.append(MB.text("char-name",char.name));
            basicStatsCont.append(MB.text("char-levelclass","LV " + char.level + " " + char.charClass));
            var hp = MB.cont("w-xl flex-h");

            hp.append(MB.icon("text-icon","icon-hp"), MB.text("char-hp w-m h-xl", char.combatStats.maxHp+"/"+char.combatStats.hp));
            var tp = MB.cont("w-xl flex-h");
            tp.append(MB.icon("text-icon","icon-tp"), MB.text("char-tp w-m h-xl", char.combatStats.maxTp+"/"+char.combatStats.tp));
            basicStatsCont.append(hp, tp);
            mainStats.append(basicStatsCont);
            
            var combatStats = MB.cont("menu-container char-stats-combat-container");
            var statNames = Q.state.get("charGeneration").statNames;
            var statDescs = Q.state.get("charGeneration").statDescs;
            var bsList = {
                listClass:"h-xl w-xs flex-v",
                rowClass:"w-xl",
                textClass:"no-border no-bg justify-left",
                items:[]
            };
            var bsS = MB.cont("h-xl w-xs flex-v");
            for(var i=0;i<statNames.length;i++){
                var primary = char.primaryStat === statNames[i] ? "primary-stat-shine" : "";
                bsList.items.push([{text:statNames[i].toUpperCase(), desc:statDescs[i], textClass:primary}]);
                bsS.append(MB.text("char-"+statNames[i]+" "+primary,char.baseStats[statNames[i]])); 
            }
            combatStats.append(MB.optionsList(bsList, this, $(".text-bar")));
            
            combatStats.append(bsS);
            combatStats.append(MB.cont("h-xl w-xs"));
            
            var csNames = this.characterCombatStats[0];
            var csTexts = this.characterCombatStats[1];
            var csDescs = this.characterCombatStats[2];
            var csList =  {
                listClass:"h-xl w-m flex-v",
                rowClass:"w-xl",
                textClass:"no-border no-bg justify-left",
                items:[]
            };
            var csS = MB.cont("h-xl w-xs flex-v");
            for(var i=0;i<csNames.length;i++){
                csList.items.push([{text:csTexts[i], desc:csDescs[i]}]);
                csS.append(MB.text("justify-right char-"+csNames[i],char.combatStats[csNames[i]]));
            }
            combatStats.append(MB.optionsList(csList, this, $(".text-bar")));
            combatStats.append(csS);
            
            meat.append(mainStats, combatStats);
            
            cont.children(".menu-container:eq(1)").replaceWith(meat);
        },
        buildCharTechniques:function(char){
            this.menuNum = 1;
            var cont = $(".screen-menu:eq(1)");
            var MB = Q.menuBuilder;
            var meat = MB.cont("sub-menu w-ll flex-h");
            var techs = char.techniques.active;
            
            var techsList = MB.optionsList({items:"techniques", props:techs, listClass:"v-list", rowClass:"h-xl"}, this, $(".text-bar"));
            techsList.children(".options-list-row").first().children(".menu-text").first().addClass("borderless-top-left");
            techsList.children(".options-list-row").last().children(".menu-text").first().addClass("borderless-bottom-left");
            var techsCont = MB.cont("w-m h-xl");
            techsCont.append(techsList);
            meat.append(techsCont);
            
            var techsData = MB.cont("w-m h-xl");
            var lastTech = {};
            function generateTechInfo(){
                var curTech = techs[techsList.children(".options-list-row").index(techsList.children(".options-list-row").children(".menu-text.menu-option-selected").parent())];
                if(curTech === lastTech) return;
                lastTech = curTech;
                techsData.empty();
                techsData.append(MB.text("",curTech.name));
                techsData.append(MB.text("","etc..."));
            }
            
            meat.append(techsData);
            cont.children(".menu-container:eq(1)").replaceWith(meat);
            
            techsList.children(".options-list-row").children(".menu-text").on("mouseover",generateTechInfo);
            techsList.children(".options-list-row").first().children(".menu-text").first().addClass("menu-option-selected");
            generateTechInfo();
            
        },
        buildOptionsMenu:function(){
            var cont = $(".screen-menu:eq(0)");
            var MB = Q.menuBuilder;
            MB.MBUtility.roundList(cont.children(".options-list:eq(0)").children(".options-list-row"));
            
            var optBuilder = MB.cont("w-xl h-m");
            optBuilder.append(MB.text("","Options Builder code goes here. "));
            cont.append(optBuilder);
        },
        saveGame:function(){
            var music = Q.audioController.currentMusic;
            
            Q.audioController.stopMusic(music);
            Q.menuBuilder.MenuControls.disabled = true;
            Q.audioController.playSound("100-Save_Game.mp3",function(){
                Q.menuBuilder.MenuControls.disabled = false;
                Q.audioController.playMusic(music);
                Q.menuBuilder.MBUtility.changeBarText($(".text-bar"),"Game Saved!");
            });
        },
        loadGame:function(){
            
        },
        quitToMainMenu:function(){
            
        },
        quitToDesktop:function(){
            
        }
        
        
    });
    
    Q.GameObject.extend("PartyManager",{
        allies:[],
        roster:[],
        init:function(){
            
        },
        adjustTempStatChange:function(char,props){
            char.tempStatChanges.push(props);
            char.baseStats[props[0]] = Q.variableProcessor.evaluateStringOperator(char.baseStats[props[0]],props[1],props[2]);
        },
        addToAllies:function(character){
            this.allies.push(character);
        },
        removeFromAllies:function(idx){
            this.allies.splice(idx,1);
        },
        
        addToRoster:function(character){
            character.cost = CharacterGenerator.calculateCostOfCharacter(character);
            this.roster.push(character);
        },
        removeFromRoster:function(idx){
            this.roster.splice(idx,1);
        },
        resetTempAction:function(){
            Q.partyManager.allies.forEach(function(ally){
                ally.tempAction = false;
            });
        },
        cycleRoster:function(){
            this.roster.splice(0,1);
            this.addToRoster(Q.charGen.generateCharacter());
        },
        getAlly:function(name){
            if(name==="Current") return Q.state.get("currentEvent").character;
            return this.allies.find(function(ally){return name === ally.name;});
        },
        getRankProp:function(name){
            var ranks = Q.state.get("entourageRanks");
            var idx = ranks.properties.indexOf(name);
            var rank = Q.state.get("saveData").entourageRank;
            return ranks.base[idx] + ranks.mult[idx] * rank;
        },
        convertPropName:function(name){
            switch(name){
                case "Gender":
                    return "gender";
                case "Morale":
                    return "morale";
                case "Loyalty":
                    return "loyalty";
                case "Personality":
                    return "personality";
                case "Methodology":
                    return "methodology";
                case "Value":
                    return "value";
                case "Character Class":
                    return "charClass";
                case "Nationality":
                    return "nationality";
            }
            return name;
        },
        hasPersonality:function(character,much,value){
            if(!character.personality) return;
            for(var i=0;i<character.personality.length;i++){
                if(much === "All" || much === character.personality[i][0]){
                    if(character.personality === value) return true;
                }
            }
        },
        convertPresetString:function(obj,prop,value){
            //If we've passed in an operator, we're going to need either the min or max values.
            if(typeof obj === "string"){
                switch(prop){
                    case "morale":
                        return this.convertMorale(value,obj);
                    case "loyalty":
                        return this.convertLoyalty(value,obj);
                    case "value":
                        return this.convertValue(value,obj);
                    case "methodology":
                        return this.convertMethodology(value,obj);
                }
            } 
            //If the obj is a character, we want that character's prop
            else {
                switch(prop){
                    case "morale":
                        return this.convertMorale(obj[prop]);
                    case "loyalty":
                        return this.convertLoyalty(obj[prop]);
                    case "value":
                        return this.convertValue(obj[prop]);
                    case "methodology":
                        return this.convertMethodology(obj[prop]);
                }
                return obj[prop];
            }
        },
        adjustForOperator:function(min,max,operator){
            return !operator || operator === ">=" ? min : max;
        },
        convertMorale:function(morale,operator){
            if(typeof morale === "string"){
                if(morale==="Quit") return this.adjustForOperator(0,0,operator);
                if(morale==="Unhappy") return this.adjustForOperator(1,30,operator);
                if(morale==="Content") return this.adjustForOperator(31,70,operator);
                if(morale==="Inspired") return this.adjustForOperator(71,90,operator);
                return this.adjustForOperator(91,100,operator);
            }
            if(morale<1) return "Quit";
            if(morale<31) return "Unhappy";
            if(morale<71) return "Content";
            if(morale<91) return "Inspired";
            return "Ecstatic";
        },
        convertLoyalty:function(loyalty,operator){
            if(typeof loyalty === "string"){
                if(loyalty==="Traitorous") return this.adjustForOperator(0,0,operator);
                if(loyalty==="Disloyal") return this.adjustForOperator(1,30,operator);
                if(loyalty==="Average") return this.adjustForOperator(31,70,operator);
                if(loyalty==="Loyal") return this.adjustForOperator(71,90,operator);
                if(loyalty==="Admiring") return this.adjustForOperator(91,99,operator);
                return this.adjustForOperator(100,100,operator);
            }
            if(loyalty<1) return "Traitorous";
            if(loyalty<31) return "Disloyal";
            if(loyalty<71) return "Average";
            if(loyalty<91) return "Loyal";
            if(loyalty<100) return "Admiring";
            return "Idolizing";
        },
        convertValue:function(value,operator){
            if(typeof value === "string"){
                if(value==="Egoist") return this.adjustForOperator(0,32,operator);
                if(value==="Nepotist") return this.adjustForOperator(33,67,operator);
                return this.adjustForOperator(68,100);
            }
            if(value<33) return "Egoist";
            if(value<68) return "Nepotist";
            return "Altruist";
        },
        convertMethodology:function(value,operator){
            if(typeof value === "string"){
                if(value==="Intuitive") return this.adjustForOperator(0,32,operator);
                if(value==="Pragmatic") return this.adjustForOperator(33,67,operator);
                return this.adjustForOperator(68,100);
            }
            if(value<33) return "Intuitive";
            if(value<68) return "Pragmatic";
            return "Kind";
        },
    
        getRelations:function(value){
            //TODO
            if(value<1) return "Lowest";
            if(value<31) return "Low";
            if(value<71) return "Average";
            if(value<91) return "High";
            return "Superb";
        }
    });
    
    Q.GameObject.extend("VariableProcessor",{
        //Set the global and scene variables. Event vars are set when the scene is staged.
        init:function(){
            var obj = this;
            Object.assign(obj.vars.Global,GDATA.dataFiles['global-vars.json'].vrs);
            Q.state.get("scenesList").Story.forEach(function(sc){
                obj.vars.Scene[sc.name] = sc.vrs;
                obj.vars.Event[sc.name] = {};
            });
        },
        vars:{
            Global:{},
            Scene:{},
            Event:{}
        },
        changeMoney:function(amount){
            if(typeof amount !== "number") amount = parseInt(amount);
            Q.state.get("saveData").money += amount;
            $("#hud-money").text(Q.state.get("saveData").money);
        },
        evaluateStringOperator:function(vr,op,vl,min,max){
            var value;
            switch(op){
                case "+=": value = vr + vl; break;
                case "-=": value = vr - vl; break;
                case "=": value = vl; break;
            }
            if(min) value = Math.max(value,min);
            if(max) value = Math.min(value,max);
            return value;
        },
        setVar:function(scope,vr,op,vl,scene,event){
            switch(scope){
                case "Global":
                    var newValue = Q.variableProcessor.evaluateStringOperator(this.vars[scope][vr],op,vl);
                    this.vars[scope][vr] = newValue;
                    if(vr === "money") this.changeMoney(newValue);
                    break;
                case "Scene":
                    this.vars[scope][scene][vr] = Q.variableProcessor.evaluateStringOperator(this.vars[scope][scene][vr],op,vl);
                    break;
                case "Event":
                    this.vars[scope][scene][event][vr] = Q.variableProcessor.evaluateStringOperator(this.vars[scope][scene][event][vr],op,vl);
                    break;
            }
        },
        getVar:function(scope,vr){
            switch(scope){
                case "Global":
                    return this.vars[scope][vr];
                case "Scene":
                    var scene = Q.state.get("currentEvent").scene;
                    return this.vars[scope][scene][vr];
                case "Event":
                    var scene = Q.state.get("currentEvent").scene;
                    var event = Q.state.get("currentEvent").event;
                    return this.vars[scope][scene][event][vr];
            }
        }
    });
    //Has functions for splitting strings.
    //Can return array from a string that has \n\
    //Can get variable values from {a@b}
    //Can process modules from {moduleName}
    Q.GameObject.extend("TextProcessor",{
        makeParagraphs:function(text){
            //Split up all of the text by paragraph into an array(at \n)
            var paragraphs = text.split("\n").filter(
            //Remove any \n that has no text in it
            function(itm){
                return itm.length;
            //Rework the items into paragraphs.
            }).map(function(itm){
                return "<p>"+Q.textProcessor.replaceText(itm)+"</p>";
            //Join the array back into a string
            }).join(" ");
            return paragraphs;
        },
        evaluateStringConditional:function(vr,op,vl){
            switch(op){
                case "==": return vr == vl;
                case "!=": return vr != vl;
                case ">": return vr > vl;
                case "<": return vr < vl;
                case ">=": return vr >= vl;
                case "<=": return vr <= vl;
                case "set": return vl ? vr : !vr;
            }
        },
        getDeepValue:function(obj, path){
            for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
                obj = obj[path[i]];
            };
            return obj;
        },
        //Sometimes you just want to add the number value of a variable. See if the text is a number.
        fixVarType:function(val){
            if(val === true || val === "true") return true;
            if(val === false || val === "false") return false;
            var int = Number(val);
            if(isNaN(int)){
                return val;
            } else {
                return int;
            }
        },
        //Takes a string and evaluates anything within {} and then returns a new string
        replaceText:function(text){
            //Loop through each {}
            while(typeof text === "string" && text.indexOf("{") !== -1){
                text = text.replace(/\{(.*?)\}/,function(match, p1, p2, p3, offset, string){
                    return Q.textProcessor.getVarValue(p1);
                });
            }
            return Q.textProcessor.fixVarType(text);
           
        },
        getVarValue:function(text){
            var newText;
            //The text is a module on the page.
            if(text.indexOf("@") === -1){
                var module = Q.storyController.currentPage.modules.find(function(itm){return itm[0] === text;});
                for(var i=0;i<module[2].length;i++){
                    if(Q.groupsProcessor.processConds(module[2][i][0],module[2][i][2])){
                        newText = Q.textProcessor.replaceText(module[2][i][1]);
                        
                        break;
                    }
                }
                if(newText === undefined) newText = Q.textProcessor.replaceText(module[1]);
            } 
            else {
                //Figure out what the category is
                var category = text[0];
                var prop = text.slice(text.indexOf("@")+1,text.length);
                switch(category){
                    //{@his}, {@hers}, etc... 
                    case "@":
                        newText = GDATA.dataFiles["modules.json"].gender[Q.partyManager.alex.gender][prop];
                        break;
                    //{g@myGlobalVar}
                    case "g":
                        newText = Q.variableProcessor.getVar("Global",prop);
                        break;
                    //{s@mySceneVar}
                    case "s":
                        newText = Q.variableProcessor.getVar("Scene",prop);
                        break;
                    //{e@myEventVar}
                    case "e":
                        newText = Q.variableProcessor.getVar("Event",prop);
                        break;
                    //{o.Alex@baseStats.str}
                    case "o":
                        var name = text.slice(0,text.indexOf("@")).split(".")[1];
                        var officer = Q.partyManager.getAlly(name);
                        newText = Q.textProcessor.getDeepValue(officer,prop);
                        break;
                }
            }
            return newText;
        }
    });
    Q.GameObject.extend("GroupsProcessor",{
        processGroups:function(groups,obj){
            for(var i=0;i<groups.length;i++){
                if(this.processConds(groups[i][0],groups[i][1])){
                    this.processEffects(groups[i][2],obj);
                }
            }
        },
        processConds:function(required,conds){
            var condsEvaluated = [];
            for(var i=0;i<conds.length;i++){
                var func = conds[i][0];
                var props = conds[i][1];
                switch(func){
                    case "checkVar":
                        var scope = props[0];
                        var vr = Q.variableProcessor.getVar(scope,props[1]);
                        var op = props[2];
                        var vl = Q.textProcessor.replaceText(props[3]);
                        condsEvaluated.push(Q.textProcessor.evaluateStringConditional(vr,op,vl));
                        break;
                    case "checkCharProp":
                        var character = Q.partyManager.getAlly(props[0]);
                        var propName = Q.partyManager.convertPropName(props[1]);
                        var oper = props[2];
                        var propValue = props[3];
                        if(propName === "loyalty" || propName === "morale"){
                            //Compare numbers for >= and <=; Compare string for == and !=;
                            if(oper === "==" || oper === "!="){
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(Q.partyManager.convertPresetString(character,propName),oper,propValue));
                            } else {
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(character[propName],oper,Q.partyManager.convertPresetString(oper,propName,propValue)));
                            }
                        } else {
                            condsEvaluated.push(Q.textProcessor.evaluateStringConditional(character[propName],oper,propValue));
                        }
                        break;
                    case "checkCharPersonality":
                        var character = Q.partyManager.getAlly(props[0]);
                        var much = props[1];
                        var personality = props[2];
                        var possession = props[3];
                        var has = Q.partyManager.hasPersonality(character,much,personality);
                        condsEvaluated.push((possession === "Has" && has) || (possession === "Lacks" && !has));
                        break;
                    case "checkCharStat":
                        var character = Q.partyManager.getAlly(props[0]);
                        switch(props[1]){
                            case "Base Stats":
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(character.baseStats[props[2]],props[3],props[4]));
                                break;
                            case "Derived Stats":
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(character.combatStats[props[2]],props[3],props[4]));
                                break;
                        }
                        break;
                    case "checkKeyword":
                        var keyword = props[0];
                        var value = false;
                        switch(keyword){
                            case "partySize":
                                value = Q.partyManager.allies.length;
                                break;
                            case "rosterSize":
                                value = Q.partyManager.roster.length;
                                break;
                        }
                        condsEvaluated.push(Q.textProcessor.evaluateStringConditional(value,props[1],props[2]));
                        break;
                    case "hasItemInBag":
                        var item = Q.partyManager.bag.getItem(props[0],{gear:props[1],material:props[2],quality:props[3]});
                        condsEvaluated.push(item && item.amount >= props[4]);
                        break;
                }
            }
            var evaluation = false;
            switch(required){
                case "All":
                    evaluation = condsEvaluated.every(function(itm){return itm;});
                    break;
                case "Some":
                    evaluation = condsEvaluated.some(function(itm){return itm;});
                    break;
                case "One":
                    evaluation = condsEvaluated.filter(function(itm){return itm;}).length === 1;
                    break;
            }
            return evaluation;
        },
        processEffects:function(effects,obj){
            for(var i=0;i<effects.length;i++){
                var props = effects[i][1];
                switch(effects[i][0]){
                    case "setVar":
                        Q.variableProcessor.setVar(props[0],props[1],props[2],Q.textProcessor.replaceText(props[3]),Q.state.get("currentEvent").scene,Q.state.get("currentEvent").event);
                        
                        break;
                    case "changePage":
                        obj.changePage(props[0]);
                        break;
                    case "changeEvent":
                        Q.clearStage(0);
                        obj.finishEvent();
                        Q.startScene(props[0],props[1],props[2]);
                        break;
                    case "enableChoice":
                        var target = obj.currentPage.options || obj.currentPage.choices;
                        target.find(function(choice){return props[0] === choice[0];})[1] = false;
                        break;
                    case "disableChoice":
                        var target = obj.currentPage.options || obj.currentPage.choices;
                        target.find(function(choice){return props[0] === choice[0];})[1] = true;
                        break;
                    //Flavour only. Sends back to event that happened before triggering the flavour event.
                    case "goToAnchorEvent":
                        
                        break;
                    case "recruitChar":
                        //Adds the character to the party
                        break;
                    case "changeInfluence":
                        Q.partyManager.influence[props[0]] = Q.variableProcessor.evaluateStringOperator(Q.partyManager.influence[props[0]],props[1],Q.textProcessor.replaceText(props[2]),0,100);
                        console.log(props,Q.partyManager.influence)
                        break;
                    case "changeRelation":
                        Q.partyManager.relations[props[0]][props[1]] = Q.variableProcessor.evaluateStringOperator(Q.partyManager.relations[props[0]][props[1]],props[2],Q.textProcessor.replaceText(props[3]),0,100);
                        console.log(props,Q.partyManager.relations)
                        break;
                    case "tempStatChange":
                        var character;
                        if(props[0]==="Current"){
                            character = Q.state.get("currentEvent").character;
                        } else {
                            character = Q.partyManager.allies.find(function(ally){return ally.name === props[0];});
                        }
                        character.tempStatChanges.push([props[1],props[2],props[3],props[4]]);
                        character.baseStats[props[1]] = Q.variableProcessor.evaluateStringOperator(character.baseStats[props[1]],props[2],props[3]);
                        console.log(character.name,props,character.baseStats)
                        break;
                    case "obtainItem":
                        Q.partyManager.bag.addItem(props[0],{gear:props[1],material:props[2],quality:props[3],amount:props[4]});
                        break;
                    case "useItem":
                        Q.partyManager.bag.decreaseItem(props[0],{gear:props[1],material:props[2],quality:props[3],amount:props[4]});
                        break;
                }
            }
        },
        processImpact:function(groups,obj){
            for(var i=0;i<groups.length;i++){
                var characters = this.processImpactConds(groups[i][0],groups[i][1]);
                if(characters.length){
                    this.processImpactEffects(groups[i][2],characters);
                }
            }
        },
        //Gets all relevant characters
        processImpactConds:function(required,conds){
            var charactersAffected = [];
            var allies = Q.partyManager.allies;
            if(!conds) return allies;
            function checkAlly(ally,required,conds){
                var condsEvaluated = [];
                for(var i=0;i<conds.length;i++){
                    var check = conds[i][0];
                    var props = conds[i][1];
                    switch(check){
                        case "Gender":
                        case "Methodology":
                        case "Value":
                        case "Character Group":
                        case "Character Class":
                        case "Nationality":
                            var prop = Q.partyManager.convertPropName(check);
                            condsEvaluated.push(Q.textProcessor.evaluateStringConditional(ally[prop],check[0],check[1]));
                            break;
                        case "Morale":
                        case "Loyalty":
                            var prop = Q.partyManager.convertPropName(check);
                            //Compare numbers for >= and <=; Compare string for == and !=;
                            if(check[0] === "==" || check[0] === "!="){
                                    condsEvaluated.push(Q.textProcessor.evaluateStringConditional(Q.partyManager.convertPresetString(ally,prop),check[0],check[1]));
                            } else {
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(ally[prop],check[0],check[1]));
                            }
                            break;
                        case "Name":
                            if(props[1] === "Officers"){
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(ally.officer,props[0],true));
                            } else if(props[1] === "Current"){
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(Q.state.get("currentEvent").character,props[0],ally));
                            } else {
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(ally.name,props[0],props[1]));
                            }
                            break;
                        case "Personality":
                            var much = props[0];
                            var personality = props[1];
                            var possession = props[2];
                            var has = Q.partyManager.hasPersonality(ally,much,personality);
                            condsEvaluated.push((possession === "Has" && has) || (possession === "Lacks" && !has));
                            break;
                    }
                }
                var evaluation = false;
                switch(required){
                    case "All":
                        evaluation = condsEvaluated.every(function(itm){return itm;});
                        break;
                    case "Some":
                        evaluation = condsEvaluated.some(function(itm){return itm;});
                        break;
                    case "One":
                        evaluation = condsEvaluated.filter(function(itm){return itm;}).length === 1;
                        break;
                }
                return evaluation;
            }
            
            allies.forEach(function(ally){
                if(checkAlly(ally,required,conds)) charactersAffected.push(ally);
            });
            return charactersAffected;
        },
        processImpactEffects:function(effects,characters){
            for(var i=0;i<characters.length;i++){
                var char = characters[i];
                for(var j=0;j<effects.length;j++){
                    var name = effects[j][0];
                    var props = effects[j][1];
                    switch(name){
                        case "Loyalty":
                            char.loyalty = Q.variableProcessor.evaluateStringOperator(char.loyalty,props[0],props[1],0,100);
                            console.log(char.name,"Loyalty",char.loyalty)
                            break;
                        case "Morale":
                            char.morale = Q.variableProcessor.evaluateStringOperator(char.morale,props[0],props[1],0,100);
                            console.log(char.name,"Morale",char.morale)
                            break;
                        case "Stat":
                            Q.partyManager.adjustTempStatChange(char,[props[0],props[1],props[2],props[3]]);
                            console.log(char.name,props,char.baseStats)
                            break;
                    }
                }
            }
        }
    });

    Q.GameObject.extend("StoryController",{
        //When a story event starts, set data and show the container.
        startEvent:function(data){
            //Elements used for displaying text
            $("#main-container").append('<div id="text-content" class="fancy-border"></div>');
            $("#text-content").append('<div id="text-content-story"></div>');
            this.data = data;
            
            this.displayPage(data.pages[0].name);
        },
        
        getPageData:function(name){
            return this.data.pages.filter(function(page){return page.name === name; })[0];
        },
        displayPage:function(name){
            this.currentPage = this.getPageData(name);
            var url = 'images/bg/'+this.currentPage.bg;
            $("#background-container").css('background-image', "url('"+url+"')");
            Q.groupsProcessor.processGroups(this.currentPage.onload,this);
            //If there was a changePage in the onload, don't load the default.
            if(!$(".page").length) $("#text-content-story").append(this.newPage(this.currentPage));
            
            var listIdx = $(".options-list-row").index($(".menu-option").first().parent());
            Q.menuBuilder.MenuControls.selectSelectedIdx([0,listIdx,0]);
            Q.menuBuilder.MenuControls.setFocus();
            $(Q.menuBuilder.MenuControls.getSelected()).addClass("menu-option-selected");
        },
        changePage:function(name){
            $("#text-content-story").children(".page").first().remove();
            this.displayPage(name);
        },
        newPage:function(data){
            var cont = $("<div class='page'></div>");
            $(cont).append(this.getPageWallOfText(data.text));
            $(cont).append(this.getPageChoices(data.choices));
            return cont;
        },
        getPageWallOfText:function(text){
            return $("<div class='page-text'>"+Q.textProcessor.makeParagraphs(text)+"</div>");
        },
        getChoice:function(name){
            return this.currentPage.choices.find(function(choice){return choice[0] === name;});
        },
        selectChoice:function(choice){
            var data = Q.storyController.getChoice(choice);
            Q.groupsProcessor.processEffects(data[2],Q.storyController);
            Q.groupsProcessor.processImpact(data[3],Q.storyController);
        },
        getPageChoices:function(choices){
            var cont = Q.menuBuilder.optionsList({
                listClass:"w-xl flex-v",
                rowClass:"w-xl",
                textClass:"",
                items:choices.map(function(choice){
                    return [{
                        text: choice[0],
                        disabled: choice[1],
                        confirm:{func:function(){Q.storyController.selectChoice(choice[0]);}}
                    }];
                })
            });
            return cont;
        },
        changeEvent:function(props){
            this.finishScene();
            Q.startScene(props[0],props[1],props[2]);
        },
        finishEvent:function(){
            $("#text-content").remove();
        }
    });
    
    Q.GameObject.extend("CharacterStatsMenu",{
        createMenu:function(){
            $("#main-container").append("<div id='character-stats-display-cont' class='big-box'></div>");
            $("#character-stats-display-cont").append(
                    "<div class='char-stats-cont-main inner-box'></div>\n\
                    <div class='char-stats-cont-second inner-box'></div>"
            );
            $("#main-container").append("<div id='status-characters-options' class='big-box'></div>");
        },
        setUpBaseStatsPolygon:function(baseStats){
            var trimmedStatNames = CharacterGenerator.trimmedBaseStats;
            var statNames = CharacterGenerator.statNames;
            var parent = $("#character-stats-display-cont").children(".char-stats-cont-second").children(".char-cont-base-stats");
            
            var bg = $("#character-stats-display-cont").children(".char-stats-cont-second").children(".char-cont-base-stats").children(".char-cont-polygon-cont").children(".base-stats-polygon-background");
            bg.width(parent.width()/2);
            bg.height(bg.width());
            var fg = $("#character-stats-display-cont").children(".char-stats-cont-second").children(".char-cont-base-stats").children(".char-cont-polygon-cont").children(".base-stats-polygon-foreground");
            fg.width(parent.width()/2);
            fg.height(fg.width());
            var numPoints = statNames.length;
            //50 as in 50%
            var radius = 50;
            var xCenter = radius;
            var yCenter = radius;
            var bgPointsString = "";
            var fgPointsString = "";
            for(var i=0;i<numPoints;i++){
                var statRatio = baseStats[trimmedStatNames[i]]/100;
                var bgX = xCenter + radius * Math.sin(i * 2 * Math.PI / numPoints);
                var bgY = yCenter - radius * Math.cos(i * 2 * Math.PI / numPoints);
                var fgX = xCenter + radius * Math.sin(i * 2 * Math.PI / numPoints) * statRatio;
                var fgY = yCenter - radius * Math.cos(i * 2 * Math.PI / numPoints) * statRatio;
                var txX = xCenter + radius * Math.sin(i * 2 * Math.PI / numPoints) * 2;
                var txY = yCenter - radius * Math.cos(i * 2 * Math.PI / numPoints) * 2;
                if(i === numPoints - 1){
                    bgPointsString += bgX+"% "+bgY+"%";
                    fgPointsString += fgX+"% "+fgY+"%";
                } else {
                    bgPointsString += bgX+"% "+bgY+"%, ";
                    fgPointsString += fgX+"% "+fgY+"%, ";
                }
                var stat = $("<div class='char-cont-polygon-stat'><div>"+statNames[i]+" "+baseStats[trimmedStatNames[i]]+"</div></div>");
                stat.css({"margin-left":txX + 15, "margin-top":txY + 25});
                $("#character-stats-display-cont").children(".char-stats-cont-second").children(".char-cont-base-stats").children(".char-cont-polygon-cont").append(stat);
                
            }
            bg.css('clip-path', "polygon("+bgPointsString+")");
            fg.css('clip-path', "polygon("+fgPointsString+")");
        },
        //Show a character's data
        showCharacterData:function(character){
            //Remove the previous character's data
            $("#character-stats-display-cont").contents().empty();
            $("#character-stats-display-cont").children(".char-stats-cont-main").append(this.mainCharData(character));
            $("#character-stats-display-cont").children(".char-stats-cont-second").append(this.derivedCharData(character));
            this.setUpBaseStatsPolygon(character.combatStats);
            $("#equipable-gear-cont").remove();
        },
        //Show a character's data
        showCharacterCombatData:function(character){
            //Remove the previous character's data
            $("#character-stats-display-cont").contents().empty();
            $("#character-stats-display-cont").children(".char-stats-cont-main").append(this.mainCharData(character));
            $("#character-stats-display-cont").children(".char-stats-cont-second").append(this.combatCharData(character)); 
            $("#equipable-gear-cont").remove();
        },
        //Adds a character for comparing
        addCharacterData:function(){
            
        },
        //Removes a character if viewing more than one
        removeCharacterData:function(){
            
        },
        //Remove this menu (must call createMenu to make it again)
        removeMenu:function(){
            $("#character-stats-display-cont").remove();
        },
        
        mainCharData:function(data){
            function validateEquipment(eq){
                if(!eq || eq === "None") return "<div class='char-prop-medium'><span>-</span></div>";
                return "<div class='char-prop-medium'><span>"+eq.quality+" "+eq.material+" "+eq.name+"</span></div>";
            }
            var imgsrc = "images/sprites/"+data.charClass.toLowerCase()+".png";
            var cont = "<div class='char-cont-name'>\n\
                            <div class='char-prop-large'><span>"+data.name+"</span></div>\n\
                            <div class='char-prop-large'><span>Lv. "+data.level+"</span></div>\n\
                            <div class='char-prop-large'><span>"+data.nationality+" "+data.charClass+"</span></div>\n\
                        </div>\n\
                        <div class='char-cont-sprite'>\n\
                            <img src='"+imgsrc+"'>\n\
                        </div>\n\
                        <div class='char-cont-equipment'>\n\
                            "+validateEquipment(data.equipment[0])+"\n\
                            "+validateEquipment(data.equipment[1])+"\n\
                            "+validateEquipment(data.equipment[2])+"\n\
                            "+validateEquipment(data.equipment[3])+"\n\
                            "+validateEquipment(data.equipment[4])+"\n\
                        </div>";
            return cont;
        },
        derivedCharData:function(data){
            var baseStats = "<div class='char-cont-base-stats'>\n\
                                <div class='char-cont-polygon-spacer'></div>\n\
                                <div class='char-cont-polygon-cont'>\n\
                                    <div class='base-stats-polygon-background'></div>\n\
                                    <div class='base-stats-polygon-foreground'></div>\n\
                                </div>\n\
                                <div class='char-cont-polygon-spacer'></div>\n\
                            </div>";
            return baseStats;
        },
        combatCharData:function(data){
            var cont = $("<div class='char-cont-combat-stats'></div>");
            function stat(a,b){
                return "<div class='char-cont-combat-stat'><div>"+a+"</div><div>"+b+"</div></div>";
            }
            var stats = data.combatStats;
            cont.append(stat("ATK Accuracy",stats.atkAccuracy));
            cont.append(stat("ATK DMG MIN",stats.minAtkDmg));
            cont.append(stat("ATK DMG MAX",stats.maxAtkDmg));
            cont.append(stat("ATK Speed",stats.atkSpeed));
            cont.append(stat("Counter",stats.counterChance));
            cont.append(stat("Critical",stats.critChance));
            cont.append(stat("DMG Reduction",stats.damageReduction));
            cont.append(stat("DFN Ability",stats.defensiveAbility));
            cont.append(stat("Movement",stats.moveSpeed));
            cont.append(stat("Enc. Threshold",stats.encumbranceThreshold));
            cont.append(stat("Total Weight",stats.totalWeight));
            cont.append(stat("Enc. Penalty",stats.encumbrancePenalty));
            return cont;
        },
        displayEquipableGear:function(type){
            $("#equipable-gear-cont").remove();
            var cont = $("<table id='equipable-gear-cont'><thead><tr><th>Name</th></tr></thead><tbody></tbody></table>");
            var character = Q.partyManager.getAlly($("#status-characters-options").children(".selected-option").children("span").text());
            function appendToTable(str){
                cont.children("tbody").append("<tr><td class='equip-gear-item'><div>"+str+"</div></td></tr>");
            }
            if(character.equipment[type]) appendToTable("Unequip");
            var bag = Q.partyManager.bag;
            switch(type){
                case 0:
                case 1:
                    for(var i=0;i<bag.items.Weapons.length;i++){
                        var gear = bag.items.Weapons[i];
                        appendToTable(gear.quality+"_"+gear.material+"_"+gear.name);
                    }
                    for(var i=0;i<bag.items.Shields.length;i++){
                        var gear = bag.items.Shields[i];
                        appendToTable(gear.quality+"_"+gear.material+"_"+gear.name);
                    }
                    break;
                case 2:
                    for(var i=0;i<bag.items.Armour.length;i++){
                        var gear = bag.items.Armour[i];
                        appendToTable(gear.quality+"_"+gear.material+"_"+gear.name);
                    }
                    break;
                case 3:
                    for(var i=0;i<bag.items.Footwear.length;i++){
                        var gear = bag.items.Footwear[i];
                        appendToTable(gear.quality+"_"+gear.material+"_"+gear.name);
                    }
                    break;
                case 4:
                    for(var i=0;i<bag.items.Accessories.length;i++){
                        var gear = bag.items.Accessories[i];
                        appendToTable(gear.name);
                    }
                    break;
            }
            cont.children("tbody").children("tr").children(".equip-gear-item").click(function(){
                Q.characterStatsMenu.validateEquipGear(type,$(this).children("div").text());
            });
            return cont;
        },
        validateEquipGear:function(idx,text){
            var t = text.split("_");
            var character = Q.partyManager.getAlly($("#status-characters-options").children(".selected-option").children("span").text());
            var currentlyEquipped = character.equipment[idx];
            if(t[0] === "Unequip"){
                Q.partyManager.bag.addItem(currentlyEquipped.kind,currentlyEquipped);
                CharacterGenerator.removeEquipment(character,idx);
                character.combatStats = CharacterGenerator.getCombatStats(character);
                $("#character-stats-display-cont").children(".char-stats-cont-second").empty();
                $("#character-stats-display-cont").children(".char-stats-cont-second").append(this.combatCharData(character)); 
                
                $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium:eq("+idx+")").children("span").text("-");
                $("#equipable-gear-cont").remove();
                return;
            }
            var quality = t[0];
            var material = t[1];
            var gear = t[2];
            if(t[3]) gear += " "+t[3];
            var toEquip = CharacterGenerator.equipment.gear[gear];
            //Figure out which eq should go where if it is a weapon/shield
            if(idx === 0 || idx === 1){
                //If it's a shield, always put in secondary hand
                if(toEquip.kind === "Shields"){
                    idx = 1;
                }
                //If it's a weapon, figure out which one does more damage between the toEquip and secondary
                else {
                    var secondary = character.equipment[1];
                    if(toEquip.maxdmg < secondary.maxdmg){
                        //Swap the values
                        [character.equipment[0], character.equipment[1]] = [character.equipment[1], character.equipment[0]];
                        //Change the text
                        $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium:eq("+0+")").children("span").text(character.equipment[0].quality+" "+character.equipment[0].material+" "+character.equipment[0].gear);
                        //We're changing the secondary
                        idx = 1;    
                    } else if(idx === 1){
                        var primary = character.equipment[0];
                        if(primary.maxdmg < toEquip.maxdmg){
                            //Swap the values
                            [character.equipment[0], character.equipment[1]] = [character.equipment[1], character.equipment[0]];
                            $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium:eq("+1+")").children("span").text(character.equipment[1].quality+" "+character.equipment[1].material+" "+character.equipment[1].gear);
                            idx = 0;
                        }
                    } else {
                        idx = 0;
                    }
                    
                }
            }
            var currentlyEquipped = character.equipment[idx];
            if(currentlyEquipped){
                //Remove whatever is equipped and add to the bag
                Q.partyManager.bag.addItem(currentlyEquipped.kind,currentlyEquipped);
            }
            //Remove the item from bag.
            Q.partyManager.bag.removeItem(toEquip.kind,{material:material,gear:gear,quality:quality});
            CharacterGenerator.removeEquipment(character,idx);
            CharacterGenerator.addEquipment(character,idx,CharacterGenerator.convertEquipment([material,gear],quality));
            $("#character-stats-display-cont").children(".char-stats-cont-second").empty();
            $("#character-stats-display-cont").children(".char-stats-cont-second").append(this.combatCharData(character)); 
            
            
            $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium:eq("+idx+")").children("span").text(quality+" "+material+" "+gear);
            $("#equipable-gear-cont").remove();
        }
    });
    
    //All menus created in the editor
    Q.component("locationsMenus",{
        extend:{
            createRecruitMenu:function(){
                $("#main-container").empty();
                Q.characterStatsMenu.createMenu();
                $("#main-container").append("<div id='location-container' class='big-box'><div class='options-list inner-box'></div></div>");
                var optionsList = $("#location-container").children(".options-list");
                var roster = Q.partyManager.roster;
                
                function rosterEmpty(){
                    optionsList.children(".option").first().replaceWith("<div class='option-title'><span>The roster is empty!</span></div>");
                }
                
                //Put each roster character as an option.
                for(var i=0;i<roster.length;i++){
                    $("#status-characters-options").append(this.newOption(roster[i].name));
                    $("#status-characters-options").children(".option").last().click(function(){
                        var char = roster[$(this).index()];
                        $(".selected-option").removeClass("selected-option");
                        $(this).addClass("selected-option");
                        var baseCost = 100;
                        var levelMultiplier = 20;
                        var cost = Math.floor(baseCost + (char.level * levelMultiplier) + CharacterGenerator.getAllGearCost(char.equipment));
                        optionsList.children(".option").first().children("span").text("Recruit "+$(this).text()+" for "+cost+" money?");
                        optionsList.children(".option").first().children("span").attr("cost",cost);
                        Q.characterStatsMenu.showCharacterData(char);
                    });
                }
                optionsList.append(this.newOption("Recruit"));
                optionsList.children(".option").first().click(function(){
                    var idx = $(".selected-option").index();
                    var cost = parseInt($(this).children("span").attr("cost"));
                    var currentMoney = Q.state.get("saveData").money;
                    if(currentMoney < cost){
                        alert("Not enough money!");
                    } else {
                        Q.variableProcessor.changeMoney(-cost);
                        Q.partyManager.addToAllies(roster[idx]);
                        Q.partyManager.removeFromRoster(idx);
                        $(".selected-option").remove();
                        if($("#status-characters-options").children(".option").length){
                            var num = idx > 0 ? idx - 1 : idx;
                            $("#status-characters-options").children(".option:eq("+(num)+")").trigger("click");
                        } else {
                            rosterEmpty();
                        }
                    }
                });
                optionsList.append($(this.newOption("Back")).click(function(){
                    $("#main-container").empty();
                    Q.locationController.setUpCont();
                    Q.locationController.changePage(Q.locationController.currentPage.name);
                }));
                if(roster.length){
                    $("#status-characters-options").children(".option").first().trigger("click");
                } else {
                    rosterEmpty();
                }
            },
            displayBuyItemsList:function(props){
                $("#main-container").empty();
                $("#main-container").append("<div id='location-container' class='big-box'><div class='options-list inner-box'></div></div>");
                var optionsList = $("#location-container").children(".options-list");
                optionsList.append(this.newOption("Buy"));
                optionsList.children(".option:eq(0)").click(function(){
                    var selectedCost = parseInt($(".buy-items-item-selected").children("td:eq(1)").text());
                    var curMoney = Q.state.get("saveData").money;
                    if(selectedCost > curMoney) {
                        alert("You don't have enough money!");
                        return;
                    }
                    var selectedItem = props[0][$(".buy-items-item-selected").index()];
                    Q.partyManager.bag.addItem(selectedItem[0],{gear:selectedItem[1],material:selectedItem[2],quality:selectedItem[3]});
                    Q.variableProcessor.changeMoney(-selectedCost);
                    alert(selectedItem[3]+" "+selectedItem[2]+" "+selectedItem[1]+" was bought for "+selectedCost+" money!");
                });
                optionsList.append(this.newOption("Back"));
                optionsList.children(".option:eq(1)").click(function(){
                    $("#main-container").empty();
                    Q.locationController.setUpCont();
                    Q.locationController.changePage(Q.locationController.currentPage.name);
                });
                
                
                var cont = $("<div id='buy-items-cont' class='big-box'></div>");
                cont.append("<div class='buy-items-title'><span>BUY ITEMS</span></div>");
                var list = $("<table id='buy-items-list'><thead><tr><th>Name</th><th>Cost</th></tr></thead><tbody></tbody></table>");
                cont.append(list);
                for(var i=0;i<props[0].length;i++){
                    var itm = props[0][i];
                    var item = $("<td class='buy-items-item'></td>");
                    switch(itm[0]){
                        case "Consumables":
                        case "Accessories":
                            item.append("<div>"+itm[1]+"</div>");   
                            break;
                        default:
                            item.append("<div>"+itm[3]+" "+itm[2]+" "+itm[1]+"</div>");
                            break;
                    }
                    var itmCost = CharacterGenerator.getGearCost({cost:CharacterGenerator.equipment.gear[itm[1]].cost,material:itm[2],quality:itm[3]});
                    var cost = $("<td class='buy-items-cost'></td>");
                    cost.append("<div>"+itmCost+"</div>");
                    var tr = $("<tr></tr>");
                    tr.append(item);
                    tr.append(cost);
                    tr.click(function(){
                        $(".buy-items-item-selected").removeClass("buy-items-item-selected");
                        $(this).addClass("buy-items-item-selected");
                    });
                    list.children("tbody").append(tr);
                }
                list.children("tbody").children("tr").first().trigger("click");
                $("#main-container").append(cont);
            },
            displaySellItemsList:function(props){
                
            },
            createGatherInfoMenu:function(){
                
            },
            createHuntMenu:function(){
                
            }
        }
    });
    
    Q.GameObject.extend("OptionsController",{
        options:{
            musicEnabled:false,
            musicVolume:0.5,
            soundEnabled:true,
            soundVolume:0.5,
            textSpeed:"Fast",
            autoScroll:true,
            cursorSpeed:"Fast",
            pointerSpeed:"Fast",

            brightness:100,
            damageIndicators:true,
            factionHighlighting:true,

            recallMove:true,

            tooltips:true,
            menuStyleA: "menu-style1",
            menuStyleB: "menu-style2",
            menuStyleC: "menu-style3",
            menuStyleD: "menu-style4",
            menuStyleE: "menu-style5"
        },
        toggleBoolOpt:function(opt){
            if(this.options[opt]) this.options[opt] = false;
            else this.options[opt] = true;
            
            if(opt === "musicEnabled"){
                Q.audioController.checkMusicEnabled();
            }
        },
        adjustSound:function(){
            
        }
    });
    Q.GameObject.extend("JobsController",{
        inProgress:[],
        completedJobs:[],
        noCharsAvailable: false,
        noJobsAvailable: false,
        currentJobs:[],
        addAction:function(chars, type, weeks, job){
            this.inProgress.push({chars:chars, type:type, weeks:weeks, job:job});
            chars.forEach(function(char){char.action = true;});
            var avaliable = Q.partyManager.allies.filter(function(char){return !char.action;});
            if(!avaliable.length) this.noCharsAvailable = true;
        },  
        completeJob:function(data){
            this.noCharsAvailable = false;
            this.noJobsAvailable = false;
            var chars = data.chars;
            var type = data.type;
            for(var i=0; i<chars.length; i++){
                chars[i].action = false;
            }
            switch(type){
                //Any actions that do not give a reward after completed (for actions list reward/barter)
                case "reward":
                case "barter":
                    return;
                default:
                    var job = data.job;
                    var jobsData = Q.state.get("jobsList");
                    var jobData = jobsData.jobs[job.job][job.tier];
                    function rollForLoot(){
                        var num = ~~(Math.random()*100);
                        for(var i=0;i<jobData.loots.length;i++){
                            if(num < jobData.loots[i][1]){
                                return jobData.loots[i];
                            }
                        }
                        return false;
                    }
                    var loot = jobData.earnings.slice(0);
                    var lootsTier = job.lootsTier;
                    var numRolls = jobsData.defaults.lootRolls[lootsTier][0] + ~~(Math.random()*(jobsData.defaults.lootRolls[lootsTier][1] + 1));
                    for(var i=0;i<numRolls;i++){
                        var gotLoot = rollForLoot();
                        if(gotLoot) loot.push(gotLoot[0]);
                    }
                    var processed = [];
                    loot.forEach(function(l){
                        var contains = false;
                        var idx = false;
                        processed.forEach(function(p, i){if(p[0] === l[0] && p[1] === l[1]){contains = p; idx = i;};});
                        if(contains) processed[idx][2] ++;
                        else processed.push([l[0],l[1],1]);
                    });
                    this.completedJobs.push({loot:processed, chars:chars, job:data.job});
                    job.inProgress = false;
                    break;
            }
        },
        progressJobs:function(){
            var jobs = this.inProgress;
            for(var i=0;i<jobs.length;i++){
                var job = jobs[i];
                job.weeks --;
                if(!job.weeks){
                    this.completeJob(job);
                }
            }
        },
        //Get the currently available jobs
        getCurrentJobs:function(){
            var available = Q.partyManager.getRankProp("jobsAvailable");
            var currentWeek = Q.timeController.week;
            var jobs = Q.locationController.data.jobs;
            //The remainder is where we start
            var start = (currentWeek - 1) % jobs.length;
            var jobsRoster = [];
            for(var i = 0, num = start; i < available; i++){
                if(num > jobs.length - 1) num = 0;
                var job = jobs[num];
                jobsRoster.push(job);
                num ++;
            }
            return jobsRoster;
        },
        showCompletedJobsEarnings:function(callback){
            var controller = Q.locationController;
            controller.resetData();
            var MB = Q.menuBuilder;
            if(this.completedJobs.length){
                var comp = this.completedJobs.splice(0,1)[0];
                var bigCont = MB.cont("screen "+Q.optionsController.options.menuStyleA);
                var cont = MB.cont("earnings-container w-xl h-xl "+Q.optionsController.options.menuStyleC);
                bigCont.append(cont);
                var top = MB.cont("w-xl h-s flex-h");
                var iconCont = MB.cont("w-sm h-xl");
                iconCont.append(MB.icon("job-complete-icon","job-complete"));
                var titleCont = MB.cont("w-sm h-xl");
                titleCont.append(MB.text("w-xl h-xl heading-text", comp.job.name+" ("+(comp.job.tier+1)+")"));
                var proceedButtonOptionsCont = MB.cont("w-sm h-xl flex-v options-list");
                var proceedButtonCont = MB.cont("w-sm h-m options-list-row");
                proceedButtonOptionsCont.append(proceedButtonCont);
                var proceed = MB.text("w-xl h-xl menu-option","Proceed");
                proceedButtonCont.append(proceed);
                MB.MBUtility.hoverMenuOption(proceed, "menu-option-selected");
                proceed.on("click",function(){
                    Q.jobsController.showCompletedJobsEarnings(callback);
                });
                top.append(iconCont);
                top.append(titleCont);
                top.append(proceedButtonOptionsCont);
                var bottom = MB.cont("w-xl h-l flex-h");
                
                var completedByCont = MB.cont("w-sm h-ml");
                completedByCont.append(MB.text("w-xl h-s heading-text", "Completed By"));
                for(var i=0;i<comp.chars.length;i++){
                    completedByCont.append(MB.text("w-xl h-s", comp.chars[i].name));
                }
                var earningsCont = MB.cont("w-ml h-l");
                earningsCont.append(MB.text("w-xl h-sx heading-text", "Earnings"));
                var leftCont = MB.cont("w-m h-xl");
                var rightCont = MB.cont("w-m h-xl");
                earningsCont.append(leftCont);
                earningsCont.append(rightCont);
                leftCont.append(MB.text("w-xl h-s", comp.job.reward+"G"));
                //Add money to the bag
                Q.variableProcessor.changeMoney(comp.job.reward);
                var max = 3;
                for(var i=0;i<comp.loot.length;i++){
                    var loot = comp.loot[i];
                    if(i >= max){
                        rightCont.append(MB.text("w-xl h-s", loot[1] + " x" +loot[2]));
                    } else {
                        leftCont.append(MB.text("w-xl h-s", loot[1] + " x" +loot[2]));
                    }
                    //Add the earnings to the bag
                    Q.partyManager.bag.addItem(loot[0], {amount:loot[2], gear:loot[1]});
                }
                bottom.append(completedByCont);
                bottom.append(earningsCont);
                cont.append(top);
                cont.append(bottom);
                $("#main-container").append(bigCont);
                MB.MenuControls.selectSelectedIdx([0,0,0]);
                proceed.trigger("mouseover");
            } else {
                if(callback) callback();
            }
        }
    });
    /*
     *  All missions completed data should be saved in save file.
     *  Missions that have been completed should not show when going back to a location.
     */
    Q.GameObject.extend("MissionsController",{
        currentMissions:[],
        getCurrentMissions:function(){
            //TODO: filter through and check if the mission has been completed before displaying. Check that the mission is not expired as well based on week (or something like that).
            var missions = Q.locationController.data.missions;
            return missions;
        }
    });
    
    
    Q.GameObject.extend("TimeController",{
        week:1,
        reduceWounded:function(char){
            char.wounded--;
            if(!char.wounded){
                char.combatStats.hp = char.combatStats.maxHp;
            }
        },
        checkWeek:function(week){
            
            //TODO: Remake (Maybe story events could just be handled in by checking the week var in the editor created events or something). This wouldn't work for flavour, though.
            //Week should be cycled on returning to location?
            return;
            //Check the story events first as they are the most important.
            //Story events (important ones)
            var storyEvents = Q.state.get("storyEvents");
            if(storyEvents[week]){
                return storyEvents[week];
            }
            //Get the list of all events that could be played
            var potentialEvents = Q.state.get("potentialEvents");
            //Find the event with the highest priority (lowest number)
            var event = potentialEvents.sort(function(a, b){return a.priority - b.priority;})[0];
            if(event){
                event.completed = true;
                event.char.completedEvents.push({idx:event.idx,act:event.act,prop:event.prop});
                //Any potential events that can not recur should be marked as completed
                potentialEvents.forEach(function(ev){
                    if(!ev.recur&&!ev.completed){
                        ev.char.completedEvents.push({idx:ev.idx,act:ev.act,prop:ev.prop});
                    }
                });
                Q.state.set("potentialEvents",[]);
                var eventData = Q.state.get("flavourEvents")[event.act][event.prop][event.idx][2];
                return {event:eventData.event,scene:eventData.scene,type:eventData.type,char:event.char};
            }
            return false;
        },
        cycleWeek:function(callback){
            //All characters that are wounded get reduced by 1
            var allies = Q.partyManager.allies;
            for(var i=0;i<allies.length;i++){
                this.reduceWounded(allies[i]);
            }
            
            Q.jobsController.progressJobs();
            
            //Remove the first roster char and add another char to the bottom.
            Q.partyManager.cycleRoster();
            
            
            //ms, color, startTime, opacityTo, opacityStart, callback
            Q.fadeAnim(3800, "black", 0, 1, 0, function(){
                Q.timeController.week ++;
                Q.jobsController.currentJobs = Q.jobsController.getCurrentJobs();
                $("#hud-week").text(Q.timeController.week);
                Q.fadeAnim(500, "black", 0, 0, 1);
                Q.menuBuilder.MenuControls.disabled = false;
                Q.jobsController.showCompletedJobsEarnings(callback);
            });
            
            //Find the event with the highest priority (lowest number)
            /*var event = potentialEvents.sort(function(a, b){return a[1] - b[1];})[0];
            console.log(event)*/
            
            //This will get flavour events that occur when a certain character meets a set of requirements
            /*var event = this.checkWeek(Q.timeController.week);
            if(event){
                Q.locationController.fullDestroy();
                var curEvent = Q.state.get("currentEvent");
                Q.state.set("anchorEvent",{event:curEvent.event,scene:curEvent.scene,type:curEvent.type});
                Q.startScene(event.type,event.scene,event.event,event.char);
            } else {
                //Start the next scene
                Q.startScene(props.next[0],props.next[1],props.next[2]);
            }*/
        }
    });
    /*
    Q.component("locationActions",{
        extend:{
            doAction:function(p){
                if(!p) return this.createMainMenu();
                this[p[2]](p[3]);
            },
            goBack:function(data){
                //this.changePage({page:this.p.currentPage});
                if(data) this[data.to](data.props);
                
            },
            changePage:function(p){
                this.p.lastPage = this.p.currentPage;
                this.p.currentPage = p.page;
                this.emptyConts();
                if(p.page==="start") return this.createActionsMenu();
                this.displayList(this.p.location[p.page]);
            },
            changeEvent:function(p){
                this.fullDestroy();
                Q.startScene(p[0],p[1],p[2]);
            },
            goToAnchorEvent:function(){
                this.fullDestroy();
                var anchor = Q.state.get("anchorEvent");
                Q.startScene(anchor.type,anchor.scene,anchor.event);
            },
            displayBuyItemsList:function(p){
                this.emptyConts();
                var list = p.list || this.p.list;
                var newList = [];
                list.forEach(function(itm,i){
                    switch(itm[0]){
                        case "Consumables":
                            newList.push([itm[1],"askBuyQuantity",{item:Q.state.get("items")[itm[1]],text:itm[1]}]); 
                            break;
                        case "Accessories":
                            newList.push([itm[1],"askBuyQuantity",{item:Q.state.get("equipment").gear[itm[1]],text:itm[1]}]);
                            break;
                        default:
                            var item = Q.charGen.convertEquipment([itm[3],itm[1]],itm[2]);
                            //Get the cost based on material and quality
                            newList.push([itm[2]+" "+itm[3]+" "+itm[1]+"   "+item.cost,"askBuyQuantity",{item:item,text:itm[2]+" "+itm[3]+" "+itm[1],list:list}]);
                            break;
                    }
                });
                this.displayList({actions:newList.concat([["Back",false,"goBack",["changePage",[this.p.currentPage]]]])});
                this.p.list = list;
            },
            askBuyQuantity:function(p){
                this.emptyConts();
                this.displayQuantityToggle({titleText:"Buy how many "+p.text+"? They cost "+p.item.cost+" each. You have "+Q.state.get("saveData").money+" money.",confirmText:"Confirm Buy",confirmFunc:"askBuy",item:p.item,text:p.text,goBack:{to:"displayBuyItemsList",props:{}}});
            },
            askBuy:function(props){
                this.emptyConts();
                //Check if we have enough money and display the correct text.
                var money = Q.state.get("saveData").money;
                var quantity = parseInt(props.quantity);
                if(money>=quantity*props.p.item.cost){
                    $(".mid-cont").text("Purchase "+quantity+" "+props.p.text+" for "+(quantity*props.p.item.cost)+" money?"+" You have "+money+" money.");
                    this.displayList({actions:[["Purchase",false,"buyItem",[quantity,props.p.item,props.p.text]],["Back",false,"goBack",["askBuyQuantity",[props.p]]]]});
                } else {
                    $(".mid-cont").append("You don't have enough money!");
                    this.displayList({actions:[["Back",false,"goBack",["askBuyQuantity",[props.p]]]]});
                }
            },
            buyItem:function(p){
                this.emptyConts();
                Q.state.get("Bag").addItem(p.item.kind,{amount:p.quantity,gear:p.item.name,material:p.item.material,quality:p.item.quality});
                Q.state.get("saveData").money -= p.quantity*p.item.cost;
                $(".mid-cont").text("You purchased the "+p.text+" for "+(p.quantity*p.item.cost)+" money.");
                this.displayList({actions:[["Back",false,"goBack",["changePage",[this.p.currentPage]]]]});
            },
            displaySellItemsList:function(p){
                this.emptyConts();
                var list = [];
                var bag = Q.state.get("Bag");
                switch(p.allow ? p.allow : "all"){
                    case "all":
                        var keys = Object.keys(bag.items);
                        keys.splice(keys.indexOf("Key"),1);
                        keys.forEach(function(k){
                            list = list.concat(bag.items[k]);
                        });
                        break;
                    case "items":
                        list = bag.items.Consumables;
                        break;
                    case "equipment":
                        list = bag.items.Weapons.concat(bag.items.Shields.concat(bag.items.Armour.concat(bag.items.Footwear.concat(bag.items.Accessories))));
                        break;
                }
                var newList = [];
                list.forEach(function(itm){
                    var text = itm.quality ? itm.quality+" "+itm.material+" "+itm.name : itm.name;
                    newList.push([text,"askSellQuantity",{item:itm,text:text}]);
                });
                this.displayList({actions:newList.concat([["Back",false,"goBack",["changePage",[this.p.currentPage]]]])});
            },
            askSellQuantity:function(p){
                this.emptyConts();
                this.displayQuantityToggle({titleText:"Sell how many "+p.text+" for "+Math.floor(p.item.cost/2)+" each.",confirmText:"Confirm Sell",confirmFunc:"askSell",item:p.item,text:p.text,goBack:{to:"displaySellItemsList",props:{allow:p.allow}}});
            },
            askSell:function(props){
                this.emptyConts();
                var quantity = parseInt(props.quantity);
                $(".mid-cont").text("Sell "+quantity+" "+props.p.text+" for "+Math.floor(quantity*props.p.item.cost/2)+"?");
                this.displayList({actions:[["Sell","sellItems",{quantity:parseInt(quantity),item:props.p.item}],["Back",false,"goBack",["askSellQuantity",[props.p]]]]});
            },
            sellItems:function(p){
                this.emptyConts();
                Q.state.get("Bag").decreaseItem(p.item.kind,{gear:p.item.name,material:p.item.material,quality:p.item.quality},p.quantity);
                Q.state.get("saveData").money += Math.floor(p.item.cost*p.quantity/2);
                this.changePage({page:this.p.currentPage});
            },
            
            checkConds:function(cond){
                var condsMet = true;
                if(cond){
                    for(var i=0;i<cond.length;i++){
                        condsMet = this["condFuncs"][cond[i][0]](cond[i][1]);
                        if(!condsMet) return condsMet;
                    }
                }
                return condsMet;
            },
            executeEffects:function(effects,p){
                for(var i=0;i<effects.length;i++){
                    this["effectFuncs"][effects[i][0]](effects[i][1],p);
                }
            },
            condFuncs:{
                checkVar:function(obj){
                    var varValue;
                    switch(obj[0]){
                        case "Event":
                            varValue = Q.state.get("eventVars")[obj[1]];
                            break;
                        case "Scene":
                            varValue = Q.state.get("sceneVars")[obj[1]];
                            break;
                        case "Global":
                            varValue = Q.state.get("globalVars")[obj[1]];
                            break;
                    }
                    return Q.textModules.evaluateStringOperator(varValue,obj[2],obj[3]);
                },
                checkCharProp:function(obj){
                    var char = Q.state.get("allies").find(function(ally){return ally.name === obj[0];});
                    if(!char) return false;
                    return Q.textModules.evaluateStringOperator(char[obj[1]],obj[2],obj[3]);
                },
                checkCharStat:function(obj){
                    var char = Q.state.get("allies").find(function(ally){return ally.name === obj[0];});
                    if(char){
                        var prop;
                        switch(obj[1]){
                            case "Base Stats":
                                prop = char.baseStats[obj[2]];
                                break;
                            case "Derived Stats":
                                prop = char.combatStats[obj[2]];
                                break;
                        }
                        return Q.textModules.evaluateStringOperator(prop,obj[3],obj[4]);
                    }
                },
                checkKeyword:function(obj){
                    switch(obj[0]){
                        case "partySize":
                            var size = Q.state.get("allies").length;
                            return Q.textModules.evaluateStringOperator(size,obj[1],obj[2]);
                    }
                }
            },
            effectFuncs:{
                setVar:function(obj){
                    Q.textModules.effectFuncs.setVar(obj);
                },
                changePage:function(obj){
                    Q.locationController.changePage(obj[0]);
                },
                changeEvent:function(obj){
                    Q.startScene(obj[0],obj[1],obj[2]);
                },
                addToRoster:function(obj){
                    var char = Q.charGen.generateCharacter(obj,"rosterFromFile");
                    Q.state.get("saveData").applicationsRoster.push(char);
                },
                enableChoice:function(obj,p){
                    for(var i=0;i<p.actions.length;i++){
                        if(p.actions[i][0]===obj[0]){
                            p.actions[i][1] = false;
                        }
                    }
                }
            }
        }
    });
    
    */
    Q.UI.Container.extend("DialogueController",{
        init:function(p){
            this._super(p,{
                x:0,y:Q.height,
                cx:0,cy:0,
                w:Q.width,
                h:200,
                //Which text are we on (array of text)
                textNum:0,
                //Start on the first entry
                groupNum:0,
                scriptNum:0,
                
                //Which character we're on for the text
                textIndex:0,
                
                cantCycle:false,
                noCycle:false,
                autoCycle:false,
                
                //The number of frames between inputs
                inputsTime:15
            });
            this.p.y-=this.p.h;
            this.p.container = $('<div id="dialogue-cont"></div>');
            this.p.leftImage = $('<img id="left-asset"></img>');
            this.p.rightImage = $('<img id="right-asset"></img>');
            this.p.textBox = $('<div id="dialogue-text"></div>');
            this.modDialogueBox("hide");
            $(this.p.container).append(this.p.leftImage);
            $(this.p.container).append(this.p.rightImage);
            $(this.p.container).append(this.p.textBox);
            $(document.body).append(this.p.container);
            $(this.p.leftImage).on("error",function(){$(this).attr("src","images/story/empty.png");});
            $(this.p.rightImage).on("error",function(){$(this).attr("src","images/story/empty.png");});
            
            this.on("step",this,"checkInputs");
            //this.on("activateAutoCycle");
            this.next();
        },
        activateAutoCycle:function(){
            this.off("inputsTimerComplete",this,"activateAutoCycle");
            this.p.scriptNum++;
            this.next();
        },
        cycleText:function(){
            if(!this.p.script[this.p.groupNum]||!this.p.script[this.p.groupNum][this.p.scriptNum]) return;
            if(this.p.textIndex>this.p.script[this.p.groupNum][this.p.scriptNum][1][0][this.p.textNum].length-1){
                this.p.nextTextTri = this.stage.insert(new Q.NextTextTri({x:this.p.x+this.p.w/2,y:this.p.y+this.p.h}));
                this.off("step",this,"cycleText");
                return;
            }
            //Q.playSound("text_stream.mp3");
            $(this.p.textBox).text($(this.p.textBox).text()+this.p.text[this.p.textNum]);
            this.p.textIndex++;
        },
        next:function(){
            //Case that there are no actions (skip to the next event). This should not happen exept for testing as why would you even have an empty battleScene?
            if(!this.p.script.length){
                this.changeEvent(this.p.next[0],this.p.next[1],this.p.next[2]);
                return;
            } 
            if(this.p.scriptNum>=this.p.script[this.p.groupNum].length){
                this.p.groupNum++;
                this.p.scriptNum = 0;
            }
            //If we're finished
            if(!this.p.script[this.p.groupNum]){
                this.changeEvent(this.p.next[0],this.p.next[1],this.p.next[2]);
                return;
            }
            var data = this.p.script[this.p.groupNum][this.p.scriptNum];
            //If it's text
            if(data[0]==="text"){
                this.p.text = this.p.script[this.p.groupNum][this.p.scriptNum][1][2].split("\n\n")
                this.p.textNum = 0;
                this.p.textIndex = 0;
                $(this.p.leftImage).attr("src","images/story/"+data[1][0]);
                $(this.p.rightImage).attr("src","images/story/"+data[1][1]);
                $(this.p.textBox).text("");
                
                if(data[1][4]>0){
                    this.off("step",this,"checkInputs");
                    this.p.inputsTimer = data[1][4];
                    this.on("step",this,"waitForInputsTimer");
                    this.on("inputsTimerComplete",this,"activateAutoCycle");
                } else {
                    this.on("step",this,"cycleText");
                }
                if(data[1][5]) this.p.noCycle = true;
                this.modDialogueBox("show");
            } 
            //If it's a function
            else {
                console.log(data)
                //Do the function
                if(this[data[0]](this,data[1])){return;};
                //Go to the next script entry
                this.p.scriptNum++;
                this.next();
            }
        },
        //Runs the next text in the array of text
        nextText:function(){
            this.p.textNum++;
            //If we're at the end of the text array
            if(this.p.textNum>=this.p.text.length){
                this.p.scriptNum++;
                this.next();
                this.modDialogueBox("hide");
            } else {
                this.p.textIndex = 0;
                $(this.p.textBox).text("");
                this.on("step",this,"cycleText");
                this.modDialogueBox("show");
            }
        },
        waitForInputsTimer:function(){
            this.p.inputsTimer--;
            if(this.p.inputsTimer<=0){
                this.on("step",this,"checkInputs");
                this.off("step",this,"waitForInputsTimer");
                this.trigger("inputsTimerComplete");
            }
        },
        checkInputs:function(){
            if(Q.inputs['confirm']){
                if(!this.p.cantCycle&&!this.p.noCycle){
                    if(this.p.script[this.p.groupNum][this.p.scriptNum][0]!=="text") return;
                    //Check if the text is complete
                    if($(this.p.textBox).text().length===this.p.text[this.p.textNum].length){
                        if(this.p.nextTextTri) this.p.nextTextTri.destroy();
                        this.nextText();
                    } else {
                        $(this.p.textBox).text(this.p.text[this.p.textNum]);
                        this.p.textIndex = this.p.text[this.p.textNum].length;
                    }
                    /*this.p.inputsTimer=this.p.inputsTime;
                    this.off("step",this,"checkInputs");
                    this.on("step",this,"waitForInputsTimer");*/
                    Q.inputs['confirm']=false;
                };
            }
        },
        //SCRIPT FUNCTIONS BELOW
        changeEvent:function(type,scene,event){
            //Remove everything related to this scene
            $(this.p.container).remove();
            Q.startScene(type,scene,event);
            return true;
        },
        //Enable cycling and cycle to the next text
        forceCycle:function(){
            this.p.cantCycle = false;
            this.p.noCycle = false;
            this.p.scriptNum++;
            this.next();
        },
        //Run to stop autocycling
        finishAutoCycle:function(){
            if(!this.p.noCycle){
                this.off("step",this,"autoCycle");
                this.p.cantCycle = false;
                this.p.dialogueText.p.autoCycle = 0;
            }
        },
        //Automatically cycles to the next text after a certain number of frames.
        autoCycle:function(){
            if(this.p.dialogueText.p.autoCycle<=0){
                this.finishAutoCycle();
                this.nextText();
                return;
            }
            this.p.dialogueText.p.autoCycle--;
        },
        getProp:function(prop){
            return this.p[prop];
        },
        //Battle Scene Below
        changeMusic:function(obj,props){
            Q.audioController.playMusic(props[0],function(){obj.forceCycle();});
            return true;
        },
        checkAddCharacter:function(name){
            //For now, just add the character to the party 100% of the time
            Q.state.get("allies").push(Q.state.get("characters")[name]);
        },
        getStoryCharacter:function(handle,id){
            //Gets a story character by their id
            if(Q._isNumber(id)){
                return Q.stage(0).lists.StoryCharacter.filter(function(char){
                    return char.p.handle===handle&&char.p.uniqueId===id;
                })[0];
            } 
            //Gets a story character by a property
            else if(Q._isString(id)){
                return Q.stage(0).lists.StoryCharacter.filter(function(char){
                    return char.p[id];
                })[0];
            }
        },
        getChar:function(str){
            var id = str.split(" ");
            return this.getStoryCharacter(id[0],parseInt(id[1]));
        },
        //Get all characters on a certain team
        getStoryTeamCharacters:function(team){
            return Q.stage(0).lists.StoryCharacter.filter(function(char){
               return char.p.team===team; 
            });
        },
        waitTime:function(obj,props){
            setTimeout(function(){
                obj.forceCycle();
            },props[0]);
            this.p.noCycle = true;
            //Don't cycle until the time is up
            return true;
        },
        //Modifies the dialogue box from a set of options
        modDialogueBox:function(display){
            if(display==="hide"){
                $(this.p.container).css("display","none");
            } else if(display==="show"){
                $(this.p.container).css("display","block");
            }
        },
        showDialogueBox:function(){
            $(this.p.container).css("display","block");
        },
        //Sets the viewport at a location or object
        centerViewLoc:function(obj,props){
            var spr = Q.stage(0).viewSprite;
            spr.p.loc = [props[0],props[1]];
            var speed = props[2];
            if(!speed){
                Q.BatCon.setXY(spr);
            } else {
                var pos = Q.BatCon.getXY(spr.p.loc);
                spr.animateTo(pos,speed/1000,function(){obj.forceCycle();});
            }
            return true;
        },
        //Tweens the viewport to the location
        centerViewChar:function(obj,props){
            this.p.cantCycle = true;
            this.p.noCycle = true;
            
            //Set the viewsprite to the current object that the viewport is following
            var spr = Q.stage(0).viewSprite;
            spr.p.obj = false;
            var to = this.getChar(props[0]);
            if(!props[1]){
                spr.p.loc = to.p.loc;
                Q.BatCon.setXY(spr);
                spr.followObj(to);
                obj.forceCycle();
            } else {
                spr.animateTo(to.p,props[1]/1000,function(){this.followObj(to);obj.forceCycle();});
            }
            return true;
            
        },
        //Changes the direction of a story character
        changeDir:function(obj,props){
            var obj = this.getChar(props[0]);
            obj.playStand(props[1]);
        },
        playAnim:function(obj,props){
            Q.audioController.playSound(props[3]);
            var char = this.getChar(props[0]);
            char.play(props[1]+props[2]);
        },
        changeMoveSpeed:function(obj,props){
            var obj = this.getChar(props[0]);
            obj.p.stepDelay = props[1]/1000;
        },
        playSound:function(obj,props){
            Q.audioController.playSound(props[0]);
            
        },
        //Moves a character along a path
        moveAlong:function(obj,props){
            var obj = this.getChar(props[0]);
            //If the is a function that should be played once the object reaches its destination
            obj.on("doneAutoMove",obj,function(){
                //If we have a new path, do it!
                this.playStand(props[1]);
                //If we're cycling on arrival
                if(props[2]){
                    Q.dialogueController.p.scriptNum++;
                    Q.dialogueController.next();
                }
                //Allow cycling to the next script item
                Q.dialogueController.p.noCycle = false;
            });
            obj.moveAlongPath(props[3]);
            this.p.noCycle = true;
            //If we're waiting on arrival
            return props[2];
        },
        //Fades a character in or out
        fadeChar:function(obj,props){
            var obj = this.getChar(props[0]);
            var speed = props[2]/1000;
            if(props[1]==="in"){
                obj.animate({opacity:1},speed,Q.Easing.Linear);
                obj.show();
            } else if(props[1]==="out"){
                obj.animate({opacity:0},speed,Q.Easing.Linear);
            }
        },
        /*
        setCharacterAs:function(setTo,amount,prop,team,filter){
            var objs = this.getStoryTeamCharacters(team);
            var obj = this[filter][amount](objs,prop);
            obj.p[setTo] = true;
        },
        propertyFilter:{
            lowest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p[prop]>b.p[prop];
                })[0];
            },
            highest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p[prop]<b.p[prop];
                })[0];
            }
        },
        awardFilter:{
            lowest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p.awards[prop]>b.p.awards[prop];
                })[0];
            },
            highest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p.awards[prop]<b.p.awards[prop];
                })[0];
            }
        }*/
    });
    //The person who is talking in the story
    Q.Sprite.extend("StoryImage",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                w:200,
                h:300,
                type:Q.SPRITE_NONE
            });
        }
    });
    Q.Sprite.extend("NextTextTri",{
        init: function(p) {
            this._super(p, {
                w:Q.tileW,h:Q.tileH,
                type:Q.SPRITE_NONE,
                blinkNum:0,
                blinkTime:15
            });
            //Triangle points
            this.p.p1=[-this.p.w/2,-this.p.h/2];
            this.p.p2=[0,0];
            this.p.p3=[this.p.w/2,-this.p.h/2];
            this.p.z = 100000;
            this.on("step","trackBlink");
        },
        trackBlink:function(){
            if(this.p.blinkNum<=0){
                this.blink();
                this.p.blinkNum = this.p.blinkTime;
            }
            this.p.blinkNum--;
        },
        blink:function(){
            if(this.p.opacity) this.p.opacity = 0;
            else this.p.opacity = 1;
        },
        draw:function(ctx){
            ctx.beginPath();
            ctx.lineWidth="6";
            ctx.fillStyle="red";
            ctx.moveTo(this.p.p1[0],this.p.p1[1]);
            ctx.lineTo(this.p.p2[0],this.p.p2[1]);
            ctx.lineTo(this.p.p3[0],this.p.p3[1]);
            ctx.closePath();
            ctx.fill();
        }
    });
    //The invisible sprite that follows characters
    Q.Sprite.extend("ViewSprite",{
        init:function(p){
            this._super(p,{
                w:Q.tileW,
                h:Q.tileH,
                type:Q.SPRITE_NONE,
                x:0,
                y:0
            });
            this.add("animation, tween");
        },
        animateTo:function(to,speed,callback){
            if(this.p.obj){
                this.p.obj = false;
                this.off("step","follow");
            }
            if(!speed){
                this.p.x = to.x;
                this.p.y = to.y;
                if(callback){
                    callback();
                }
            } else {
                this.animate({x:to.x,y:to.y},speed,Q.Easing.Quadratic.InOut,{callback:callback || function(){} });
            }
        },
        followObj:function(obj){
            this.p.obj = obj;
            this.on("step","follow");
        },
        follow:function(){
            var obj = this.p.obj;
            if(obj){
                this.p.x = obj.p.x;
                this.p.y = obj.p.y;
            } else {
                this.off("step","follow");
            }
        }
    });
    Q.UI.Container.extend("PlacementSquare",{
        init:function(p){
            this._super(p,{
                w:32,h:32,fill:"blue"
            });
            this.p.z = this.p.y;
        }
    });
};

