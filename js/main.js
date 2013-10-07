var api_host = "http://192.168.0.178:3000";
//var api_host = "http://162.243.16.96";
//var api_host = "localhost:3000"

//Models
Event = Backbone.Model.extend();
EventsList = Backbone.Collection.extend({
  model: Event,
  url: function(){
    //return "/outro2/json/events.json";
    //return "/json/events.json";
	return api_host + "/events.json";
    //return "http://162.243.16.96/events.json";
	//return "http://162.243.16.96/events.json";
	//return "http://outro.vitenow.com/events.json";
    },
  parse: function(response){
    //console.log("response: ", response)
    //return response.Data;
    //return response;
    return response.events;
    }
});

Recommendation = Backbone.Model.extend();
RecommendationsList = Backbone.Collection.extend({
  model: Recommendation,
  url: function(){
	//return "http://162.243.16.96/recommendations.json";
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
  }
});

User = Backbone.Model.extend();
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
  }
  /*
  follows: function(event_id) {
    filtered = this.filter(function(recommendation) {
      return recommendation.get("event_id") === event_id;
      });
    return new RecommendationsList(filtered);
  },
  following: function(){}
  */

});

//Vars

var ev = new Event;
var eventId = 0;
var eventCollection = new EventsList;
var recommendationCollection = new RecommendationsList;
recommendationCollection.fetch(); 
var us = new User;
var userCollection = new UsersList;
userCollection.fetch();


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
        //this.collection.fetch({dataType: "jsonp"});
        this.collection.fetch();
        //console.log("this.collection:", this.collection)
        this.collection.bind('reset', this.addOne, eventCollection);
    },

    render:function () {
        console.log("this.collection.length: ", this.collection.length);
        console.log("Evento: " + eventId);
        var prev, next;
        if(eventCollection.length > 0){
            ev   = eventCollection.at(eventId);
            if(eventId > 0){
                prev = eventCollection.at(eventId - 1);    
            }
            else{
                prev = undefined;
            }
            if(eventId < eventCollection.length){
                next = eventCollection.at(eventId + 1);
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
            console.log('ev tiene modelo');
            console.log(ev);
            console.log(ev.toJSON());
            $(this.el).html( this.template({ev: ev, prev: prev, next: next}) );
        }
        
        return this;
    },

    addOne: function () {
        console.log("homeView addone:")
        this.render();
        console.log("/homeView addone")
    }

});

window.DetailsView = Backbone.View.extend({

    template:_.template($('#details').html()),

    render:function (eventName) {
        if(ev.get("id") == undefined){
            app.navigate('#', {trigger: true}); 
        }
        $(this.el).html(this.template(ev));

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
            app.navigate('#details/<%= ev.get("id") %>/0', {trigger: true}); 
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
        console.log(userid)
        us = userCollection.getById(userid);  
    }, 
    render: function () {
        if(userCollection.models.length == 0 || us == undefined){
            console.log(userCollection)
            console.log(us);
            app.navigate("#", {trigger: true})
        }        
        recommendations = recommendationCollection.filterByUserId(us.get("id"));
        console.log("recommendations:", recommendations)
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
        $(this.el).html(this.template( {profile: us, follows: userCollection.models, title: "Followers"} ));
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
        $(this.el).html(this.template( {profile: us, follows: userCollection.models, title: "Followees"} ));
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
		if(eventId > eventCollection.length - 1){
			eventId = eventCollection.length - 1;
		}else{
			app.home('slidedown');
		}
	}	
};

var AppRouter = Backbone.Router.extend({

    routes:{
        "":"splash",
        "home":"home",
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
        console.log('#home');

        if(transition == 'slideup'){
            this.changePage(new HomeView({ collection: eventCollection }),'slidedown');
        }
        else if (transition == 'slidedown'){
            this.changePage(new HomeView({ collection: eventCollection }),'slideup');
        }
        else if(transition == 'slideleft'){
        	this.changePage(new HomeView({ collection: eventCollection }),'slide');
        }
        else{
            this.changePage(new HomeView({ collection: eventCollection }),'slide',true);
        }
        swipeActive = true;
    },


    details:function (eventDet, reverseTransition) {

        if(reverseTransition == 1)
            this.changePage(new DetailsView(), 'slide',true);
        else
            this.changePage(new DetailsView(), 'slide');

        check_description();
        swipeActive = false;
    },

    recommendations:function (eventDet, reverseTransition) {
        console.log('#recommendations');
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
        console.log('#profile');

        this.changePage(new ProfileView(userid),'slide');
    },
    followers: function(userid){
        this.changePage(new FollowersView(userid),'slide');
    },
    followees: function(userid){
        this.changePage(new FolloweesView(userid),'slide');
    }
});

$(document).on("mobileinit", function(){
    $.mobile.changePage.defaults.allowSamePageTransition = true;
	$.support.cors = true;
	$.mobile.allowCrossDomainPages=true;
});

$(document).ready(function () {
    console.log('document ready');
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
