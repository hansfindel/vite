
//Models
Event = Backbone.Model.extend();
EventsList = Backbone.Collection.extend({
  model: Event,
  url: function(){
	//return "http://162.243.16.96/events.json";
	return "http://outro.vitenow.com/events.json";
    },
  parse: function(response){
    return response.Data;
    }
});

Recommendation = Backbone.Model.extend();
RecommendationsList = Backbone.Collection.extend({
  model: Recommendation,
  url: function(){
	return "http://162.243.16.96/recommendations.json";
    },
  parse: function(response){
    return response.Data;
    }
});

//Vars

var ev = new Event;
var eventId = 0;
var eventCollection = new EventsList;

//Splash Constants
var SPLASH_TIME_OUT = 2000;

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

    initialize:function() {
        _.bindAll(this,'render','addOne');    
        this.collection.bind('reset', this.addOne, eventCollection);
    },

    render:function () {
        console.log(this.collection.length);
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

        console.log(this.collection.length);
        console.log('addOne');
        this.render();
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

    template:_.template($('#recommendations').html()),

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    }
});

//var homeView = new HomeView();

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
        "recommendations/:eventdet/:reverseTransition":"recommendations"
    },

    initialize:function () {
        $('.back').live('click', function(event) {
            window.history.back();
            return false;
        });
        this.firstPage = true;
        
        if(typeof(Storage)!=="undefined"){
    		if(localStorage.getItem('localEventStorage') !== null){
    			console.log(localStorage.getItem('localEventStorage'));
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
        swipeActive = false;
    },

    recommendations:function (eventDet, reverseTransition) {
        console.log('#recommendations');
        if(reverseTransition ==1)
            this.changePage(new RecommendationsView(),'slide',true);
        else
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
