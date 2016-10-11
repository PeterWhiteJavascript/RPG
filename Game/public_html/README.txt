Here's a description of what goes in each folder:

audio  - Music Files. Split into BGM and SFX.
css    - Cascading Style Sheets. This will probably be used very little.
data   - Assets such as .tmx (Tiled map files) and JSON data/story files.
images - All images files. Split into ui and sprites
js     - Most javascript files go here.
lib    - Any libraries that we are using.

There is a complex mechanism for showing dialogue.
I will create a "text editor" so non-coders can have an easy time creating scenes.
For now, I'll create a sample scene in act1_1.json.

The game will run through the sections in this order:
    Dialogue
        Display BG image
        Loop through interaction and display text/do function
        Once all text is done, load the battle
    Battle
        Load .tmx map
        Load enemies/pickups/interactables
        Display squares where player units can be placed
        Center viewport on the first placement square
        Give the user control to place characters
        Once the user confirms that his units are placed correctly, start the battle
        Once all enemies are defeated, go through the menus interaction
    Menus
        Similar to dialogue, display BG image and loop through interaction
        Once the interaction is done, check the location and load the menus for that location.
        The data for the location is stored in locations.json
        There will be an option to go to the next area from these menus
        Repeat the process