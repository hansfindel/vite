var api_host = "http://192.168.0.178:3000";
//Models
Event = Backbone.Model.extend();
EventsList = Backbone.Collection.extend({
  model: Event,
  url: function(){
    //return "/outro2/json/events.json";
    //return "/json/events.json";
	return api_host + "/events.json";
    //return "http://162.243.16.96/events.json";
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
  }
});

//Vars

var ev = new Event;
var eventId = 0;
var eventCollection = new EventsList;
var recommendationCollection = new RecommendationsList;
recommendationCollection.fetch(); 

//Splash Constants
//var SPLASH_TIME_OUT = 2000;
var SPLASH_TIME_OUT = 200;

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
        console.log("this.collection:", this.collection)
        this.collection.bind('reset', this.addOne, eventCollection);
    },

    render:function () {
        console.log("this.collection.length: ", this.collection.length);
        console.log("Evento:" + eventId);
        if(eventCollection.length > 0){
            ev = eventCollection.at(eventId);
        }

        if(ev==null){
            console.log('ev es null');
            $(this.el).html(this.template());
        }else{
            console.log('ev tiene modelo');
            console.log(ev);
            console.log(ev.toJSON());
            $(this.el).html(this.template(ev));
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
    render: function (eventName) {
        console.log("ev: ", ev)
        var comments = recommendationCollection.filterById(ev.id).models || [];
        console.log("recommendations: ", comments);
        $(this.el).html(this.template( {comments: comments} ));
        console.log("this <RecommendationsView>: ", this)
        return this;
    }
});

//var homeView = new HomeView();


var AppRouter = Backbone.Router.extend({

    routes:{
        "":"splash",
        "home":"home",
        "details/:eventdet/:reverseTransition":"details",
        "recommendations/:eventdet/:reverseTransition":"recommendations"
    },

    initialize:function () {
        $('.back').live('click', function(event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
        //eventCollection.fetch();

    },

    //Controllers
    splash:function(){
    	this.changePage(new SplashView());
    	
    	setTimeout(function(){
    		app.login();
        }, SPLASH_TIME_OUT);
    },
    
    login:function(){
		if(typeof(Storage)!=="undefined"){
			if(localStorage.alreadyLogged !== 'true'){
				localStorage.alreadyLogged = 'true';
				this.changePage(new LoginView(),'slide');
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
            eventId++;
        }
        else if (transition == 'slidedown'){
            this.changePage(new HomeView({ collection: eventCollection }),'slideup');
            eventId--;
        }
        else if(transition == 'slideleft'){
        	this.changePage(new HomeView({ collection: eventCollection }),'slide');
        }
        else{
            this.changePage(new HomeView({ collection: eventCollection }),'slide',true);
            //eventId++;
        }
    },


    details:function (eventDet, reverseTransition) {

        if(reverseTransition == 1)
            this.changePage(new DetailsView(), 'slide',true);
        else
            this.changePage(new DetailsView(), 'slide');
    },

    recommendations:function (eventDet, reverseTransition) {
        console.log('#recommendations');
        if(reverseTransition ==1)
            this.changePage(new RecommendationsView(),'slide',true);
        else
            this.changePage(new RecommendationsView(),'slide');
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
        
        $('nav#menu').mmenu();
        if (this.firstPage) {
            transition = 'none';
            this.firstPage = false;
        }

        if(reverse)
            $.mobile.changePage($(page.el), {changeHash:false, transition: transition, reverse:true});
        else
            $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
    },
});

$(document).on("mobileinit", function(){
    $.mobile.changePage.defaults.allowSamePageTransition = true;
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
        eventId++;
            app.home('slideup');
        },
        wipeDown: function() {
            eventId--;
            app.home('slidedown');
        },
        min_move_x: 20,
        min_move_y: 20,
        preventDefaultEvents: true
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
