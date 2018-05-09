// client-side js
// run by the browser each time your view template is loaded
$(document).ready(function(){
  $.getJSON("/api/courses", function(data){
    console.log(data.data);
    for(var i = 0; data.data.length; i++){
      var available = data.data[i].available;
      $("ul").append('<li class="table-row"><div class="col col-2">' + data.data[i].courseCode+'</div><div class="col col-2">' 
                     + data.data[i].active + '/' + data.data[i].max + '</div><div class="col col-2">' + data.data[i].available);
      
    }
  });
});