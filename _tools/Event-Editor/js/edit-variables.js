$(function(){
    $('#new-variable').click( function(e) {
        $("#vars").append("<li class='var-li'><div class='btn btn-group center var-remove remove-choice'>x</div>Name<input value='' class='name'>Value<input value='' class='val'></li>");
    });
    
    $('#save-variables').click( function(e) {
        var vars = {};
        $(".var-li").each(function(idx,itm){
            var name;
            if($(itm).children(".name").is("input")) name = $(itm).children(".name").val();
            else name = $(itm).children(".name").text();
            var val = parseInt($(itm).children(".val").val());
            if(isNaN(val)) val = $(itm).children(".val").val();
            vars[name] = val;
        });
        var scene = $("#title").text();
        var type = $("#title2").text();
        var form = $('<form action="save-vars.php" method="post"></form>');
        if($("#title").text()){
            form.append('<input type="text" name="scene" value="'+scene+'">');
        }
        if($("#title2").text()){
            form.append('<input type="text" name="type" value="'+type+'">');
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
            form.append('<input type="text" name="type" value="'+$("#title2").text()+'">');
        } else {
            form = $('<form action="load.php" method="post"></form>');
        }
        $("body").append(form);
        form.submit();
    });
    
    $(document).on("click",".remove-choice",function(e){
        $(this).parent().remove();
    });
});