// Bake-off #2 -- Seleção em Interfaces Densas
// IPM 2023-24, Período 3
// Entrega: até às 23h59, dois dias úteis antes do sexto lab (via Fenix)
// Bake-off: durante os laboratórios da semana de 18 de Março

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER        = 46;      // Add your group number here as an integer (e.g., 2, 3)
const RECORD_TO_FIREBASE  = true;  // Set to 'true' to record user results to Firebase

// Pixel density and setup variables (DO NOT CHANGE!)
let PPI, PPCM;
const NUM_OF_TRIALS       = 12;     // The numbers of trials (i.e., target selections) to be completed
let continue_button;
let legendas;                       // The item list from the "legendas" CSV

// Metrics (DO NOT CHANGE!)
let testStartTime, testEndTime;     // time between the start and end of one attempt (8 trials)
let hits 			      = 0;      // number of successful selections
let misses 			      = 0;      // number of missed selections (used to calculate accuracy)
let database;                       // Firebase DB  

// Study control parameters (DO NOT CHANGE!)
let draw_targets          = false;  // used to control what to show in draw()
let trials;                         // contains the order of targets that activate in the test
let current_trial         = 0;      // the current trial number (indexes into trials array above)
let attempt               = 0;      // users complete each test twice to account for practice (attemps 0 and 1)

// Target list and layout variables
let targets               = [];
const GRID_ROWS           = 8;      // We divide our 80 targets in a 8x10 grid
const GRID_COLUMNS        = 10;     // We divide our 80 targets in a 8x10 grid

// Attempt progress bar
let results = []; 
let progressPos = 0;
let progressInc = 0;               // ajusted in windowResized()

// Sounds
let correct_sound;
let incorrect_sound;

// Ensures important data is loaded before the program starts
function preload()
{
  // id,name,...
  legendas = loadTable('legendas.csv', 'csv', 'header');

  // Load sounds
  correct_sound = loadSound('correct.mp3');
  incorrect_sound = loadSound('incorrect.mp3');
}

// Runs once at the start
function setup()
{
  createCanvas(700, 500);    // window size in px before we go into fullScreen()
  frameRate(60);             // frame rate (DO NOT CHANGE!)

  sortTable();               // sorts the table alphabetically 
  
  randomizeTrials();         // randomize the trial order at the start of execution
  drawUserIDScreen();        // draws the user start-up screen (student ID and display size)
}

// Runs every frame and redraws the screen
function draw()
{
  if (draw_targets && attempt < 2)
  {     
    // The user is interacting with the 6x3 target grid
    background(color(0,0,0));        // sets background to black

    // Draws rectangles for the cities with the same second letter
    drawBox();
  
    // Print trial count at the top left-corner of the canvas
    textFont("Arial", 16);
    fill(color(255,255,255));
    textAlign(LEFT);
    text("Trial " + (current_trial + 1) + " of " + trials.length, 30, 28);

    // Attempt progress bar
    progressPos = 0;
    for (let i = 0; i < results.length; i++) {
      fill(results[i] ? color(60, 200, 60) : color(200, 20, 20));
      rect(progressPos, 0, progressInc, 12, 5);
      progressPos += progressInc;
    }

    // Draw all targets
	  for (var i = 0; i < legendas.getRowCount(); i++) 
    {    
      targets[i].draw();

      // Draw the category options
      for (var j = legendas.getRowCount(); j < legendas.getRowCount() + 18; j++){
        targets[j].draw();
      }

      // Draws the target label to be selected in the current trial. We include 
      // a black rectangle behind the trial label for optimal contrast in case 
      // you change the background colour of the sketch (DO NOT CHANGE THESE!)
      fill(color(0,0,0));
      rect(0, height - 40, width, 40);
  
      textFont("Arial", 20); 
      fill(color(255,255,255)); 
      textAlign(CENTER); 
      text(legendas.getString(trials[current_trial],1), width/2, height - 20);
    }
  }
}

// Print and save results at the end of 54 trials
function printAndSavePerformance()
{
  // DO NOT CHANGE THESE! 
  let accuracy			= parseFloat(hits * 100) / parseFloat(hits + misses);
  let test_time         = (testEndTime - testStartTime) / 1000;
  let time_per_target   = nf((test_time) / parseFloat(hits + misses), 0, 3);
  let penalty           = constrain((((parseFloat(95) - (parseFloat(hits * 100) / parseFloat(hits + misses))) * 0.2)), 0, 100);
  let target_w_penalty	= nf(((test_time) / parseFloat(hits + misses) + penalty), 0, 3);
  let timestamp         = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();
  
  textFont("Arial", 18);
  background(color(0,0,0));   // clears screen
  fill(color(255,255,255));   // set text fill color to white
  textAlign(LEFT);
  text(timestamp, 10, 20);    // display time on screen (top-left corner)
  
  textAlign(CENTER);
  text("Attempt " + (attempt + 1) + " out of 2 completed!", width/2, 60); 
  text("Hits: " + hits, width/2, 100);
  text("Misses: " + misses, width/2, 120);
  text("Accuracy: " + accuracy + "%", width/2, 140);
  text("Total time taken: " + test_time + "s", width/2, 160);
  text("Average time per target: " + time_per_target + "s", width/2, 180);
  text("Average time for each target (+ penalty): " + target_w_penalty + "s", width/2, 220);

  // Saves results (DO NOT CHANGE!)
  let attempt_data = 
  {
        project_from:       GROUP_NUMBER,
        assessed_by:        student_ID,
        test_completed_by:  timestamp,
        attempt:            attempt,
        hits:               hits,
        misses:             misses,
        accuracy:           accuracy,
        attempt_duration:   test_time,
        time_per_target:    time_per_target,
        target_w_penalty:   target_w_penalty,
  }
  
  // Sends data to DB (DO NOT CHANGE!)
  if (RECORD_TO_FIREBASE)
  {
    // Access the Firebase DB
    if (attempt === 0)
    {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }
    
    // Adds user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
}

// Mouse button was pressed - lets test to see if hit was in the correct target
function mousePressed() {
  // Only look for mouse releases during the actual test
  // (i.e., during target selections)
  if (draw_targets) {
    // Check if the user has clicked on a target
    for (var i = 0; i < legendas.getRowCount(); i++) {
      // Check if the user clicked over one of the targets
      if (targets[i].clicked(mouseX, mouseY)) {
        // Checks if it was the correct target
        if (areEqual(targets[i].id,trials[current_trial] + 1)) { 
          correct_sound.play();
          results.push(true);
          hits++;
        } else {
          incorrect_sound.play();
          results.push(false);
          misses++;
        }  

        showAllTargets();
        current_trial++;              // Move on to the next trial/target
        break;
      }
    }

    // Check if the user has clicked on a category
    for (var j = legendas.getRowCount(); j < legendas.getRowCount() + 18; j++) {
      if (targets[j].clicked(mouseX, mouseY)) {
        showAllTargets();
        letter = targets[j].getLetter();
        showMatches(letter);
      }
    }
    
    // Check if the user has completed all trials
    if (current_trial === NUM_OF_TRIALS) {
      testEndTime = millis();
      draw_targets = false;          // Stop showing targets and the user performance results
      printAndSavePerformance();     // Print the user's results on-screen and send these to the DB
      attempt++;                      
      
      // If there's an attempt to go create a button to start this
      if (attempt < 2) {
        continue_button = createButton('START 2ND ATTEMPT');
        continue_button.mouseReleased(continueTest);
        continue_button.position(width/2 - continue_button.size().width/2, height/2 - continue_button.size().height/2);
      }
    }
    // Check if this was the first selection in an attempt
    else if (current_trial === 1) testStartTime = millis(); 
  }
}

// Evoked after the user starts its second (and last)
function continueTest()
{
  // Re-randomize the trial order
  randomizeTrials();
  
  // Resets performance variables
  hits = 0;
  misses = 0;
  
  current_trial = 0;
  continue_button.remove();

  // Resets the results array
  results = [];

  // Resets the state of all targets
  for (var i = 0; i < legendas.getRowCount(); i++) {
    targets[i].selected = false;
  }

  // Shows the targets again
  draw_targets = true; 
}

// Creates and positions the UI targets
function createTargets(target_size, horizontal_gap, vertical_gap)
{
  // Define the margins between targets by dividing the white space 
  // for the number of targets minus one
  h_margin = horizontal_gap / (GRID_COLUMNS -1);
  v_margin = vertical_gap / (GRID_ROWS - 1);
  
  // Set targets in a 8 x 10 grid
  for (var r = 0; r < GRID_ROWS; r++)
  {
    for (var c = 0; c < GRID_COLUMNS; c++)
    {
      let target_x = 40 + (h_margin + target_size) * c + target_size/2;        // give it some margin from the left border
      let target_y = (v_margin + target_size) * r + target_size/2;
      
      // Find the appropriate label and ID for this target
      let legendas_index = c + GRID_COLUMNS * r;
      let target_id = legendas.getNum(legendas_index, 0);  
      let target_label = legendas.getString(legendas_index, 1);   
      
      let target = new Target(target_x, target_y + 40, target_size, target_label, target_id);
      targets.push(target);
    }  
  }

    // Creates category options (last letter)
    let lastLetters = ['a', 'd','e', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'r', 's', 't', 'u', 'v', 'y', 'z'];
    let category_size = target_size * 0.4; 
    let category_h_gap = horizontal_gap / GRID_COLUMNS * 0.5
    let category_v_gap = vertical_gap / (GRID_ROWS) * 21.5; 
  
    for (let i = 0; i < 18; i++) {
      let category_x = PPCM + category_size * 5 + (category_h_gap + category_size) * i 
      let category_y = targets[70].getY() + targets[70].getHeigth()* 0.65
  
      let category_id = i; 
      let letter = lastLetters[i];
      let category = new Category(category_x, category_y, category_size, category_id, letter);
      targets.push(category);
    }
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized() 
{
  if (fullscreen())
  {
    resizeCanvas(windowWidth, windowHeight);
    
    // DO NOT CHANGE THE NEXT THREE LINES!
    let display        = new Display({ diagonal: display_size }, window.screen);
    PPI                = display.ppi;                      // calculates pixels per inch
    PPCM               = PPI / 2.54;                       // calculates pixels per cm
  
    // Make your decisions in 'cm', so that targets have the same size for all participants
    // Below we find out out white space we can have between 2 cm targets
    let screen_width   = display.width * 2.54;             // screen width
    let screen_height  = display.height * 2.54;            // screen height
    let target_size    = 2;                                // sets the target size (will be converted to cm when passed to createTargets)
    let horizontal_gap = screen_width - target_size * GRID_COLUMNS;// empty space in cm across the x-axis (based on 10 targets per row)
    let vertical_gap   = screen_height - target_size * GRID_ROWS - 0.6;  // empty space in cm across the y-axis (based on 8 targets per column)

    // Creates and positions the UI targets according to the white space defined above (in cm!)
    // 80 represent some margins around the display (e.g., for text)
    createTargets(target_size * PPCM, horizontal_gap * PPCM - 80, vertical_gap * PPCM - 80);

    // Starts drawing targets immediately after we go fullscreen
    draw_targets = true;

    // Adjusts the progress bar increment
    progressInc = width / NUM_OF_TRIALS
  }
}

// Draws a rectangle behind cities with the same second letter
function drawBox() {
  textFont("Cambria", 36);
  let horizontal_gap = targets[1].getX() - targets[0].getX();
  let box_height = targets[0].getHeigth();

  // Ba boxes
  fill((color(101,24, 217)));
  text('A', targets[0].getX() - targets[0].getWidth() * 4/5, targets[0].getY());
  rect(targets[0].getX() - targets[0].getWidth() * 1.3 / 2, (targets[0].getY() - box_height / 2 ) * 0.9, horizontal_gap * 10, box_height, 10);
  rect(targets[10].getX() - targets[10].getWidth(), (targets[10].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 11, box_height, 10);
  rect(targets[20].getX() - targets[20].getWidth(), (targets[20].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 7, box_height, 10);

  // Be boxes
  fill((color(237, 191, 38)));
  text('E', targets[27].getX() - targets[27].getWidth() * 4/5, targets[27].getY());
  rect(targets[27].getX() - targets[27].getWidth() * 1.3 / 2, (targets[27].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 3, box_height, 10);
  rect(targets[30].getX() - targets[30].getWidth(), (targets[30].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 8, box_height, 10);

  // Bh boxes
  fill((color(54, 204, 209)));
  text('H', targets[38].getX() - targets[38].getWidth() * 4/5, targets[38].getY());
  rect(targets[38].getX() - targets[38].getWidth() * 1.3 / 2, (targets[38].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 2, box_height, 10);
  rect(targets[40].getX() - targets[40].getWidth(), (targets[40].getY() - box_height * 1.1 / 2 ) , horizontal_gap, box_height, 10);

  // Bi boxes
  fill((color(237, 24, 49)));
  text('I', targets[41].getX() - targets[41].getWidth() * 4/5, targets[41].getY());
  rect(targets[41].getX() - targets[41].getWidth() * 1.3 / 2, (targets[41].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 9, box_height, 10);

  // Bl boxes
  fill((color(24, 237, 59)));
  text('L', targets[50].getX() - targets[50].getWidth() * 4/5, targets[50].getY());
  rect(targets[50].getX() - targets[50].getWidth() * 1.3 / 2, (targets[50].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 0.8, box_height, 10);

  // Bn boxes
  fill((color(243, 71, 255)));
  text('N', targets[51].getX() - targets[51].getWidth() * 4/5, targets[51].getY());
  rect(targets[51].getX() - targets[51].getWidth() * 1.3 / 2, (targets[51].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 0.8, box_height, 10);

  // Bo boxes
  fill((color(7, 38, 237)));
  text('O', targets[52].getX() - targets[52].getWidth() * 4/5, targets[52].getY());
  rect(targets[52].getX() - targets[52].getWidth() * 1.3 / 2, (targets[52].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 3.8, box_height, 10);

  // Br boxes
  fill((color(200, 200, 200)));
  text('R', targets[56].getX() - targets[56].getWidth() * 4/5, targets[56].getY());
  rect(targets[56].getX() - targets[56].getWidth() * 1.3 / 2, (targets[56].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 6, box_height, 10);
  rect(targets[60].getX() - targets[60].getWidth(), (targets[60].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 9, box_height, 10);

  // Bu boxes
  fill((color(255, 140, 0)));
  text('U', targets[69].getX() - targets[69].getWidth() * 4/5, targets[69].getY());
  rect(targets[69].getX() - targets[69].getWidth() * 1.3 / 2, (targets[69].getY() - box_height * 1.1 / 2 ) , horizontal_gap, box_height, 10);
  rect(targets[70].getX() - targets[70].getWidth(), (targets[70].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 9, box_height, 10);

  // By boxes
  fill((color(255, 51, 153)));
  text('Y', targets[79].getX() - targets[79].getWidth() * 4/5, targets[79].getY());
  rect(targets[79].getX() - targets[79].getWidth() * 1.3 / 2, (targets[79].getY() - box_height * 1.1 / 2 ) , horizontal_gap * 0.8, box_height, 10);
}

// Sorts the table alphabeticallt by the name of the city (second column)
function sortTable() {
  for (var i = 0; i < legendas.getRowCount(); i++) {
    for (var j = i + 1; j < legendas.getRowCount(); j++) {
      if (legendas.getString(i, 1).localeCompare(legendas.getString(j, 1)) > 0) {
        let temp = legendas.getString(i, 1);
        legendas.setString(i, 1, legendas.getString(j, 1));
        legendas.setString(j, 1, temp);
      }
    }
  }
}

// Compares two characters and returns true if they are equal
function areEqual(char1, char2) {
  return char1 === char2 || 
    (char1 === 'e' && char2 === 'é') || (char1 === 'é' && char2 === 'e') ||
    (char1 === 'a' && char2 === 'á') || (char1 === 'á' && char2 === 'a');
}

function showMatches(letter) {
  for (var i = 0; i < legendas.getRowCount(); i++) {
    targets[i].hideTarget(letter);
  }
}

function showAllTargets() { 
  for (var i = 0; i < legendas.getRowCount(); i++) {
    targets[i].showTarget();
  }
}
