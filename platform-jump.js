var executedGame = false;

function checkMobile() {
    if( screen.width <= 768 ) {
        alert("WARNING \nThis site is not compatable with mobile devices!");
    }
}

function run() {
    if (!executedGame) {
        executedGame = true;

        const RIGHTARROW_KEYCODE = 39;
        const LEFTARROW_KEYCODE = 37;
        const UPARROW_KEYCODE = 38;
        const DOWNARROW_KEYCODE = 40;

        var _left_key_down = false; //in game for multiple keys at once
        var _right_key_down = false;
        var _down_key_down = false;
        var _up_key_down = false;

        var canvas = document.querySelector("canvas");
        canvas.width = 1450;
        canvas.height = 650;

        var c = canvas.getContext("2d"); //c stands for context

        var games_won = 0;
        var games_lost = 0;

        var platforms = [];
        var PF_HEIGHT = 10; // pf stands for platform
        var PF_WIDTH = 150; // pf stands for platform

        var player = "";
        var PLAYER_SIZE = 30;

        var goal = "";
        var GOAL_SIZE = 25;

        // GLOBAL FUNCTIONS

        // shortcut function to make code more readable
        function byID(e) {
            return document.getElementById(e);
        }

        // shortcut function to make code more readable
        function updateByID(element, update) {
            if (element === "wins") {
                byID(element).innerHTML = update;
            } else if (element === "losses") {
                byID(element).innerHTML = update;
            }
        }

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function navigate(keys, pressed) {
            switch (keys) {
            case RIGHTARROW_KEYCODE:
                _right_key_down = pressed;
                break;
            case LEFTARROW_KEYCODE:
                _left_key_down = pressed;
                break;
            case UPARROW_KEYCODE:
                _up_key_down = pressed;
                break;
            case DOWNARROW_KEYCODE:
                _down_key_down = pressed;
                break;
            }
        }

        var Rectangle = function (x, y, width, height, color) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
        };

        Rectangle.prototype = {

            draw: function () {// draws rectangle to canvas
                c.beginPath();
                c.rect(this.x, this.y, this.width, this.height);
                c.fillStyle = this.color;
                c.fill();
            },

            circledraw: function () {
                c.beginPath();
                c.arc(this.x, this.y, this.width, 0, Math.PI * 2);
                c.fillStyle = this.color;
                c.fill();
            },

            // get the four side coordinates of the rectangle
            get bottom() {
                return this.y + this.height;
            },
            get left() {
                return this.x;
            },
            get right() {
                return this.x + this.width;
            },
            get top() {
                return this.y;
            },

            testCollision: function (rectangle) {
                if (
                    this.top > rectangle.bottom ||
                    this.right < rectangle.left ||
                    this.bottom < rectangle.top ||
                    this.left > rectangle.right
                ) {
                    return false;
                }
                return true;
            }
        };

        // GAME FUNCTIONS
        function resetPlayer() {
            _left_key_down = false; // alerts will mess things up without these
            _right_key_down = false;
            _down_key_down = false;
            _up_key_down = false;
            player.x = platforms[0].x + (PF_WIDTH / 2) - (PLAYER_SIZE / 2);
            player.y = platforms[0].y - PF_HEIGHT - (PLAYER_SIZE);
            player.jumping = true;
            player.x_velocity = 0;
            player.y_velocity = 0;
        }

        function createObjects(pfnumber) {
            platforms = [];
            var i = 0;
            var x = 0;
            var y = 0;
            while (i < pfnumber) {
                i += 1;
                y = getRandomInt((PLAYER_SIZE * 2), (canvas.height - PF_HEIGHT));
                x = getRandomInt(0, (canvas.width - PF_WIDTH));
                platforms.push(new Rectangle(x, y, PF_WIDTH, PF_HEIGHT, "black"));
            }
            platforms.sort(function (a, b) {
                return a.x - b.x;
            });

            player = new Rectangle(0, 0, PLAYER_SIZE, PLAYER_SIZE, "blue");
            resetPlayer();
            x = platforms[platforms.length - 1].x + (PF_WIDTH / 2);
            y = platforms[platforms.length - 1].y - PF_HEIGHT - (GOAL_SIZE);
            goal = new Rectangle(x, y, GOAL_SIZE, GOAL_SIZE, "yellow");
        }

        function updateScreen() {
            c.clearRect(0, 0, canvas.width, canvas.height);
            platforms.forEach(function (a) {
                a.draw();
            });
            goal.circledraw();
            player.draw();
        }

        function documentEvents() {
            document.addEventListener("keydown", function (key_event) {
                navigate(key_event.which, true);
            });
            document.addEventListener("keyup", function (key_event) {
                navigate(key_event.which, false);
            });
            byID("newlevel").addEventListener("click", function () {
                createObjects(byID("difficulty").value);
            });
            byID("difficulty").addEventListener("change", function () {
                createObjects(byID("difficulty").value);
                games_won = 0;
                games_lost = 0;
                updateByID("wins", games_won);
                updateByID("losses", games_lost);
            });
        }

        function checkCheck() {
            if (byID("autolevel").checked) {
                createObjects(byID("difficulty").value);
            } else {
                resetPlayer();
            }
        }

        function collisionCheck() {
            if (player.x < 0) {
                player.x = 0;
            }
            if (player.y < 0) {
                player.y = 0;
            }
            if (player.x + PLAYER_SIZE > canvas.width) {
                player.x = canvas.width - PLAYER_SIZE;
            }
            if (player.y + PLAYER_SIZE > canvas.height + (PLAYER_SIZE * 2)) {
                games_lost += 1;
                updateByID("losses", games_lost);
                alert("Game Over. \nTry again?");
                checkCheck();
            }

            platforms.forEach(function (a) {
                if ((
                    player.testCollision(a)
                ) && (
                    player.y_velocity >= 0
                ) && (
                    !_down_key_down
                )) {
                    player.y_velocity = 0;
                    player.jumping = false;
                    player.y = a.y - PLAYER_SIZE;
                }
            });

            if (player.testCollision(goal)) {
                games_won += 1;
                updateByID("wins", games_won);
                alert("YOU WIN! \nContinue Playing?");
                checkCheck();
            }
        }

        function movePlayer() {
            if (_up_key_down && !player.jumping) {
                player.y_velocity -= 40;
                player.jumping = true;
            }

            if (_down_key_down) {
                player.y += 5;
            }

            if (_left_key_down) {
                player.x_velocity -= 0.8;
            }

            if (_right_key_down) {
                player.x_velocity += 0.8;
            }

            player.y_velocity += 1.5;// gravity
            player.x += player.x_velocity;
            player.y += player.y_velocity;
            player.x_velocity *= 0.9;// friction
            player.y_velocity *= 0.9;// friction
        }

        var loop = function () {
            updateScreen();
            collisionCheck();
            movePlayer();

        };

        // CALLING GAME FUNCTIONS
        byID("autolevel").checked = true;
        createObjects(byID("difficulty").value);
        documentEvents();
        setInterval(loop, 15);
    }
}