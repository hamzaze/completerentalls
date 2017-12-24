Template7.registerHelper('stringify', function (context){
    var str = JSON.stringify(context);
    // Need to replace any single quotes in the data with the HTML char to avoid string being cut short
    return str.split("'").join('&#39;');
});

Template7.registerHelper('if_compare', function (a, operator, b, options) {
    var match = false;
    if (
        (operator === '==' && a == b) ||
        (operator === '===' && a === b) ||
        (operator === '!=' && a != b) ||
        (operator === '>' && a > b) ||
        (operator === '<' && a < b) ||
        (operator === '>=' && a >= b) ||
        (operator === '<=' && a <= b)
        ) {
        match = true;
    }
    if (match) return options.fn(this);
    else return options.inverse(this);
});

// Initialize your app
var myApp = new Framework7({
    precompileTemplates: true,
    template7Pages: true, // need to set this
    cache: false,
    fastClicks: false
});
 
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
 
// Add view
var mainView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  dynamicNavbar: true
});

var leftView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  dynamicNavbar: true
});

var isAjaxLoaded=false;
var pathToAjaxDispatcher="http://www.completerentalls.ca/beta/php/ajaxDispatcher1.php";
var ajaxLoader="<div class='ajaxLoader left50 top50 abs'><div class='fineloader'></div></div>";
var ajaxLoaderWithBackground="<div class='overlayWhite'>" + ajaxLoader + "</div>";
var isCordovaApp = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

var reloadProductsEvery=3000;
var productsLoadInterval;

if(!checkCookie("hhCompleteRentalsLoadedApp")){
    
    mainView.router.load({
        template: Template7.templates.homePageTemplate,
        animatePages: false,
        reload: false
    });
    
    var postData={context: "wrapWelcomeTemplate"};
    callAjaxOnFly(postData);
}else{
    if(localStorage.getItem('welcomeTemplate')===null){
        
        
    }else{
        var data=JSON.parse(localStorage.getItem('welcomeTemplate'));
        mainView.router.load({
            template: Template7.templates.welcomeTemplate,
            animatePages: false,
            reload: false,
            context: data
        });
    }
}

function displayAlert(a, b){
    var e=arguments[2]?arguments[2]:null;
    
    var _delay=1000;
    
    var c="<div class='closeOverlay abs right0'><a class='relative' href=''>x</a></div><div class='errContent relative'>" + a + "</div>";
    var d=$$("<div class='errMessage1 animated abs' />"); 
    
    if($$("body > div.errMessage1").length>0){
        $$("body > div.errMessage1").remove();
    }
    
    b.prepend(d);
    d.html(c);
    
    window.setTimeout(function(){
        var currentBoxHeight=parseInt($$("body > div.errMessage1").outerHeight());
        $$("body > div.errMessage1").css({
              top: -1*currentBoxHeight +"px",
              opacity: 1
        });
        window.setTimeout(function(){
            $$("body > div.errMessage1").addClass("activated").css({
                top: 0
            });
            
            window.setTimeout(function(){
                d.addClass("fadeOut");
                window.setTimeout(function(){
                    d.remove();
                }, 600);
            }, _delay*5);
            
        }, 100);
    }, 100);
    
    $$(document).on("mouseup", function(){
        d.addClass("fadeOut");
        window.setTimeout(function(){
            d.remove();
        }, 600);
    });
    
}

function displayInfo(a, b){
    var e=arguments[2]?arguments[2]:null;
    
    var _delay=1000;
    
    var c="<div class='closeOverlay abs right0'><a class='relative' href=''>x</a></div><div class='successContent relative'>" + a + "</div>";
    var d=$$("<div class='successMessage1 animated abs' />"); 
    
    if($$("body > div.successMessage1").length>0){
        $$("body > div.successMessage1").remove();
    }
    
    b.prepend(d);
    d.html(c);
    
    window.setTimeout(function(){
        var currentBoxHeight=parseInt($$("body > div.successMessage1").outerHeight());
        $$("body > div.successMessage1").css({
              top: -1*currentBoxHeight +"px",
              opacity: 1
        });
        window.setTimeout(function(){
            $$("body > div.successMessage1").addClass("activated").css({
                top: 0
            });
            
            window.setTimeout(function(){
                d.addClass("fadeOut");
                window.setTimeout(function(){
                    d.remove();
                }, 600);
            }, _delay*5);
            
        }, 100);
    }, 100);
    
    $$(document).on("mouseup", function(){
        d.addClass("fadeOut");
        window.setTimeout(function(){
            d.remove();
        }, 600);
    });
}

$$(document).on("click", "#wrapCatMenuAll a.actaslink", function(e){
    window.setTimeout(function(){
        $$("div.page[data-page='index']").removeClass("catmenuactivated");
    }, 400);
    
});

$$(document).on("click", "a[data-action='togglecatmenu']", function(e){
    e.preventDefault();
    var $this=$$(this);
    $$("div.page.page-on-center").toggleClass("catmenuactivated");
});

$$(document).on("click", "a[data-action='togglesubmenu']", function(e){
    e.preventDefault();
    var $this=$$(this);
    console.log("clicked on " + $this);
    $this.closest("li.relative").toggleClass("activated");
});

// In page callbacks:
myApp.onPageInit('products', function (page) {
    var category=0;
    var id=0;
    if(page.context.category){
        id=0;
        category=page.context.category;
    }else if(page.context.SubCategoryID){
        id=page.context.SubCategoryID;
        category=0;
    }
    autoLoadCurrentProducts(id, true, category);
    
});

function callAjaxOnFly(postData){
    $$.ajax({
        type: "POST",
        url: pathToAjaxDispatcher,
        data: postData,
        dataType: "json",
        success: function(data){
            isAjaxLoaded=false;
            if(data["success"]==1){
                switch(postData["context"]){
                    case "wrapWelcomeTemplate":
                        localStorage.setItem('welcomeTemplate', JSON.stringify(data));
                        var data=JSON.parse(localStorage.getItem('welcomeTemplate'));
                        var currentPage=mainView.activePage.name;
                        
                        mainView.router.load({
                            template: Template7.templates.homePageTemplate,
                            animatePages: false,
                            reload: false,
                            context: data
                        });
                        
                    break;
                }
            }else{
                displayAlert(data["message"], $$("body"));
            }
        }
    });
}

function autoLoadCurrentProducts(id, isAjaxLoader, category){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    if(isAjaxLoader){
        displayActionLoader();
    }
    var postData={id: id, category: category, context: "loadCurrentProducts"};
    
    $$.ajax({
       type: "POST",
       url: pathToAjaxDispatcher,
       data: postData,
       dataType: "json",
       success: function(data){
           isAjaxLoaded=false;
           if(isAjaxLoader){
                removeActionLoader();
            }
            if(data["success"]==1){
                localStorage.setItem('listProductsTemplate', JSON.stringify(data));
                var data=JSON.parse(localStorage.getItem('listProductsTemplate'));
                var currentPage=mainView.activePage.name;
                
                var listProductsTemplate=$$("script#listProductsTemplate").html();
                var compiledTemplate = Template7.compile(listProductsTemplate);
                var html=compiledTemplate(data);
                $$("#wrapAllProducts").html(html);
                
                loadProductPhotos(id, category);
            }
            return false;
       }, error: function(){
           if(isAjaxLoader){
                removeActionLoader();
            }
           isAjaxLoaded=false;
       }
    });
}

function loadProductPhotos(id, category){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    var postData={id: id, category: category, context: "loadProductPhotos"};
    
    
    $$.ajax({
       type: "POST",
       url: pathToAjaxDispatcher,
       data: postData,
       dataType: "json",
       success: function(data){
           isAjaxLoaded=false;
               if(data["success"]==1){
                   var reImage=/"image":"(.+|\s?)"/;
                   if(data["results"]){
                        $$.each(data["results"], function (index, value) {
                            var newImage="<div class='bg-image' style='background-image: url(" + value +");' />";
                            
                            $$("#wrapAllProducts a.loadContext[data-id='"+index+"'] div.image-holder > div.bg-image-outer").html(newImage);
                            $$("#wrapAllProducts a.loadContext[data-id='"+index+"'] div.image-holder").addClass("completed");
                        });
                    }
               }else{
                   displayAlert(data["message"], $$("body"));
               }
            return false;
       }, error: function(){
           isAjaxLoaded=false;
       }
    });
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie(cname) {
    var username = getCookie(cname);
    if (username != "") {
        return true;
    } else {
        return false;
    }
}

function displayActionLoader(){
    //Display some site effects to indicate user has clicked on something and just waiting for a response
    if($$("body > div.overlayWhite").length<1){
        $$("body").prepend(ajaxLoaderWithBackground);
    }
}

function removeActionLoader(){
    $$("body > div.overlayWhite").addClass("passive");
    window.setTimeout(function(){
        $$("body > div.overlayWhite").remove();
    }, 800);
}