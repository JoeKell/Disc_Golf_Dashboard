
function getFilters() {
    var filters = {}

    // Get all filter checkbox values
    var showPublic = d3.select("#private_public").property('checked');
    var showPrivate = d3.select("#private_private").property('checked');

    var showFree = d3.select("#pay_free").property('checked');
    var showPaid = d3.select("#pay_paid").property('checked');

    var showLessThan9 = d3.select("#holes_lt9").property('checked');
    var show9 = d3.select("#holes_9").property('checked');
    var show10To17 = d3.select("#holes_10to17").property('checked');
    var show18 = d3.select("#holes_18").property('checked');
    var showMoreThan18 = d3.select("#holes_gt18").property('checked');

    var showWithWater = d3.select("#water_with").property('checked');
    var showWithoutWater = d3.select("#water_without").property('checked');

    var showLightlyWooded = d3.select("#terrain_lWooded").property('checked'); 
    var showModeratelyWooded = d3.select("#terrain_mWooded").property('checked');
    var showHeavilyWooded = d3.select("#terrain_hWooded").property('checked');

    var showMostlyFlat = d3.select("#landscape_flat").property('checked'); 
    var showModeratelyHilly = d3.select("#landscape_mHilly").property('checked'); 
    var showVeryHilly = d3.select("#landscape_vHilly").property('checked');

    // Add all values to a "filters" object
    filters["private"] = {
        "showPublic": showPublic,
        "showPrivate": showPrivate
    };

    filters["pay"] = {
        "showFree": showFree,
        "showPaid": showPaid
    };

    filters["holes"] = {
        "showLessThan9": showLessThan9,
        "show9": show9,
        "show10To17": show10To17,
        "show18": show18,
        "showMoreThan18": showMoreThan18
    };

    filters["water"] = {
        "showWithWater": showWithWater,
        "showWithoutWater": showWithoutWater
    };

    filters["terrain"] = {
        "showLightlyWooded": showLightlyWooded,
        "showModeratelyWooded": showModeratelyWooded,
        "showHeavilyWooded":showHeavilyWooded
    };

    filters["landscape"] = {
        "showMostlyFlat": showMostlyFlat,
        "showModeratelyHilly": showModeratelyHilly,
        "showVeryHilly": showVeryHilly
    };

    // return filter object as a JSON string
    return JSON.stringify(filters);
}

function initCharts() {

   //// grabs the values from the primary selection
   var primaryUserValue = primaryUserSelection.node().value;

   /////// grabs the secondary value from the selection
   var secondaryUserValue = secondaryUserSelection.node().value;

   ///.....api call based on the values the users selected
   d3.json(`/api/v1/FeatureAggregate?feat1=${primaryUserValue}&feat2=${secondaryUserValue}`)
   .header("filters", getFilters())
   .get(function(error, data){

    //    console.log(data);
       
       // fucntion that updates the choropleth map
       mapDataLayout(data);

       // updates bar graph
       updateBar(data);

       createScatter(data)
   });

   setTimeout(function () {
        d3.select("#loader").style("display", "none");
    }, 2000);
    
}

    
function updateCharts() {

   //// grabs the values from the primary selection
   var primaryUserValue = primaryUserSelection.node().value;

   /////// grabs the secondary value from the selection
   var secondaryUserValue = secondaryUserSelection.node().value;

   ///.....api call based on the values the users selected
   d3.json(`/api/v1/FeatureAggregate?feat1=${primaryUserValue}&feat2=${secondaryUserValue}`)
   .header("filters", getFilters())
   .get(function(error, data){

    //    console.log(data);
       
       // fucntion that updates the choropleth map
       mapDataLayout(data);

       // updates bar graph
       updateBar(data);

    
       updateScatter(data)
   });

   setTimeout(function () {
        d3.select("#loader").style("display", "none");
    }, 2000);
    
}

////// returns a list of lists of d3 selections grouped by category
function filterGrouping(){
    var privateFilters =[d3.select("#private_public"),d3.select("#private_private")];

    var payFilters =[d3.select("#pay_free"),d3.select("#pay_paid")];

    var holeFilters = [d3.select("#holes_lt9"),d3.select("#holes_9"),d3.select("#holes_10to17"),d3.select("#holes_18"),d3.select("#holes_gt18")];

    var waterFilters = [d3.select("#water_with"),d3.select("#water_without")];

    var terrainFilters =[d3.select("#terrain_lWooded"),d3.select("#terrain_mWooded"),d3.select("#terrain_hWooded")];

    var landscapeFilters =[d3.select("#landscape_flat"),d3.select("#landscape_mHilly"),d3.select("#landscape_vHilly")];

    return [privateFilters,payFilters,holeFilters,waterFilters,terrainFilters,landscapeFilters];
};

////// this function applies filter selection correction on an individual group of filters
//// use filterGrouping fucntion to pass lists to filter correction function
function filterCorrection(filterGroupList){
    ///// makes a list of each filterGroupList item with the property checkd value
    var showGroupList = filterGroupList.map(x=>x.property('checked'));

    ///// if every result in the showgroup list is is unselected
    if (showGroupList.every((x) => x == false)){
        // console.log("none were selected");
        filterGroupList.forEach(x => x.property('checked',true));
    };
};


///// defining the filter button. 
var filter_button = d3.select("#filter-btn");

////// grabs the primary selection
var primaryUserSelection= d3.select("#primarySelection");

///// grabs the secondary selection
var secondaryUserSelection = d3.select('#secondarySelection');


/// used for avoiding duplicate features
///// event listener used when primary feature changes:
primaryUserSelection.on('change',function(){ 

    //// removes all options from the secondary dropdown
    secondaryUserSelection.selectAll("*").remove();

    //// looping through the options in the primary feature menu
    for (var j = 0; j < this.length; j++) {

        ///// grabs the current option tag from the primary user selection
        var current_option = primaryUserSelection._groups[0][0][j];

        //// append an option to the secondaryUserSelection based on the option from the primary dropdown
        secondaryUserSelection.append('option')
        .attr('value',current_option.value)
        .attr('id',current_option.id)
        .html(current_option.text);
    };
    ///// removes the option from secondary list that matches the option selected in the primary dropdown
    secondaryUserSelection.select(`#${this.value}`).remove();
});


///// when the filter button gets clicked....
filter_button.on('click',function(){

    ///// a list of each grouping of filters
    var filterGroups = filterGrouping();
    //// apply filter correction function to each group of filters
    filterGroups.forEach(x =>filterCorrection(x));

    //// function to update scatter plot
    d3.select("#loader").style("display", "flex");
    //// function to update charts
    updateCharts();

});
