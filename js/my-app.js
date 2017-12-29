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
  dynamicNavbar: false
});

// Init slider and store its instance in mySwiper variable
  var mySwiper = myApp.swiper('.swiper-container', {
    pagination:'.swiper-pagination'
  });

var isAjaxLoaded=false;
var pathToAjaxDispatcher="http://www.completerentalls.ca/beta/php/ajaxDispatcher1.php";
var ajaxLoader="<div class='ajaxLoader left50 top50 abs'><div class='fineloader'></div></div>";
var ajaxLoaderWithBackground="<div class='overlayWhite'>" + ajaxLoader + "</div>";
var isCordovaApp = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

var reloadProductsEvery=3000;
var productsLoadInterval;

var reQty=/^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-4][0-9][0-9]|5000)$/;

var reSearch=/^(.+)$/;

//Check is user already logged in
if(checkCookie("activeAutologinOn")){
    $$("body").addClass("logged-in");
}else{
    $$("body").removeClass("logged-in");
}

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

var DP = (typeof DP === "object") ? DP : {};

$$.fn.checkFields = function(){
    var formName=$$(this).attr("id");
    var $this=$$(this);
    switch(formName){
        default:    
        var vl = new DP.validateForm();
        vl.valSetting = {fields : [
                {id : "context", val : "", msg : "What is this form for?", type : ""}
                ]
        };	  
        return vl.runCheck(formName);
        break;
        
        case "frmLoginFEUser":    
            var vl = new DP.validateForm();
            vl.valSetting = {fields : [
                    {id : "aEOE_email", val : "", msg : "Type a valid email address", type : "email"}
                    ]
            };	  
            return vl.runCheck(formName);
        break;
        
        case "frmSendCustomQuote":    
            var vl = new DP.validateForm();
            vl.valSetting = {fields : [
                    {id : "aEOE_name", val : "", msg : "Full Name", type : ""},
                    {id : "aEOE_email", val : "", msg : "Email", type : "email"},
                    {id : "aEOE_phonenumber", val : "", msg : "Phone Number", type : ""},
                    {id : "aEOE_address1", val : "", msg : "Street Address", type : ""},
                    {id : "aEOE_city1", val : "", msg : "City", type : ""},
                    {id : "aEOE_postalcode1", val : "", msg : "Postal Code", type : ""},
                    {id : "aEOE_isrented", val : "", msg : "Have you rented from Complete Rent-alls before?", type : "checked"},
                    
                    {id : "aEOE_howhearabout", val : 0, msg : "How did you hear aboutComplete Rent-alls?", type : "number"}
                    ]
            };
            if($$("input[name='aEOE_dtype']:checked").val()==2){
                vl.valSetting.fields.push(
                   {id : "aEOE_ddate", val : "", msg : "Delivery Date", type : ""});
                vl.valSetting.fields.push(
                   {id : "aEOE_city", val : "", msg : "City", type : ""});
            }
            return vl.runCheck(formName);
        break;
    }
};

DP.validateForm = function(){
    //generic check value method
    var formValidated = function(whatForm){	
        if(typeof(whatForm)!="undefined"){
                isfrmAddEditUserSubmit=true;
                 whatForm.submit();	
                 return true;
        }
    };
	
    var fromReset = function(elmId, wrongValue, messageText){
        //reset
        $$(".from_wrp input").css({"border":"1px solid #ACA69F"});
        $$(".from_wrp select").css({"border":"1px solid #ACA69F"});
        $$("#error_messages").empty("");
    }

    //generic check value method
    var valueCheck = function(elmId, wrongValue, messageText){
        if($$("[name='" + elmId + "']").val() == wrongValue){
            createAlert(elmId, messageText);
			return false;
		}
			removeAlert(elmId);
			return true;
    };
    
    //alert method
    var createAlert = function(elmId, messageText){
		elmId.addClass("missingField");
        stringAlert +="<p>" + messageText + "</p>";
    };
    var removeAlert = function(elmId){
            elmId.removeClass("missingField");
    };

    //zip validation
    var isZip = function(s){
        var reZip = new RegExp(/(^\d{5}$)|(^\d{5}-\d{4}$)/);
        if (!reZip.test(s)) {
            return false;
        }
        return true;
    };
    
    //checks if value is integer
    var isInt = function(n){
        var reInt = new RegExp(/^\d+$/);
        if (!reInt.test(n)) {
            return false;
        }
        return true;
    };
    
    //checks if value is pin
    var isPin = function(n){
        var rePin = new RegExp(/^\w{4,8}$/);
        if (!rePin.test(n)) {
            return false;
        }
        return true;
    };
    
    //checks if value is pin2
    var isPin2 = function(n){
        var rePin2 = new RegExp(/^\w{8,24}$/);
        if (!rePin2.test(n)) {
            return false;
        }
        return true;
    };
	//checks if value is integer
    var isPrice = function(n){
        var rePrice = new RegExp(/^\d+($|\,\d{3}($|\.\d{1,2}$)|\.\d{1,2}$)/);
        if (!rePrice.test(n)) {
            return false;
        }
        return true;
    };
	
	//mail validation
    var isMail = function(s, elmId){
        var reMail = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        if (!reMail.test(s)) {
            return false;
        }		
        return true;
    };
    
    	//checks if value is password
    var isPassword = function(n){
        var rePassword = new RegExp(/^[\w!!?]{6,18}$/);
        if (!rePassword.test(n)) {
            return false;
        }
        return true;
    };
    
    
    //public method checks fieds
    //requires 'valSetting' setting object
	
    this.runCheck = function(whatForm){
        //reseet form		
        //run checks
		var countTrueFilled=0;
		
		stringAlert="";
        for (i=0;i<this.valSetting.fields.length;i++){
			var fName=this.valSetting.fields[i].id;
			var fVal=this.valSetting.fields[i].val;
			var fieldName=$$("#"+whatForm+" [name='" + this.valSetting.fields[i].id + "']");
                        var fMessage=this.valSetting.fields[i].msg==""?fieldName.closest("div").find("label").text():this.valSetting.fields[i].msg;
            
            if(this.valSetting.fields[i].type == "zip"){
                //zip check
                if(isZip(fieldName.val()) == false){    
                    createAlert(fieldName, this.valSetting.fields[i].msg);
                }
				else{
					removeAlert(fieldName);
					countTrueFilled++;
				}
            }
            else if (this.valSetting.fields[i].type == "number"){
                //checks for number
                if(isInt(fieldName.val()) == false || fieldName.val()==fVal){    
                    createAlert(fieldName, fMessage);
                }
				else{
					removeAlert(fieldName);
					countTrueFilled++;
				}
            }
			else if (this.valSetting.fields[i].type == "price"){
                //checks for number
                if(isPrice(fieldName.val()) == false){    
                    createAlert(fieldName, fMessage);
                }
				else{
					removeAlert(fieldName);
					countTrueFilled++;
				}
            }else if (this.valSetting.fields[i].type == "pin"){
                //checks for number
                if(isPin(fieldName.val()) == false){    
                    createAlert(fieldName, fMessage);
                }
				else{
					removeAlert(fieldName);
					countTrueFilled++;
				}
            }else if (this.valSetting.fields[i].type == "checked"){
                //checks for number
                if($$("#"+whatForm+" [name='" + this.valSetting.fields[i].id + "']:checked").length<1){    
                    createAlert(fieldName, fMessage);
                }
				else{
					removeAlert(fieldName);
					countTrueFilled++;
				}
            }else if (this.valSetting.fields[i].type == "pin2"){
                //checks for number
                if(isPin2(fieldName.val()) == false){    
                    createAlert(fieldName, fMessage);
                }
				else{
					removeAlert(fieldName);
					countTrueFilled++;
				}
            }else if (this.valSetting.fields[i].type == "password"){
                //checks for number
                if(isPassword(fieldName.val(), fName) === false){ 
                    createAlert(fieldName, fMessage);
                }
				else{
                                    if(fName=='aEOE_passwordagain'){
                                        if(fieldName.val()!=$$("#"+whatForm+ " [name='aEOE_password']").val()) createAlert(fieldName, "Passwords must match.");
                                        else{
                                           removeAlert(fieldName);
                                            countTrueFilled++; 
                                        }
                                    }else{
                                        removeAlert(fieldName);
                                        countTrueFilled++;
                                    }
					
				}
            }
			else if (this.valSetting.fields[i].type == "email"){
                //checks for number
                if(isMail(fieldName.val(), fName) == false){    
                    createAlert(fieldName, fMessage);
                }
				else{
					removeAlert(fieldName);
					countTrueFilled++;
				}
            }
            else{
                //checks for value
                if(fieldName.val()==fVal){
                    createAlert(fieldName, fMessage);
                }else{
                    removeAlert(fieldName);
                    countTrueFilled++;
		}
            }
        }
		if(countTrueFilled>=this.valSetting.fields.length)
		{
			switch(whatForm){
				default:
                                    if(whatForm=="frmLoginFEUser"){
                                       
                                    }
                                    
                                    if(isAjaxLoaded) return false;
                                    isAjaxLoaded=true;
                                    var postData=myApp.formToJSON("#"+whatForm);
                                    
                                    $$.ajax({
                                       type: "POST",
                                       url: pathToAjaxDispatcher,
                                       data: postData,
                                       dataType: "json",
                                       success: function(data){
                                           isAjaxLoaded=false;
                                               if(data["success"]==1){
                                                    if(whatForm=="frmLoginFEUser"){
                                                        $$("body").addClass("logged-in");
                                                        $$("div[data-target='shortquote']").html(data["shortquote"]);
                                                        if(data["actionafterlogin"]){
                                                            switch(data["actionafterlogin"]){
                                                                default:
                                                                    displayInfo(data["message"], $$("body"));
                                                                break;
                                                                case "addProductToFavoritesPair":
                                                                    displayInfo(data["message"], $$("body"));
                                                                    $$("[data-context='addProductToFavorites'][data-id='"+data["editid"]+"']").addClass("activated");
                                                                break;
                                                            }
                                                            
                                                        }
                                                        myApp.closeModal('.popup3');
                                                        
                                                    }else if(whatForm=="frmSendCustomQuote"){
                                                        $$("div[data-target='shortquote']").html("");
                                                        $$("#wrapAllQuotes").html("");
                                                        resetForm($$("#"+whatForm));
                                                        var popup2data=data["content"];
                                                        show_overlay(popup2data);
                                                        myApp.popup('.popup2');
                                                    }
                                                }else{
                                                    displayAlert(data["message"], $$("body"));
                                               }
                                            return false;
                                       }, error: function(error){
                                           isAjaxLoaded=false;
                                           //resetForm($$("#"+whatForm));
                                           displayAlert("Error. Look at the console log for more informations.", $$("body"));
                                           console.log(error.responseText);
                                           
                                       }
                                    });
				break;
			}
		}
		else
		{
                    console.log("something should happen.");
                    displayAlert(stringAlert, $$("body"));
                    return false;
		}
		
    };
	
	
};

$$.fn.validateOnAction=function(matcher, whatFunction){
    return this.each(function(){
        var $this=$$(this);
        console.log("triggered");
        $this.data("timeout", null)
            .keyup(function(){
                clearTimeout($this.data("timeout"));
                $this.removeClass("gray").data("timeout", setTimeout(
                            function(){
                                    if(matcher.test($this.val())){
                                        switch(whatFunction){
                                            case "addToQuoteQty":
                                                
                                            break;
                                        }

                                    }else{
                                        displayAlert("It must be a number <= 5000.", $("body"));
                                        return false;
                                    }							
                                    }, 500));
            });
    });
    
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


$$(document).on("click", "[data-action='addedititem']", function(e){
    e.preventDefault();
    var $this=$$(this);
    $this.addClass("animationon");
    
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    var postData={context: $this.attr("data-context")};
    
    if($this.attr("data-id")){
        postData["id"]=$this.attr("data-id");
    }
    
    if(postData["context"]=="addProductToFavorites" || postData["context"]=="removeFromFavorites"){
        //Check is user logged in, otherwise display a login screen
        if($$("body.logged-in").length<1){
            isAjaxLoaded=false;
            var data=JSON.parse(localStorage.getItem('welcomeTemplate'));
            var popup3data=data["results"]["popup"];
            show_overlay(popup3data);
            myApp.popup('.popup3');
            return false;
        }
    }
    
    $$.ajax({
       type: "POST",
       url: pathToAjaxDispatcher,
       data: postData,
       dataType: "json",
       success: function(data){
           isAjaxLoaded=false;
               if(data["success"]==1){
                   if(postData["context"]=="addProductToFavorites"
                           || postData["context"]=="addToCustomQuote"){
                       displayInfo(data["message"], $$("body"));
                       if(postData["context"]=="addProductToFavorites"){
                           var jsonString=$$("#wrapAllProducts a.loadContext[data-id='"+postData["id"]+"']").attr("data-context");
                           var tempObj=JSON.parse(jsonString);
                           if(!tempObj.hasOwnProperty("isfavorite")){
                               tempObj["isfavorite"]=1;
                           }
                           jsonString=JSON.stringify(tempObj);
                           $$("#wrapAllProducts a.loadContext[data-id='"+postData["id"]+"']").attr("data-context", jsonString);
                           $$("#wrapAllProducts div[data-target='favorite'][data-id='"+postData["id"]+"']").html(data["content"]);
                           $$("#wrapAllProducts li.swipeout[data-id='"+postData["id"]+"'] div.swipeout-actions-right a[data-context='addProductToFavorites']").remove();
                           
                           $this.closest("a[data-action='addedititem']").closest("div").html(data["content"]);
                           
                           myApp.swipeoutClose($$("#wrapAllProducts li.swipeout[data-id='"+postData["id"]+"']"), function(){
                               
                           });
                       }
                   }
                   if(postData["context"]=="addToCustomQuote"){
                       $$("div.page.page-on-center div[data-target='shortquote']").html(data["content"]);
                   }
                   if(postData["context"]=="removeProductFromFavorites"){
                       
                       myApp.swipeoutDelete($$("#wrapAllFavorites li.swipeout[data-id='"+postData["id"]+"']"), function(){
                           $$("div.page.page-on-center [data-target='countfavorites']").html(data["count"]);
                           
                           
                           $$("a[data-href='favorites.html']").attr("data-context", '{"countfavorites": "' + data["count"]+'"}');
                       });
                       
                       
                       var jsonString=$$("#wrapAllProducts a.loadContext[data-id='"+postData["id"]+"']").attr("data-context");
                           var tempObj=JSON.parse(jsonString);
                           if(tempObj.hasOwnProperty("isfavorite")){
                               delete tempObj["isfavorite"];
                           }
                           jsonString=JSON.stringify(tempObj);
                           $$("#wrapAllProducts a.loadContext[data-id='"+postData["id"]+"']").attr("data-context", jsonString);
                       
                       
                       $this.closest("a[data-action='addedititem']").closest("div").html(data["content"]);
                       $$("#wrapAllProducts div[data-target='favorite'][data-id='"+postData["id"]+"']").html("");
                       
                       
                       
                   }
                   if(postData["context"]=="removeCustomQuote"){
                       myApp.swipeoutDelete($$("#wrapAllQuotes li.swipeout[data-id='"+postData["id"]+"']"), function(){
                           $$("div.page.page-on-center div[data-target='shortquote']").html(data["content"]);
                       });
                   }
                   if(postData["context"]=="logoutFEUser"){
                       $$("body").removeClass("logged-in");
                       var data=JSON.parse(localStorage.getItem('welcomeTemplate'));
                        var currentPage=mainView.activePage.name;
                        
                        mainView.router.load({
                            template: Template7.templates.homePageTemplate,
                            animatePages: true,
                            reload: false,
                            context: data
                        });
                      
                   }
               }else{
                    if(postData["context"]=="addProductToFavorites"){
                        if(data["success"]==2){
                            show_overlay(data["content"]);
                            
                        }
                    }else{
                        displayAlert(data["message"], $$("body"));
                    }
               }
       }, error: function(){
           isAjaxLoaded=false;
       }
    });
});

$$(document).on("keyup", "input[name='aEOE_search']", function(e){
    var $this=$$(this);
    $this.data("timeout", null);
    $this.data("timeout", setTimeout(function(){
        if(reSearch.test($this.val())){
            var tempObj={"search": $this.val()};
            var jsonString=JSON.stringify(tempObj);
            $$("a[data-target='searchbtn']").attr({
                    "data-context": jsonString,
                    "href": "search.html"
                });
        }else{
            $$("a[data-target='searchbtn']").attr({
                    "data-context": "",
                    "href": "#"
                });
        }
    }, 500));
    
});

$$(document).on("keyup", "input[name='aEEE_qty']", function(e){
    var $this=$$(this);
    $this.data("timeout", null);
    $this.data("timeout", setTimeout(function(){
        if(reQty.test($this.val())){
            var postData={id: $this.attr("data-id"), qty: $this.val(), context: "addToCustomQuote"};
            callAjaxOnFly(postData);
        }else{
            //displayAlert("It must be a number <= 5000.", $$("body"));
        }
    }, 500));
    
});

function show_overlay(responseText){
    if($$("body > .popup").length<1){
        $$("body").prepend(responseText);
    }
}

$$(document).on("mouseup", function(e){
    var $target=$$(e.target);
    if($target.closest("div.wrapSearch").length<1){
        $$("nav#menu").removeClass("activated");
    }
});

$$(document).on("mouseup", function(){
    $$(".missingFields").removeClass("missingFields");
});

$$(document).on("click", "a[data-context='wrapDisplayFavorites']", function(e){
    e.preventDefault();
    var $this=$$(this);
    if($$("body.logged-in").length<1){
        var data=JSON.parse(localStorage.getItem('welcomeTemplate'));
        var popup3data=data["results"]["popup"];
        show_overlay(popup3data);
        myApp.popup('.popup3');
        return false;
    }else{
        //Check is user logged in, otherwise display a login screen
        
    }
});

$$(document).on("click", "button[data-action='FBLoginSignup']", function(){
    CallAfterLogin("signupUser");
});

$$(document).on("click", "#wrapCatMenuAll a.actaslink", function(e){
    window.setTimeout(function(){
        $$("div.page[data-page='index']").removeClass("catmenuactivated");
    }, 400);
    
});

$$(document).on("submit", "form[data-action='handlewithform']", function(e){
    e.preventDefault();
    $$(this).checkFields();
    return false;
});

$$(document).on("click", "a[data-action='togglemenu']", function(e){
    e.preventDefault();
    var $this=$$(this);
    $$("div.page.page-on-center " + $this.attr("data-target")).toggleClass("activated");
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

$$(document).on("click", "[data-action='togglerelated']", function(e){
    var $this=$$(this);
    var name=$this.attr("name");
    var value=$this.val();
    if($this.is(":checked")){
        if($this.val()==1){
            $$("[data-rel='"+name+"'][data-value='1']").removeClass("hidden");
            $$("[data-rel='"+name+"'][data-value='2']").addClass("hidden").find("input.mf-input").val("");
        }else{
            $$("[data-rel='"+name+"'][data-value='2']").removeClass("hidden");
            $$("[data-rel='"+name+"'][data-value='1']").addClass("hidden").find("input.mf-input").val("");
        }
    }
    
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


myApp.onPageInit('singleproduct', function (page) {
    if(page.context.ProductID){
        id=page.context.ProductID;
    }
    autoLoadCurrentProductPhotos(id);
    
});

myApp.onPageInit('quote', function (page) {
    var calendarPickup = myApp.calendar({
        input: '#aEOE_pdate',
    }); 
    var calendarDelivery = myApp.calendar({
        input: '#aEOE_ddate',
    });
    autoLoadCurrentQuote();
    
});

myApp.onPageInit('feeds', function (page) {
    autoLoadCurrentFBFeeds();
});

myApp.onPageInit('favorites', function (page) {
    autoLoadCurrentFavorites();
});

myApp.onPageInit('search', function (page) {
    console.log(page.context);
    var search=page.context.search;
    autoLoadCurrentSearch(search);
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
                        $$("div[data-target='shortquote']").html(data["shortquote"]);
                        
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
                    case "addToCustomQuote":
                        $$("div[data-target='shortquote']").html(data["content"]);
                    break;
                }
            }else{
                displayAlert(data["message"], $$("body"));
            }
        }
    });
}

function loginWithFBConnect(a, whatAction){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    /*
    var string="";
    for(i in a) string +=i+": " + a[i] + "<br />";
    displayAlert(string, 4000);
    */
    var postData={whatAction: whatAction, response: a, context: "connectToFacebookSUUser"};
    $$.ajax({
        type: "POST",
        url: pathToAjaxDispatcher,
        data: postData,
        dataType: "json",
        success: function(data){
            isAjaxLoaded=false;
            if(data["success"]==1){
                $$("body").addClass("logged-in");
                $$("div[data-target='shortquote']").html(data["shortquote"]);
                if(data["actionafterlogin"]){
                    switch(data["actionafterlogin"]){
                        default:
                            displayInfo(data["message"], $$("body"));
                        break;
                        case "addProductToFavoritesPair":
                            displayInfo(data["message"], $$("body"));
                            $$("[data-context='addProductToFavorites'][data-id='"+data["editid"]+"']").addClass("activated");
                        break;
                    }
                }
                myApp.closeModal('.popup3');
            }else displayAlert(data["message"]);
        }, error: function(){
           isAjaxLoaded=false;
       }
    });
    
}

function autoLoadCurrentProductPhotos(id){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    
    var postData={id: id, context: "loadCurrentProductPhotos"};
    
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
                       var stringMenu="";
                       for(var i=1; i<=data["count"]; i++){
                           var currentClass=i==1?"current":"";
                           stringMenu +="<a class="+currentClass+" href='#'></a>";
                       }
                       //$$("div[data-target='photomenu']").html(stringMenu);
                       var imgs="";
                        $$.each(data["results"], function (index, value) {
                            var newImage="<div class='swiper-slide'><div class='bg-image' style='background-image: url(" + value +");'></div></div>";
                            imgs +=newImage;
                            
                        });
                        $$("#wrapProductPhoto [data-target='productphotos']").html(imgs);
                        window.setTimeout(function(){
                            $$("#wrapProductPhoto div.bg-image").addClass("completed");
                            $$("#wrapProductPhoto > div.ajaxLoader").remove();
                        }, 500);
                        
                        // Init slider and store its instance in mySwiper variable
                        var mySwiper = myApp.swiper('.swiper-container', {
                          pagination:'.wrapPhotoMenu'
                        });
                    }
                    window.setTimeout(function(){
                       $$("div.page.page-on-center div[data-target='shortquote']").html(data["shortquote"]); 
                    }, 400);
               }else{
                   displayAlert(data["message"], $$("body"));
               }
            return false;
       }, error: function(){
           isAjaxLoaded=false;
       }
    });
}

function autoLoadCurrentQuote(){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    
    var postData={context: "loadCurrentQuote"};
    
    $$.ajax({
       type: "POST",
       url: pathToAjaxDispatcher,
       data: postData,
       dataType: "json",
       success: function(data){
           isAjaxLoaded=false;
            if(data["success"]==1){
                
                localStorage.setItem('listQuoteTemplate', JSON.stringify(data));
                var data=JSON.parse(localStorage.getItem('listQuoteTemplate'));
                var currentPage=mainView.activePage.name;
                
                var listQuoteTemplate=$$("script#listQuoteTemplate").html();
                var compiledTemplate = Template7.compile(listQuoteTemplate);
                var html=compiledTemplate(data);
                
                $$("#wrapAllQuotes").html(html);
                
                $$("div.page.page-on-center div[data-target='shortquote']").html(data["shortquote"]);
                
                loadQuotePhotos();
            }
            return false;
       }, error: function(){
           isAjaxLoaded=false;
       }
    });
}

function autoLoadCurrentFavorites(){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    
    var postData={context: "loadCurrentFavorites"};
    
    $$.ajax({
       type: "POST",
       url: pathToAjaxDispatcher,
       data: postData,
       dataType: "json",
       success: function(data){
           isAjaxLoaded=false;
            if(data["success"]==1){
                
                $$("[data-target='countfavorites']").html(data["count"]);
                
                localStorage.setItem('listFavoriteTemplate', JSON.stringify(data));
                var data=JSON.parse(localStorage.getItem('listFavoriteTemplate'));
                var currentPage=mainView.activePage.name;
                
                var listFavoriteTemplate=$$("script#listFavoriteTemplate").html();
                var compiledTemplate = Template7.compile(listFavoriteTemplate);
                var html=compiledTemplate(data);
                
                
                $$("#wrapAllFavorites").html(html);
                
                window.setTimeout(function(){
                       $$("div.page.page-on-center div[data-target='shortquote']").html(data["shortquote"]); 
                    }, 400);
                
                loadFavoritePhotos();
            }
            return false;
       }, error: function(){
           isAjaxLoaded=false;
       }
    });
}

function autoLoadCurrentSearch(search){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    
    var postData={search: search, context: "loadCurrentSearch"};
    
    $$.ajax({
       type: "POST",
       url: pathToAjaxDispatcher,
       data: postData,
       dataType: "json",
       success: function(data){
           isAjaxLoaded=false;
            if(data["success"]==1){
                $$("[data-target='countsearch']").html(data["count"]);
                
                localStorage.setItem('listSearchTemplate', JSON.stringify(data));
                var data=JSON.parse(localStorage.getItem('listSearchTemplate'));
                var currentPage=mainView.activePage.name;
                
                var listSearchTemplate=$$("script#listSearchTemplate").html();
                var compiledTemplate = Template7.compile(listSearchTemplate);
                var html=compiledTemplate(data);
                $$("#wrapAllSearches").html(html);
                
                window.setTimeout(function(){
                    
                    if(data["shortquote"]){
                        $$("div.page.page-on-center div[data-target='shortquote']").html(data["shortquote"]);
                    }
                    if(data["countfavorites"]){
                        $$("a[data-href='favorites.html']").attr("data-context", '{"countfavorites": "' +data["countfavorites"]+'"}');
                    }
                    loadSearchPhotos();
                }, 200);
            }
            return false;
       }, error: function(){
           isAjaxLoaded=false;
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
                
                window.setTimeout(function(){
                    if(data["shortquote"]){
                        $$("div.page.page-on-center div[data-target='shortquote']").html(data["shortquote"]);
                    }
                    if(data["countfavorites"]){
                        $$("a[data-href='favorites.html']").attr("data-context", '{"countfavorites": "' +data["countfavorites"]+'"}');
                    }
                    loadProductPhotos(id, category);
                }, 200);
                
                
                
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

function loadQuotePhotos(){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    var postData={context: "loadQuotePhotos"};
    
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
                            
                            $$("#wrapAllQuotes a.loadContext[data-id='"+index+"'] div.image-holder > div.bg-image-outer").html(newImage);
                            $$("#wrapAllQuotes a.loadContext[data-id='"+index+"'] div.image-holder").addClass("completed");
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

function loadFavoritePhotos(){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    var postData={context: "loadFavoritePhotos"};
    
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
                            
                            $$("#wrapAllFavorites a.loadContext[data-id='"+index+"'] div.image-holder > div.bg-image-outer").html(newImage);
                            $$("#wrapAllFavorites a.loadContext[data-id='"+index+"'] div.image-holder").addClass("completed");
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

function loadSearchPhotos(){
    if(isAjaxLoaded) return false;
    isAjaxLoaded=true;
    var postData={context: "loadSearchPhotos"};
    
    
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
                            
                            $$("#wrapAllSearches a.loadContext[data-id='"+index+"'] div.image-holder > div.bg-image-outer").html(newImage);
                            $$("#wrapAllSearches a.loadContext[data-id='"+index+"'] div.image-holder").addClass("completed");
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

function autoLoadCurrentFBFeeds(){
    var feeds=$$("#wrapFBFeeds").html();
    $$("div[data-target='wrapallfeeds']").html(feeds);
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

function resetForm(form){
    form.find("input[type=text], input[type=email], input[type=number], textarea").val("");
    form.find("input[type=radio], input[type=checkbox]").prop("checked", false);
    form.find("select").val("");
    form.find("div.submit-input").addClass("hidden");
}