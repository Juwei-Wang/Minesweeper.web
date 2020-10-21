var Minesweeper = Minesweeper || function(){};

Minesweeper = (function() {

  //class 类
  var Settings = {
    easy: {x: 8, y: 8, mines: 10},
    mid: {x: 16, y: 16, mines: 40},
    hard: {x: 16, y: 30, mines: 99}
  },
  //用来存放mine的位置和状态
  positionArray = [],
  mineArray = [],
  firstuncover = true,
  mineNumber = 0,
  //难度
  resetLevel = 'easy',
  //雷盘
  $mineContainer = $('#mine-container'),
  //显示的雷数目
  $mineCount = $('.mine-count'),
  timer = false;


  // Creates the mine in the mine object
  //private function
  _createMines = function(level) {
    var rows = level.x,
        cols = level.y,
        mines = level.mines,
        i, j, mineIdx;

    //把每个棋子的状态存入棋盘
    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        // button status: 0-> closed, 1-> open, 2-> flagged
        //push() 方法将一个或多个元素添加到数组的末尾，并返回该数组的新长度。
        positionArray.push({x: i, y: j, mine: 0, status: 0});
      }
    }

    //随机分配固定数量的雷，放在雷数组里面
    while (mines) {
      mineIdx = Math.floor(Math.random() * positionArray.length);
      if (positionArray[mineIdx].mine === 0) {
        positionArray[mineIdx].mine = 1;
        console.log(mineIdx);
        mineArray.push(mineIdx);
        mines--;
      }
    }
  };

  _openButton = function(x, y, type) {
    var idx = _getButtonIdx(x, y),
        btn = positionArray[idx],
        //找到x y 在html里面的格子
        $btn = $('[data-x='+x+'][data-y='+y+']');

    if (type === 'explode') {
      $btn.addClass('exploded').append('*');
    } else {
      $btn.addClass('open');
      if (parseInt(type, 10)) {
        $btn.append(type);
      } else if (btn.mine) {
        $btn.append('*');
      }
    }
    positionArray[idx].status = 1;
    _hasWon();
  };

  //计时器
  _startTimer = function() {
    var $timer = $('.timer');
    $timer.text('001');

    timer = setInterval(function() {
      var newCount = parseInt($timer.text(), 10) + 1 + "";
      while (newCount.length < 3) newCount = "0" + newCount;
      $timer.text(newCount);
    }, 1000);
  };

  _stopTimer = function() {
    clearInterval(timer);
    timer = false;
  };


  //找到button在positionArray里面的index
  _getButtonIdx = function(x, y) {
    var index,
        //function(currentValue, index,arr) 必须。函数，数组中的每个元素都会执行这个函数
        res = positionArray.filter(function(el, idx) {
          if (el.x == x && el.y == y) {
            index = idx;
            return true;
          }
        });
    return (index >= 0) ? index : -1;
  };

  _getMinesInButton = function(x, y) {
    var idx = _getButtonIdx(x, y);
    return (positionArray[idx] && positionArray[idx].mine) || 0
  };

  // Returns the number of mines around the clicked button
  _checkSurroundingMines = function(x, y) {
    //parseInt(String s,int radix)的目的是输出一个十进制数，这个数字是“String s”但是我们要知道他是多少进制的
    var x = parseInt(x, 10),
        y = parseInt(y, 10),
        //如果positionArray[_getButtonIdx(x, y)]的值大于0或为true，那么就把b的值赋给a，否在就把0赋给a，这里的0也可以是其他变量
        btn = positionArray[_getButtonIdx(x, y)] || 0,
        topLeft,
        top,
        topRight,
        left,
        right,
        botLeft,
        bottom,
        botRight,
        numMines;

    // status = 0 closed
    if (btn && btn.status === 0) {
      topLeft =   _getMinesInButton(x - 1, y - 1);
      top =       _getMinesInButton(x, y - 1);
      topRight =  _getMinesInButton(x + 1, y - 1);
      left =      _getMinesInButton(x - 1, y);
      right =     _getMinesInButton(x + 1, y);
      botLeft =   _getMinesInButton(x - 1, y + 1);
      bottom =    _getMinesInButton(x, y + 1);
      botRight =  _getMinesInButton(x + 1, y + 1);

      numMines = topLeft +
                 top +
                 topRight +
                 left +
                 right +
                 botLeft +
                 bottom +
                 botRight;

      // btn.mine必须是0 说明这个格子没有雷 1就是有雷
      // 周围的雷大于0，并且自身不是雷
      // 如果周围也没有雷，则继续搜索并打开
      if (numMines && !btn.mine) {
        _openButton(x, y, numMines);
      } else if (!btn.mine) {
        _openButton(x, y);
        //setTimeout(function(){
        _checkSurroundingMines(x - 1, y - 1);
        _checkSurroundingMines(x, y - 1);
        _checkSurroundingMines(x + 1, y - 1);
        _checkSurroundingMines(x - 1, y);
        _checkSurroundingMines(x + 1, y);
        _checkSurroundingMines(x - 1, y + 1);
        _checkSurroundingMines(x, y + 1);
        _checkSurroundingMines(x + 1, y + 1);
        //}, 1000)
      }
    }
  };




  _flagButton = function(evt) {

    //方法阻止元素发生默认的行为
    evt.preventDefault();
    console.log("timer " + timer);
    if (!timer) _startTimer();

    var $el = $(this),
        //extract the x index of button
        x = parseInt($el.attr('data-x'), 10),
        //extract the y index of button
        y = parseInt($el.attr('data-y'), 10),
        //get the index from positionArray
        idx = _getButtonIdx(x, y),
        //get the array from positionArray
        btn = positionArray[idx],
        $btn = $('[data-x='+x+'][data-y='+y+']'),
        cu_status,
        mines = parseInt($mineCount.text(), 10);

    // button status: 0-> closed, 1-> open, 2-> flagged
    if (btn.status === 0) {
      positionArray[idx].status = 2;
      $mineCount.text(mines - 1);
      console.log("MM  " + _allMinesFlagged());
      for (let i = 0; i < mineArray.length; i++) {
        console.log("index " + i + "mine "+ mineArray[i]);
        console.log("status - mine" + positionArray[mineArray[i]].status);
      }

      console.log(idx + " current button status:" + positionArray[idx].status );
      if(_allMinesFlagged() === true){
        alert("you win!!")
      }
      _hasWon();
    } else if (btn.status === 2) {
      positionArray[idx].status = 0;
      $mineCount.text(mines + 1);
    }

    if($btn.hasClass('open')) {
      cu_status = $btn.attr('class');
    }else {
      cu_status = "not - defined";
    }
    if (cu_status != "open") {
      $btn.toggleClass('flagged');
    }
  };

  // Checks if mine, else triggers checks around the block
  _pressButton = function(evt) {
    var $el, x, y , btnIdx, btn;

    (console.log("timer " + timer));
    if (!timer) _startTimer();

    if (evt.which === 1) {
      $el = $(this);
      x = $el.attr('data-x');
      y = $el.attr('data-y');
      btnIdx = _getButtonIdx(x, y);
      btn = positionArray[btnIdx];



      if (btn.mine) {
        if(firstuncover === true){
          btn.mine = 0;
          console.log("Brfore" + mineArray);
          // for (let i = 0; i < mineArray.length; i++) {
          //   if (mineArray[i] === btnIdx){
          //     mineArray.splice(i);
          //   }
          // }

          //first move should be guaranteed to land on an empty square
          var mineIndex = mineArray.indexOf(btnIdx);
          if(mineIndex > -1){
            mineArray.splice(mineIndex,1);
          }
          console.log(mineArray);
          _checkSurroundingMines(x, y);
          firstuncover = false;
          $mineCount.text(mineNumber - 1);
        }else {
          _openButton(x, y, 'explode');
          _explodeMines();
          alert("Game Over!! Please reset your game");
        }
      } else {
        _checkSurroundingMines(x, y);
        firstuncover = false;
      }
    }

  };

  // Explodes all mines and disables all buttons
  _explodeMines = function() {
    var len = positionArray.length,
        i, btn;
    _stopTimer();
    for (i = 0; i < len; i++) {
      btn = positionArray[i];
      if (btn.mine && btn.status !== 1) {
        _openButton(btn.x, btn.y)
      }
    }
  };

  _allMinesFlagged = function() {
    for (i = 0; i < mineArray.length; i++) {
      if (positionArray[mineArray[i]].status != 2) {
        return false; }
    }
    return true;
  };

  _allBoxesOpen = function() {
    var btn;
    for (i = 0; i < positionArray.length; i++) {
      btn = positionArray[i];
      if (!btn.mine) {
        if (btn.status !== 1) {
          return false;
        }
      }
    }
    return true;
  };

  _hasWon = function() {
    if (_allMinesFlagged() || _allBoxesOpen()) {
      _stopTimer();
      _resetBoard();
      if(_allMinesFlagged() === true){
        alert("Game Over , you Win!!");
      }else {
        alert("Game Over");
      }
    }
  };




  // Removes the current board and its memory
  _cleanBoard = function() {
    positionArray = [];
    mineArray = [];
    firstuncover = true;
    $mineContainer.empty();
  };

  // Wipes the board and creates a new one
  _resetBoard = function(level) {
    _cleanBoard();
    _initBoard(level);
  };



  _init = function() {
    _initEvents();
    _initBoard();
  };

  var pressTimer;

  function press(){
    $("button").mouseup(function(){
      clearTimeout(pressTimer);
      // Clear timeout
      return false;
    }).mousedown(function(){
      // Set timeout
      pressTimer = window.setTimeout(function() {console.log('I have been pressed')},3000);
      return false;
    });
  }

  _initEvents = function() {

    //$(selector).on(event,childSelector,data,function)
    $('.level-select').on('click', 'button', function() {
      var $this = $(this),
          level = $this.attr('data-level');

      _stopTimer();
      resetLevel = level;
      _resetBoard(Settings[level]);
    });


    var tmr = 0;
    var islong = 0;
    // $mineContainer.on('mouseup', 'button', _pressButton);
    $mineContainer.on('contextmenu', 'button', _flagButton);
    $mineContainer.on('mousedown', 'button', function(e) {
      e.preventDefault();
      console.log("timer " + timer);
      if (!timer) _startTimer();
      var $kc = $(this),
          //extract the x index of button
          x = parseInt($kc.attr('data-x'), 10),
          //extract the y index of button
          y = parseInt($kc.attr('data-y'), 10);
      tmr = setTimeout(function () {
        _flagButton2(x,y);
        islong = 1;
      }, 2000);
    }).on('mouseup', 'button', function(e) {
      var $kc = $(this),
          //extract the x index of button
          x = parseInt($kc.attr('data-x'), 10),
          //extract the y index of button
          y = parseInt($kc.attr('data-y'), 10);
      console.log(islong);
      if(islong === 0){
        if(e.which === 1){
          _pressButton2(x,y)
        }
      }
      islong = 0;
      console.log(islong);
      clearTimeout(tmr);
    });


    $('.reset').on('click', function() {
      var level = resetLevel;
      _stopTimer();
      _startTimer();
      _resetBoard(Settings[level]);
    })
  };

  _flagButton2 = function(x,y) {
    var
        //get the index from positionArray
        idx = _getButtonIdx(x, y),
        //get the array from positionArray
        btn = positionArray[idx],
        $btn = $('[data-x='+x+'][data-y='+y+']'),
        cu_status,
        mines = parseInt($mineCount.text(), 10);

    // button status: 0-> closed, 1-> open, 2-> flagged
    if (btn.status === 0) {
      positionArray[idx].status = 2;
      $mineCount.text(mines - 1);
      console.log("MM  " + _allMinesFlagged());
      for (let i = 0; i < mineArray.length; i++) {
        console.log("index " + i + "mine "+ mineArray[i]);
        console.log("status - mine" + positionArray[mineArray[i]].status);
      }

      console.log(idx + " current button status:" + positionArray[idx].status );
      if(_allMinesFlagged() === true){
        alert("you win!!")
      }
      _hasWon();
    } else if (btn.status === 2) {
      positionArray[idx].status = 0;
      $mineCount.text(mines + 1);
    }

    if($btn.hasClass('open')) {
      cu_status = $btn.attr('class');
    }else {
      cu_status = "not - defined";
    }
    if (cu_status != "open") {
      $btn.toggleClass('flagged');
    }
  };

  _pressButton2 = function(x,y) {
    var $el, btnIdx, btn;

    (console.log("timer " + timer));
    if (!timer) _startTimer();
    btnIdx = _getButtonIdx(x, y);
    btn = positionArray[btnIdx];



      if (btn.mine) {
        if(firstuncover === true){
          btn.mine = 0;
          console.log("Brfore" + mineArray);
          // for (let i = 0; i < mineArray.length; i++) {
          //   if (mineArray[i] === btnIdx){
          //     mineArray.splice(i);
          //   }
          // }

          //first move should be guaranteed to land on an empty square
          var mineIndex = mineArray.indexOf(btnIdx);
          if(mineIndex > -1){
            mineArray.splice(mineIndex,1);
          }
          console.log(mineArray);
          _checkSurroundingMines(x, y);
          firstuncover = false;
          $mineCount.text(mineNumber - 1);
        }else {
          _openButton(x, y, 'explode');
          _explodeMines();
          alert("Game Over!! Please reset your game");
        }
      } else {
        _checkSurroundingMines(x, y);
        firstuncover = false;
      }

  };

  // Render the board
  _initBoard = function(level) {
    var _level = level || Settings.easy,
        dificulty = (_level.mines === 10) ? 'easy' : ((_level.mines === 40) ? 'mid' : 'hard'),
        i, mine, button;

    // This method is often used with .addClass() to switch elements' classes from one to another
    $mineContainer.parent().removeClass().addClass(dificulty);
    $mineCount.text(_level.mines);
    mineNumber = _level.mines;
    //开始画雷盘
    _createMines(_level);
    for (i = 0; i < positionArray.length; i++) {
      mine = positionArray[i];
      button = '<button data-x="' + mine.x + '" data-y="' +  mine.y + '">';
      button += '</button>';
      $mineContainer.append(button);
    }
  };

  return {
    init: _init,
    g: _getButtonIdx
  }

}());

(function() {
  Minesweeper.init();
})();
