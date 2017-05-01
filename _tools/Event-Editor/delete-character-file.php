<?php
unlink('../../data/json/story/characters/'.$_POST['file-name']);
header("Location: select-characters-file.php");