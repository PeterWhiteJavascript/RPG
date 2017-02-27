$(function(){
    
    $('#new-variable').click( function(e) {
        $("#vars").append("<li class='var-li'>Name<input value='' class='name'>Value<input value='' class='val'></li>");
    });
    
    $('#save-variables').click( function(e) {
        var vars = [];
        $(".var-li").each(function(idx,itm){
            var name;
            if($(itm).children(".name").is("input")) name = $(itm).children(".name").val();
            else name = $(itm).children(".name").text();
            vars.push({
                name:name,
                val:$(itm).children(".val").val()
            });
        });
        var scene = $("#title").text();
        var form = $('<form action="save-vars.php" method="post"></form>');
        if($("#title").text()){
            form.append('<input type="text" name="scene" value="'+scene+'">');
        }
        form.append("<input type='text' name='vrs' value='"+JSON.stringify(vars)+"'>");
        $("body").append(form);
        form.submit();
    });
    
    $('#footer a').click( function(e) {
        var form;
        if($("#title").text()){
            form = $('<form action="show-events.php" method="post"></form>');
            form.append('<input type="text" name="scene" value="'+$("#title").text()+'">');
        } else {
            form = $('<form action="load.php" method="post"></form>');
        }
        $("body").append(form);
        form.submit();
    });
});