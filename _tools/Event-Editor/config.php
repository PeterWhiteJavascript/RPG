<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-type" content="text/html; charset=utf-8" />

<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<link href='https://fonts.googleapis.com/css?family=Kalam' rel='stylesheet'>

<script src="lib/jquery-3.1.1.js"></script>
<script src="lib/jquery-ui.min.js"></script>
<script src="lib/jquery.connections.min.js"></script>
<script src="lib/js.cookie.js"></script>

<script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.0.3/js/bootstrap.min.js"></script>
<link href="http://cdn.rawgit.com/davidstutz/bootstrap-multiselect/master/dist/css/bootstrap-multiselect.css" rel="stylesheet" type="text/css" />
<script src="http://cdn.rawgit.com/davidstutz/bootstrap-multiselect/master/dist/js/bootstrap-multiselect.js" type="text/javascript"></script>
<link rel="stylesheet" href="css/new-style.css">
<script>
    var COOKIECOLORS = [
        ["background-color","Main Background"],
        ["menu-background-color","Menu Background"],
        ["menu-text-color","Menu Text"],
        ["menu-button-hover-color","Menu Button Hover"],
        ["button-text-color","Category Button Text"],
        ["button-background-color","Category Button BG"],
        ["button-hover-color","Category Hover Button"],
        ["content-button-text-color","Content Button Text"],
        ["content-button-background-color","Content Button BG"],
        ["content-button-hover-color","Content Hover Button"],
        ["form-elm-text-color","Form Element Text"],
        ["form-elm-background-color","Form Element BG"],
        ["heading-font-family","Heading Font"],
        ["heading-text-color","Heading Text"],
        ["heading-gradient-one","Heading Gradient 1"],
        ["heading-gradient-two","Heading Gradient 2"]
    ];
    $(function(){
        for(var i=0;i<COOKIECOLORS.length;i++){
            var id = COOKIECOLORS[i][0];
            var color = Cookies.get(id);
            $("body").get(0).style.setProperty("--"+id, color);
        }
    });
</script>
<link rel="stylesheet" href="css/UIController.css">
<script src="js/UIController.js"></script>