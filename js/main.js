//var api_host = "http://outro.vitenow.com";
//var api_host = "http://192.168.0.178:3000";
//var api_host = "http://192.168.1.113:3000"
//var api_host = "http://192.168.1.101:3000";
//var api_host = "http://162.243.16.96";
var api_host = "http://localhost:3000"


//Models
Event = Backbone.Model.extend({});
EventsList = Backbone.Collection.extend({
  model: Event,
  url: function(){
    //return "/outro2/json/events.json";
    //return "/json/events.json";
	//return api_host + "/events";
    return api_host + "/events.json";
    //return "http://162.243.16.96/events.json";
	//return "http://outro.vitenow.com/events.json";
    },
  parse: function(response){
    //console.log("response: ", response)
    //return response.Data;
    //return response;
    return response.events;
    },
  filterByCategoryId: function(category_id) {
    //tevent instaed of event, event reserved word
    //console.log(category_id, typeof(category_id))
    filtered = this.filter(function(tevent) {
        //var cat = tevent.get("category");
        //console.log(cat, typeof(cat))
        // number_type == string_type is valid
      return tevent.get("category") == category_id;
    });
    return new EventsList(filtered);
  }
});

Recommendation = Backbone.Model.extend({});
RecommendationsList = Backbone.Collection.extend({
  model: Recommendation,
  url: function(){
	//return "http://162.243.16.96/recommendations.json";
    //return api_host + "/recommendations";
    return api_host + "/recommendations.json";
    },
  parse: function(response){
    //return response.Data;
    return response.recommendations;
    },
  filterById: function(event_id) {
    filtered = this.filter(function(recommendation) {
      return recommendation.get("event_id") === event_id;
      });
    return new RecommendationsList(filtered);
  },
  filterByUserId: function(user_id) {
    filtered = this.filter(function(recommendation) {
      return recommendation.get("user_id") === user_id;
      });
    return new RecommendationsList(filtered);
  },
  shareCount: function(event_id){
    filtered = this.filter(function(recommendation) {
        return recommendation.get("event_id") == event_id;
    });
    return filtered.length;
  }

});

User = Backbone.Model.extend({
    followersCount: function(){return this.get("followers").length},
    followeesCount: function(){return this.get("followees").length}, 
    recommendationCount: function(){return recommendationCollection.filterByUserId(this.get("id")).length ;}, // can be optimized
    is_followed_by: function(user){ var user_id = user.get("id") || -1; return this.get("followers").indexOf( user_id ) > -1 }
});
UsersList = Backbone.Collection.extend({
  model: User,
  url: function(){
    //return "http://162.243.16.96/recommendations.json";
    return api_host + "/users.json";
  },
  parse: function(response){
    //return response.Data;
    return response.users;
  },
  getById: function(uid){
    users = this.filter(function(current_user) {
        
      return current_user.get("id") == uid;
    });
    return users[0];
  },
  followed_by: function(user) {
    list = user.get("followers") || [];
    filtered = this.filter(function(follow) {
      if( list.indexOf( follow.get("id") ) > -1 ){
        return follow;
      }
    });
    //console.log("filtered ", filtered);
    return new UsersList(filtered);
  },
  following: function(user){
    list = user.get("followees") || [];
    filtered = this.filter(function(follow) {
      if( list.indexOf( follow.get("id") ) > -1 ){
        return follow;
      }
    });
    //filtered = list.map(function(element_id){
    //    this.find(function(user){
    //        if(user.get("id") == element_id){
    //            return user;
    //        }
    //    })
    //})
    return new UsersList(filtered);
  }

});

//Vars

var ev = new Event;
var eventId = 0;
var eventCollection = new EventsList;
eventCollection.fetch(); 
var events = eventCollection;

var recommendationCollection = new RecommendationsList;
recommendationCollection.fetch(); 
var us = new User;
var userCollection = new UsersList;

var current_user; 
userCollection.fetch()
    .done(function(){
        if(current_user == undefined){
            var index = Date.now() % userCollection.models.length;
            current_user = userCollection.models[index];     
        }
    })

//Splash Constants
//var SPLASH_TIME_OUT = 2000;
var SPLASH_TIME_OUT = 500;

//Swipe Var
var swipeActive = false;

//Views
window.SplashView = Backbone.View.extend({
	template:_.template($('#splash').html()),

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    }
});

window.LoginView = Backbone.View.extend({
	template:_.template($('#login').html()),

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    }
});

window.HomeView = Backbone.View.extend({
    template:_.template($('#home').html()),
    //model: Event, 
    initialize:function() {
        _.bindAll(this,'render','addOne');    
        //console.log("#######HomeView#########")
        //console.log(this)
        //this.collection.fetch({dataType: "jsonp"});
        
        //this.collection.fetch();    
        
        //console.log("this.collection:", this.collection)
        //this.collection.bind('reset', this.addOne, eventCollection);
        this.collection.bind('reset', this.addOne, events);
    },

    render:function () {
        //console.log("this.collection.length: ", this.collection.length);
        //console.log("this.collection: ", this.collection);
        //console.log("Evento: " + eventId);
        var collection = this.collection;
        var prev, next;
        if(collection.length > 0){
            ev   = collection.at(eventId);
            if(eventId > 0){
                prev = collection.at(eventId - 1);    
            }
            else{
                prev = undefined;
            }
            if(eventId < collection.length){
                next = collection.at(eventId + 1);
            }
            else{
                next = undefined;
            }
            //console.log("prev: ", prev, "ev: ", ev, "next: ", next);
        }
        if(ev==null){
            console.log('ev es null');
            $(this.el).html(this.template());
        }else{
            //console.log('ev tiene modelo');
            //console.log(ev);
            //console.log(ev.toJSON());
            $(this.el).html( this.template({ev: ev, prev: prev, next: next}) );
        }
        if($("nav#menu").length == 0){
            append_menu()
        }
        return this;
    },

    addOne: function () {
        //console.log("homeView addone:")
        this.render();
        //console.log("/homeView addone")
    }

});

window.DetailsView = Backbone.View.extend({

    template:_.template($('#details').html()),

    render:function (eventName) {
        if(ev.get("id") == undefined){
            app.navigate('#', {trigger: true}); 
        }
        //$(this.el).html(this.template(ev));

        return this;
    }
});

window.RecommendationsView = Backbone.View.extend({

    template: _.template($('#recommendations').html()),
    initialize: function(){
        if(recommendationCollection.models.length == 0){
            recommendationCollection.fetch();
        }
    },
    render: function () {
        console.log("ev: ", ev)
        if(ev == undefined || ev.get("id") == undefined){
            app.navigate("#", {trigger: true})
        }
        var comments = recommendationCollection.filterById(ev.id).models || [];
        if(comments.length == 0){
            console.log("comments length == 0")
            app.navigate("#details/<%= ev.get('id') %>/0", {trigger: true}); 
        }
        //console.log("recommendations: ", comments);
        $(this.el).html(this.template( {comments: comments} ));
        //console.log("this <RecommendationsView>: ", this)
        return this;
    }
});

window.ProfileView = Backbone.View.extend({

    template: _.template($('#profile').html()),
    initialize: function(userid){
        if(userCollection.models.length == 0){
            userCollection.fetch();
        }
        //console.log(userid)
        us = userCollection.getById(userid);  
    }, 
    render: function () {
        if(userCollection.models.length == 0 || us == undefined){
            //console.log(userCollection)
            //console.log(us);
            app.navigate("#", {trigger: true})
            return; // so it doesnt throw errors
        }        
        recommendations = recommendationCollection.filterByUserId(us.get("id"));
        //console.log("recommendations:", recommendations)
        $(this.el).html(this.template( {profile: us, comments: recommendations.models} ));
        return this;
    }
});

window.FollowersView = Backbone.View.extend({
    template: _.template($('#follows').html()),
    initialize: function(userid){
        if(userCollection.models.length == 0){
            userCollection.fetch();
        }
        us = userCollection.getById(userid);  
    }, 
    render: function () {
        if(userCollection.models.length == 0 || us == undefined){
            app.navigate("#", {trigger: true})
        }        
        $(this.el).html(this.template( {profile: us, follows: userCollection.followed_by(us).models, title: "Followers"}));
        return this;
    }
});
window.FolloweesView = Backbone.View.extend({
    template: _.template($('#follows').html()),
    initialize: function(userid){
        if(userCollection.models.length == 0){
            userCollection.fetch();
        }
        us = userCollection.getById(userid);  
    }, 
    render: function () {
        if(userCollection.models.length == 0 || us == undefined){
            app.navigate("#", {trigger: true})
        }        
        $(this.el).html(this.template( {profile: us, follows: userCollection.following(us).models , title: "Followees"} ));
        return this;
    }
});
//var homeView = new HomeView();

/*
window.swipeUp = function(){
    return app.home("slideup");
}
window.swipeDown = function(){
    return app.home("slidedown");
}
*/
function swipeUp(){
	if(swipeActive){ 
		eventId--;
	    if(eventId < 0){
	    	eventId = 0;
	    }else{
	    	app.home('slideup');
	    }
	}
};

function swipeDown(){
	if(swipeActive){ 
		eventId++;
        // events instead of eventCollection
        // events is the current set of events, filtered or not
		if(eventId > events.length - 1){
			eventId = events.length - 1;
		}else{
			app.home('slidedown');
		}
	}	
};

var AppRouter = Backbone.Router.extend({

    routes:{
        "":"splash",
        "home":"home",
        "menu":"splash",
        "home/:categorydet":"home_category",
        "details/:eventdet/:reverseTransition":"details",
        "recommendations/:eventdet/:reverseTransition":"recommendations", 
        "profile/:userid":"profile",
        "profile/:userid/followees":"followees",
        "profile/:userid/followers":"followers"
    },

    initialize:function () {
        $('.back').live('click', function(event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
        
        if(typeof(Storage)!=="undefined"){
    		if(localStorage.getItem('localEventStorage') !== null){
    			//console.log(localStorage.getItem('localEventStorage'));
    			eventCollection = new EventsList(JSON.parse(localStorage.getItem('localEventStorage')));
    		}
		}
        eventCollection.fetch({
        	success: function(){
        		if(typeof(Storage)!=="undefined"){
	        		if(eventCollection.length > 0){
	        			localStorage.setItem('localEventStorage',JSON.stringify(eventCollection));
	        		}
        		}
        	}
        });
    },

    //Controllers
    splash:function(){
    	this.changePage(new SplashView());
    	swipeActive = false;
    	setTimeout(function(){
    		app.login();
        }, SPLASH_TIME_OUT);
    },
    
    login:function(){
		if(typeof(Storage)!=="undefined"){
			if(localStorage.alreadyLogged !== 'true'){
				localStorage.alreadyLogged = 'true';
				this.changePage(new LoginView(),'slide');
				swipeActive = false;
			}else{
				app.home('slideleft');
			}
		}
    	
    	$('#btnLogin').bind("touchstart mousedown",function (){
    		app.home('slideleft');
        });
    	
    },
    
    home:function (transition) {
        //console.log('#home');
        //var home_collection = eventCollection;
        var home_collection = events;
        if(transition == 'slideup'){
            this.changePage(new HomeView({ collection: home_collection }),'slidedown');
        }
        else if (transition == 'slidedown'){
            this.changePage(new HomeView({ collection: home_collection }),'slideup');
        }
        else if(transition == 'slideleft'){
        	this.changePage(new HomeView({ collection: home_collection }),'slide');
        }
        else{
            this.changePage(new HomeView({ collection: home_collection }),'slide',true);
        }
        swipeActive = true;
    },
    home_category: function(category_id){
        //console.log("#home_category")
        //console.log(category_id)
        eventId = 0; //
        events = eventCollection.filterByCategoryId(category_id)
        this.changePage(new HomeView({ collection: events, category: category_id }),'slide',true);
        swipeActive = true;  
    },

    details:function (eventDet, reverseTransition) {
        /*
        if(reverseTransition == 1)
            this.changePage(new DetailsView(), 'slide', true);
        else
            this.changePage(new DetailsView());
        */
        // instaed of changePage transition
        if(ev.get("id") == undefined){app.home(); app.navigate("#"); return;}
        feed_to_event_menu()

        swipeActive = false;
    },

    recommendations:function (eventDet, reverseTransition) {
        //console.log('#recommendations');
        //if(reverseTransition ==1)
        //    this.changePage(new RecommendationsView(),'slide',true);
        //else
            this.changePage(new RecommendationsView(),'slide');
        swipeActive = false;
    },

    changePage:function (page, pagetransition,reverse) {
        var transition = null;
        $(page.el).attr('data-role', 'page');
        //page.render(model.toJSON());
        page.render();
        $('body').append($(page.el));
        
        if(pagetransition)
            transition=pagetransition;
        else
            transition =  $.mobile.defaultPageTransition;   
        
        $('nav#menu').mmenu({
            configuration: {pageSelector: '> div[data-role="page"]:first'}
        });

        if (this.firstPage) {
            transition = 'none';
            this.firstPage = false;
        }

        if(reverse)
            $.mobile.changePage($(page.el), {changeHash:false, transition: transition, reverse:true});
        else
            $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
    },
    profile: function(userid){
        //console.log('#profile');

        this.changePage(new ProfileView(userid),'slide');
        swipeActive = false;
    },
    followers: function(userid){
        this.changePage(new FollowersView(userid),'slide');
        swipeActive = false;
    },
    followees: function(userid){
        this.changePage(new FolloweesView(userid),'slide');
        swipeActive = false;
    }
});

$(document).on("mobileinit", function(){
    $.mobile.changePage.defaults.allowSamePageTransition = true;
	$.support.cors = true;
	$.mobile.allowCrossDomainPages=true;
});

$(document).ready(function () {
    //console.log('document ready');
    app = new AppRouter();
    Backbone.history.start();

    $('nav#menu').mmenu({
        onClick: { 
            setLocationHref : false,
            blockUI         : false,
            callback        : function() {$.mobile.changePage( this.href, {transition: 'slideup'});}
        },
        configuration: {pageSelector: '> div[data-role="page"]:first'}
    });

    $(document.body).touchwipe({
        wipeUp: function() {
            //eventId++;
            //app.home('slideup');
        	swipeUp();
        },
        wipeDown: function() {
        	swipeDown();
        },
        min_move_x: 15,
        min_move_y: 15,
        preventDefaultEvents: false
    });

    $(document).on('pageshow',function( e, ui ){
        $('#menu').trigger( 'setPage', [ $(e.target) ] );
        $('#menu a').each(function(){
            if ( $.mobile.path.parseUrl( this.href ).href == window.location.href ){
                $(this).trigger( 'setSelected.mm' );
            }
        });
    });
});

function feed_to_event_menu(){
    $("h1.header-title").text("Event")
    var link = $("a#menu");
    link.attr("href", "#home")
    link.addClass("back-link")
    link.removeClass("menu-link")
    link.removeClass("ui-link")
    $("nav#menu").remove()
    //link.removeAttr("id")

    link.bind("click", function(){
        event_to_feed_menu(); 
        link.unbind("click");
        append_menu();
        swipeActive = true;    
        return false;
    } )
    
    toggleDescription()
    toggleCategorySwipe()

    //$(".category_swipe").fadeOut("slow")
    //<a id="menu" href="#menu" class="menu-link"></a> -> href="#home" class="back-link"
}
function event_to_feed_menu(){
    $("h1.header-title").text("Upcoming")
    var link = $("a#menu");
    link.attr("href", "#menu")
    link.removeClass("back-link")
    link.addClass("menu-link")
    link.addClass("ui-link")
    //$("nav#menu").remove()
    app.navigate("#")
    //link.removeAttr("id")
    //$(".category_swipe").fadeIn("slow")
    
    toggleDescription()
    toggleCategorySwipe()
}
function toggleCategorySwipe(){
    swipes = $(".category_swipe")
    if(swipeActive){
        // in feed going to event
        swipes.css("padding-top", "0%")
        swipes.css("padding-bottom", "0%")
    }else{
        //swipes.css("padding-top", "1.5%")
        //swipes.css("padding-bottom", "0.5%")
        swipes.css("padding-top", "")
        swipes.css("padding-bottom", "")
    }
}
function toggleDescription(){
    var height = parseInt($(".home_image_container").height())
    //$("#description").css("height", "auto")
    //$("#action").css("height", "auto")
    var displacement = parseInt($("#description").height()) + parseInt($("#description").css("margin-bottom")) + 
        parseInt($("#action").height()) + parseInt($("#action").css("margin-top")) +
        parseInt($("#action").css("margin-bottom")) + parseInt($("#action").css("padding-top")) + parseInt($("#action").css("padding-bottom"))

    var margin = $(".category_swipe").length * ( parseInt($(".category_swipe").css("padding-top"))  + parseInt($(".category_swipe").css("padding-bottom")) )

    if(swipeActive){
        // from feed to event
        $(".home_image_container").css("max-height", height - displacement + margin)
        //$("#description").css("display", "block");
        //$("#action").css("display", "block");

        $("#action_description").css("height", displacement + "px")
        //$("#description").fadeIn();
        //$("#action").fadeIn();
        //$("#description").css("visibility", "visible");
        //$("#action").css("visibility", "visible");
        //$("#description").css("height", "auto");
        //$("#action").css("height", "auto");
        $("div#details").css("max-height", "")
        $("div#details").css("height", "")
    }
    else{
        // from event to feed
        $(".home_image_container").css("max-height", height + displacement - margin)
        //$("#description").css("display", "none");
        //$("#action").css("display", "none");

        $("#action_description").css("height", "0px")
        //$("#description").fadeOut();
        //$("#action").fadeOut();
        //$("#description").css("visibility", "hidden");
        //$("#action").css("visibility", "hidden");
        //$("#description").css("height", "0px");
        //$("#action").css("height", "0px");
        $("div#details").css("max-height", "70px")
        $("div#details").css("height", "70px")
    }
}


function compile_template(template_name, params){
    return _.template($("#" + template_name).html(), params);
}
function append_menu(){
    var menu_html = _.template($("#navigation_navbar").html(), {});
    $("body").append(menu_html)
    $('nav#menu').mmenu({
        configuration: {pageSelector: '> div[data-role="page"]:first'}
    });
}


function minimize(){
  /*$(".home_image_container").css("height", "0px");
  $("#details").css("height", "0px")
  $("#details").css("overflow", "hidden")
  $("#action_description").css("height", "0px");
  $("#recommender").css("height", "0px")
  $("#recommender").css("overflow", "hidden")


  $("#recommender #left-content img").addClass("transition_element")
  $("#recommender #left-content img").css("max-height", "0px")
  
  $("#recommender").addClass("transition_element")
  $("#recommender").css("overflow", "hidden")
  $("#recommender").css("max-height", "0px")

  */
  //$("div[data-role=content]").addClass("slow_transition")
  //var parent = $("div[data-current-event-id=" + ev.get('id') + "]");
  //var current = $(parent.children())
  
  // coordinate selectors 
  var home_image = $(".home_image_container")
  home_image.addClass("slow_transition")
  var recomender_image = $("#recommender #left-content img")
  recomender_image.addClass("transition_element")
  var recommender = $("#recommender")
  recommender.addClass("slow_transition")
  var action_description = $("#action_description")
  action_description.addClass("slow_transition");
  var details = $("div#details")
  details.addClass("slow_transition");
  $(".hr_noshade").remove()

  // swipe down (reomve eventId ++)
  eventId++;  
  // if swipeDown
  var home_collection = events;
  var view = new HomeView({ collection: home_collection });
  console.log(view)
  var new_html = view.render()
  console.log(new_html)

  // use selectors to fade away
  recomender_image.css("max-height", "0px")
  home_image.css("max-height", "0px")
  recommender.css("max-height", "0px")
  action_description.css("max-height", "0px")
  details.css("max-height", "0px")
  
  
  
}