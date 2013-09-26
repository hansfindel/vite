
//Models
Event = Backbone.Model.extend();
EventsList = Backbone.Collection.extend({
  model: Event,
  url: function(){
    //return "/outro2/json/events.json";
    return "/json/events.json";
    },
  parse: function(response){
    return response.Data;
    }
});

//Vars

var ev = new Event;
var eventId = 0;
var eventCollection = new EventsList;

//Views
window.HomeView = Backbone.View.extend({
    template:_.template($('#home').html()),

    initialize:function() {
        _.bindAll(this,'render','addOne');    
        this.collection.fetch();
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
        $(this.el).html(this.template());
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


var AppRouter = Backbone.Router.extend({

    routes:{
        "":"home",
        "home":"home",
        "details/:eventId/:reverseTransition":"details",
        "recommendations/:eventId/:reverseTransition":"recommendations"
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
        else{
            this.changePage(new HomeView({ collection: eventCollection }),'slide',true);
            //eventId++;
        }
    },


    details:function (eventId, reverseTransition) {

        if(reverseTransition == 1)
            this.changePage(new DetailsView(), 'slide',true);
        else
            this.changePage(new DetailsView(), 'slide');
    },

    recommendations:function (eventId, reverseTransition) {
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