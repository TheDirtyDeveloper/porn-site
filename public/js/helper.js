$("#search_b").click(function(){
    var search = $("#search").val();
    window.location.href = `http://localhost:3000/1/${search}`;
}); 