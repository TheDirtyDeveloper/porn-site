$("#search_b").click(function(){
    var search = $("#search").val();
    window.location.href = `${document.location.origin}/1/${search}`;
}); 

$("#expander").click(function(){
    const tag_size = $("#taglist").height();
    const tagdiv_size = $("#tags").height();
    
    if(tagdiv_size == 50){
        $("#tags").css("height",tag_size);
        $("#expander").text("(Collapse)");
    }else{
        $("#tags").css("height","50");
        $("#expander").text("(Expand)");
    }
    
});