// title:  Water Balls
// author: Thiago Navarro
// desc:   Organize these balls now!
// script: js

// CONFIGS
const canAuto = !false

var pauseBtn = 5

const screen = { h: 136, w: 240 },
  screenCenter = { h: screen.h / 2, w: screen.w / 2 },
  tileSize = 8,
  transparentColor = 0,
  bgColor = 12,
  shadowColor = 13,
  invertSides = false,
  playerQnt = 1
;(maxScore = tries = 0),
  (autoPickup = autoDrop = oautoPickup = oautoDrop = false),
  (margin = {
    top: 10,
    bottom: 20,
    left: 10,
  })

var //MENU
  menuItems = {
    "Start New Game": startGame,
    Players: function () {
      playerQnt = playerQnt == 1 ? 2 : 1
    },
    "Invert sides: ": function () {
      invertSides = !invertSides
    },
    Controls: showControls,
    "Reset Stats": function () {
      maxScore = 0
      tries = 0
      players.resetStat()
      pots.resetStat()
      balls = []
      saveMem()
    },
  },
  menuItemsKeys = Object.keys(menuItems)
if (canAuto) {
  menuItems["Auto Pickup:"] = function () {
    oautoPickup = !oautoPickup
  }
  menuItems["Auto Drop:"] = function () {
    oautoDrop = !oautoDrop
  }
  menuItemsKeys = Object.keys(menuItems)
}
const menuConfig = {
    selected: "> $ <",
    unselected: "  $",
    x: 47,
    y: 50,
    gap: 10,
  },
  menuSelected = 0

function updateConfig() {
  if (invertSides) {
    keybinds[2] = {
      //multiplayer
      0: {
        //out
        back: 6,
        forward: 5,
        action: 4,
      },
      1: {
        //in
        back: 0,
        forward: 1,
        action: 3,
      },
    }

    pauseBtn = playerQnt > 1 ? 7 : 5
  } else {
    keybinds[2] = {
      //multiplayer
      0: {
        //out
        back: 2,
        forward: 3,
        action: 1,
      },
      1: {
        //in
        back: 7,
        forward: 4,
        action: 6,
      },
    }
    pauseBtn = 5
  }
}

//save
const mem_maxScore = 0,
  mem_tries = 1

function saveMem() {
  pmem(mem_maxScore, maxScore)
  pmem(mem_tries, tries)
}
function getMem() {
  maxScore = pmem(mem_maxScore)
  tries = pmem(mem_tries)
}

// dificulty
var score = 0 // def here for correct first calc
var ballMinSpeed = 0.5,
  ballMaxSpeed = 1,
  ballMaxSpawn = 1,
  ballSpawnTicks = 200,
  invSize = 4

function updateDifficulty() {
  ballMaxSpeed = 1 + score / 70
  ballMinSpeed = 0.5 + score / 100

  ballMaxSpawn = 1 + Math.floor(score / 10)
  if (ballMaxSpawn > 10) ballMaxSpawn = 10
  ballSpawnTicks = 200 - score * 2
  if (ballSpawnTicks < 1) ballSpawnTicks = 1
  players.speed = 1 + score / 50
  if (players.speed > 4) players.speed = 4

  players.invSize = invSize + Math.floor(score / 20)
}

function copy(obj) {
  const keys = Object.keys(obj)
  var result = {}
  if (Array.isArray(obj)) result = []
  for (var i = 0; i < keys.length; i++) {
    const k = keys[i],
      v = obj[k]
    if (typeof v == "object") result[k] = copy(v)
    else result[k] = v
  }
  return result
}
// UTILS
function newSpr(id, w, h, scale) {
  scale = scale ? scale : 2
  w = w ? w : 1
  h = h ? h : 1
  return [id, w, h, scale]
}
function newMap(x, y, w, h, scale) {
  scale = scale ? scale : 2
  return [x, y, w, h, scale]
}
function spriteSize(s) {
  return {
    w: s[1] * tileSize * s[3],
    h: s[2] * tileSize * s[3],
  }
}
function mapSize(s) {
  return {
    w: s[2] * tileSize * s[4],
    h: s[3] * tileSize * s[4],
  }
}
function drawSpr(s, x, y, flip, rot) {
  rot = rot ? rot : 0
  flip = flip ? flip : 0
  spr(s[0], x, y, transparentColor, s[3], flip, rot, s[1], s[2])
}
function drawMap(m, x, y, flip, rot) {
  rot = rot ? rot : 0
  flip = flip ? flip : 0
  map(
    m[0],
    m[1],
    m[2],
    m[3],
    x,
    y,
    transparentColor,
    m[4],
    function (tile, x, y) {
      if (m[2] == 1 && m[3] == 1) return [tile, flip, rot]
      return tile
    }
  )
}

function b2s(v) {
  return v ? "yes" : "no"
}

//colision
function overlaps(p1, len1, p2, len2) {
  const high = Math.max(p1, p2)
  const low = Math.min(p1 + len1, p2 + len2)
  return high < low
}
function collide(a, b) {
  if (
    overlaps(a.pos.x, a.size.w - 4, b.pos.x, b.size.w) &&
    overlaps(a.pos.y, a.size.h - 4, b.pos.y, b.size.h)
  )
    return true
  return false
}

// SPRITES
const sprite = {
  players: {
    out: newMap(31, 0, 2, 1, 1),
    inp: newMap(33, 0, 1, 2, 1),
  },
  placeholder: {
    ball: newMap(33, 3, 1, 1, 1),
    pot: newMap(34, 3, 1, 2, 1),
  },
  balls: {
    red: newMap(30, 1, 1, 1, 1),
    green: newMap(30, 2, 1, 1, 1),
    blue: newMap(30, 3, 1, 1, 1),
    orange: newMap(30, 4, 1, 1, 1),
    yellow: newMap(30, 5, 1, 1, 1),
    cyan: newMap(30, 6, 1, 1, 1),
    lightBlue: newMap(30, 7, 1, 1, 1),
    black: newMap(30, 8, 1, 1, 1),
    purple: newMap(30, 9, 1, 1, 1),
  },
  pots: {
    red: newMap(31, 1, 2, 1, 1),
    green: newMap(31, 2, 2, 1, 1),
    blue: newMap(31, 3, 2, 1, 1),
    orange: newMap(31, 4, 2, 1, 1),
    yellow: newMap(31, 5, 2, 1, 1),
    cyan: newMap(31, 6, 2, 1, 1),
    lightBlue: newMap(31, 7, 2, 1, 1),
    black: newMap(31, 8, 2, 1, 1),
    purple: newMap(31, 9, 2, 1, 1),
  },
}

const colors = Object.keys(sprite.balls)
function randColor() {
  return colors[Math.floor(Math.random() * colors.length)]
}

var t = 0,
  rt = 0

function getPlayerSprite(type) {
  return type == 1 ? sprite.players.inp : sprite.players.out
}

function parsePos(pos, size, type) {
  if (type == 1)
    if (invertSides) return { x: pos.y + margin.left, y: pos.x }
    else return { x: pos.y + screen.w - size.w - margin.left, y: pos.x }

  return { x: pos.x, y: pos.y + margin.top }
}

//{playerQnt:{player{keybind:keycode}}}
const keybinds = {
  1: {
    //singleplayer
    0: {
      //out
      back: 2,
      forward: 3,
      action: 4,
    },
    1: {
      //inp
      back: 0,
      forward: 1,
      action: 6,
    },
  },
  2: {
    //multiplayer
    0: {
      //out
      back: 2,
      forward: 3,
      action: 1,
    },
    1: {
      //in
      back: 7,
      forward: 4,
      action: 6,
    },
  },
}

function handleKeys(player, type) {
  const keybind = keybinds[playerQnt][type]
  player.acc.x = btn(keybind.forward) ? 1 : btn(keybind.back) ? -1 : 0
  player.actionp = btn(keybind.action)
}

//returns true if a is closer than b
function closer(than, a, b) {
  function close(t, a, b) {
    if (!invertSides) return t - a < t - b
    else return t - b < t - a
  }
  if (close(than.x, a.x, b.x) && close(than.y, a.y, b.y)) return true
  return false
}

function getNearObj(obj, pos) {
  if (obj.length < 1) return false
  var result = obj[0]
  for (var i = 0; i < obj.length; i++) {
    const item = obj[i]
    if (item.auto == true) if (closer(pos, item.pos, result.pos)) result = item
  }
  return copy(result)
}

function moveInp(p) {
  const pos = parsePos(p.pos, p.size, 1)
  const nearBall = getNearObj(balls, pos)
  if (!nearBall || !nearBall.auto) return
  const x = p.pos.x + p.size.h / 5,
    z = 3
  p.acc.x = nearBall.pos.y > x + z ? 1 : nearBall.pos.y < x - z ? -1 : 0
  if ((p.pos.x < 1 && p.acc.x == -1) || (p.pos.x > screen.h && p.acc.x == 1))
    p.acc.x = 0
}

function getPot(color) {
  for (var i = 0; i < pots.all.length; i++) {
    const pot = pots.all[i]
    if (pot.color == color) return copy(pot)
  }
  return false
}

function moveOut(p) {
  const ball = players.inv[0]
  if (!ball) ball = getNearObj(balls, players.inp.pos)

  const pot = getPot(ball.color)
  if (!pot) return
  const pos = parsePos(p.pos, p.size, 0)
  const x = p.pos.x,
    z = 4
  p.acc.x = pot.pos.x > x + z ? 1 : pot.pos.x < x - z ? -1 : 0
  if (p.acc.x == 0) {
    p.actionp = !p.actionp
  }
}

function genPlayer(type) {
  const sprite = getPlayerSprite(type)
  var result = {
    pos: { x: 0, y: 0 },
    size: mapSize(sprite),
    acc: { x: 0, y: 0 },
    actionp: false, //action pressed
    update: function () {
      var handled = false

      if (type == 1) {
        if (autoPickup) {
          moveInp(result)
          handled = true
        }
      } else {
        if (autoDrop) {
          moveOut(result)
          handled = true
        }
      }
      if (!handled) handleKeys(result, type)

      result.pos.x += result.acc.x * players.speed

      //result.pos.y+=result.acc.y
    },
    draw: function () {
      const pos = parsePos(result.pos, result.size, type)
      drawMap(sprite, pos.x, pos.y, 0, type + 1)
    },
    resetStat: function () {
      result.pos = { x: 0, y: 0 }
    },
  }
  return result
}

const players = {
  inv: [],
  invSize: invSize,
  speed: 1,
  out: genPlayer(0),
  inp: genPlayer(1),
  update: function () {
    players.out.update()
    players.inp.update()

    if (players.inv.length > 0) {
      var ball = players.inv[0]
      ball.pos = copy(players.out.pos)
      ball.pos.x += (players.out.size.w - ball.size.w) / 2
      ball.pos.y += margin.top + players.out.size.h / 2

      if (players.out.actionp) {
        if (!players.actionDone) {
          const ball = players.inv.shift()
          ball.speed = { x: ball.speed.y, y: ball.speed.x }
          if (invertSides) ball.speed.y *= -1
          ball.auto = false
          balls.push(ball)
          players.actionDone = true
          sfx(2, 60, 10, 2, 5)
        }
      } else players.actionDone = false
    }
  },
  draw: function () {
    players.out.draw()
    players.inp.draw()

    if (players.inv.length > 0) {
      const ball = players.inv[0]
      drawMap(sprite.balls[ball.color], ball.pos.x, ball.pos.y)
    }
  },
  resetStat: function () {
    players.out.resetStat()
    players.inp.resetStat()
    players.inv = []
  },
  collide: function (ball) {
    if (!players.hasInv()) return false
    if (!ball.auto) return false
    const pos = parsePos(players.inp.pos, players.inp.size, 1)
    const p = { size: players.inp.size, pos: pos }
    if (collide(p, ball)) {
      sfx(6, 50, 15)
      players.inv.push(ball)
      return true
    }
    return false
  },
  hasInv: function (i) {
    return players.invSize > players.inv.length
  },
}

function posTosize(axis) {
  return axis == "x" ? "w" : "h"
}

//pots
const pots = {
  gap: 9,
  all: [],
  collide: function (ball) {
    var result = false
    for (var i = 0; i < pots.all.length; i++) {
      const pot = pots.all[i]
      if (collide(ball, pot) && pot.color == ball.color) {
        result = true
        pot.balls++
        incScore()
      }
    }
    return result
  },
  init: function () {
    for (var i = 0; i < colors.length; i++) {
      const color = colors[i],
        sp = sprite.pots[color]
      size = mapSize(sp)
      var pos = {
        x: screen.w / 2 - (size.w + pots.gap / 2) * colors.length,
        y: screen.h - size.h,
      }
      if (pos.x < 0) pos.x = 0
      if (pots.all.length > 0) {
        const lastPot = copy(pots.all[pots.all.length - 1])
        pos = lastPot.pos
        pos.x += lastPot.size.w
      }
      pos.x += pots.gap

      pots.all.push({
        color: color,
        pos: pos,
        size: size,
        balls: 0,
      })
    }
  },
  draw: function () {
    for (var i = 0; i < pots.all.length; i++) {
      const pot = pots.all[i]
      drawMap(sprite.pots[pot.color], pot.pos.x, pot.pos.y)
      if (gameStarted)
        echoT(pot.balls, pot.pos.x + pot.size.w / 3, pot.pos.y - pot.size.h)
    }
  },
  resetStat: function () {
    pots.all = []
    pots.init()
  },
}

// BALLS
var balls = []
function updateBalls() {
  if (t % ballSpawnTicks == 0 && balls.length < ballMaxSpawn) newBall()
  for (var i = 0; i < balls.length; i++) {
    const ball = balls[i]

    // move obstacle
    ball.pos.x += ball.speed.x
    ball.pos.y += ball.speed.y

    var del = false

    if (players.collide(ball)) {
      del = true
    } else if (pots.collide(ball)) {
      del = true
    } else {
      if (invertSides) {
        if (ball.pos.x + ball.size.w < 0) {
          del = true
          decScore()
        }
      } else {
        if (ball.pos.x > screen.w) {
          del = true
          decScore()
        }
      }
      if (ball.pos.y > screen.h) {
        del = true
        decScore()
      }
    }

    if (del) balls.splice(i, 1)
  }
}
function drawBalls() {
  for (var i = 0; i < balls.length; i++) {
    const ball = balls[i]
    //print(
    //ball.color,
    //ball.pos.x,
    //ball.pos.y
    //)
    drawMap(sprite.balls[ball.color], ball.pos.x, ball.pos.y, 0, 0)
  }
  //echoT(JSON.stringify(balls),10,10)
}
function newBall(axis) {
  const color = randColor()
  var speed = Math.random() * (ballMaxSpeed - ballMinSpeed) + ballMinSpeed
  const size = mapSize(sprite.balls[color])
  var pos = {
    y: Math.floor(
      Math.random() * (screen.h - size.h - margin.bottom - margin.top) +
        margin.top +
        players.out.size.h
    ),
    x: -size.w,
  }

  const spd = { x: 0, y: 0 }

  if (invertSides) {
    speed *= -1
    pos.x = screen.w
  }
  spd.x = speed
  balls.push({
    speed: spd,
    pos: pos,
    size: size,
    color: color,
    auto: true,
  })
}

// HUD
var // score defined in top
  maxScore = 0
tries = 0
function hudLoop() {
  echoT("Score:" + score, 2, 2)

  const x = 70,
    xi = 4
  for (var i = players.invSize - 1; i >= 0; i--) {
    drawMap(sprite.placeholder.ball, x + i * xi, 2)
  }
  if (players.inv.length > 0) {
    for (var i = players.inv.length - 1; i >= 0; i--) {
      drawMap(sprite.balls[players.inv[i].color], x + i * xi, 2)
    }
  }
}
function onScoreChange() {
  if (maxScore < score) maxScore = score
  updateDifficulty()
  saveMem()
}

function incScore() {
  //sfx(3,35,10)
  sfx(6, 55, 15, 1)
  if (gameStarted) {
    score += 1
    onScoreChange()
  }
}
function decScore() {
  sfx(7, 50, 15, 1)
  if (gameStarted) {
    if (score < 1) return gameOver()
    score--
  }
  //onScoreChange()//decrease difficulty
}

function _(a, def) {
  if (a) return a
  return def
}

function echo(txt, x, y, color, size, fixed, small) {
  print(txt, x, y, _(color, 15), _(fixed, false), _(size, 1), _(small, false))
}
function echoT(
  txt,
  x,
  y,
  colors,
  size,
  fixed,
  small,
  shadowOffsetX,
  shadowOffsetY
) {
  size = _(size, 1)
  fixed = _(fixed, false)
  small = _(small, false)
  shadowOffsetX = _(shadowOffsetX, 1)
  shadowOffsetY = _(shadowOffsetX, 1)
  colors = _(colors, [bgColor, 15])
  if (colors.length > 2) {
    const a = colors.length - 2
    shadowOffsetX += a
    shadowOffsetY += a
  }
  echo(
    txt,
    x + shadowOffsetX,
    y + shadowOffsetY,
    shadowColor,
    size,
    fixed,
    small
  )
  for (var i = 0; i < colors.length; i++) {
    const o = colors.length - 1 - i
    echo(txt, x - o, y - o, colors[i], size, fixed, small)
  }
}

// MENU
var gameStarted = false,
  canSelectMenu = true,
  menuPressed = false
function updateMenu() {
  echoT("Score:" + score, 2, 2)
  echoT("Max score:" + maxScore, 80, 2)
  echoT("Tries:" + tries, 190, 2)
  if (!(oautoPickup || oautoDrop) && playerQnt == 2)
    echoT("MULTIPLAYER", 116, 35, [bgColor, 14, 15], 1, false)
  echoT("Water Balls", 56, 21, [11, 10, 9, 8], 2, false)

  //print menu
  for (var i = 0; i < menuItemsKeys.length; i++) {
    const txt = menuItemsKeys[i]
    var tplt = menuConfig.unselected
    if (menuSelected == i) tplt = menuConfig.selected
    txt = tplt.replace("$", txt)
    echoT(txt, menuConfig.x, menuConfig.y + i * menuConfig.gap)
  }
  var x = menuConfig.x
  if (suspended) x += 10
  echoT(b2s(invertSides), 127, x + 23)
  if (canAuto) {
    echoT(b2s(oautoPickup), 123, x + 53)
    echoT(b2s(oautoDrop), 113, x + 63)
    if (oautoPickup && oautoDrop)
      echoT("AUTOMATIC", 56, 35, [bgColor, 15, 2], 1, false)
  }

  //click
  if (btn(4)) {
    //[A]
    if (menuPressed) return
    menuItems[menuItemsKeys[menuSelected]]()
    menuPressed = true
    sfx(8, 60, 20, 1)
  }
  //up
  else if (btn(0)) {
    //[UP]
    if (menuPressed) return
    if (menuSelected == 0) menuSelected = menuItemsKeys.length - 1
    else menuSelected--
    menuPressed = true
    sfx(8, 55, 10, 1)
  }
  //down
  else if (btn(1)) {
    //[DOWN]
    if (menuPressed) return
    if (menuSelected == menuItemsKeys.length - 1) menuSelected = 0
    else menuSelected++
    menuPressed = true
    sfx(8, 50, 10, 1)
  } else menuPressed = false
}

function setupConfigs() {
  autoPickup = oautoPickup
  autoDrop = oautoDrop
  if (oautoPickup || oautoDrop) playerQnt = 1
  updateConfig()
}

// END GAME
function startGame() {
  music()
  if (suspended) toggleSuspend(true)
  paused = false
  //clean all states
  showingMenu = false
  gameStarted = true
  balls = []
  score = 0
  players.resetStat()
  pots.resetStat()
  rt = t = 0
  setupConfigs()
  updateDifficulty()
}
function gameOver() {
  sfx(2, 10, 10)
  //clean some states
  gameStarted = false
  tries++
  players.resetStat()
  onScoreChange()
  saveMem()
  paused = false
  music(0)
}

//suspend
var suspended = false,
  originalMenuItems = copy(menuItems),
  suspendStat = {}
function toggleSuspend(newGame) {
  if (!suspended) {
    suspended = true
    gameStarted = false
    paused = false
    music(0)

    suspendStat.invertSides = invertSides
    suspendStat.playersSpeed = players.speed
    suspendStat.playerInpPos = copy(players.inp.pos)
    suspendStat.playerOutPos = copy(players.out.pos)
    suspendStat.playersInv = copy(players.inv)
    suspendStat.balls = copy(balls)
    suspendStat.allPots = copy(pots.all)

    var result = {
      Continue: toggleSuspend,
    }
    for (var i = 0; i < menuItemsKeys.length; i++) {
      const k = menuItemsKeys[i]
      result[k] = menuItems[k]
    }
    menuItems = result
    menuItemsKeys = Object.keys(menuItems)
  } else {
    music()
    menuItems = copy(originalMenuItems)
    menuItemsKeys = Object.keys(menuItems)
    suspended = false

    gameStarted = true
    if (newGame) return
    players.speed = suspendStat.playersSpeed
    players.inp.pos = copy(suspendStat.playerInpPos)
    players.out.pos = copy(suspendStat.playerOutPos)
    players.inv = copy(suspendStat.playersInv)
    balls = copy(suspendStat.balls)
    pots.all = copy(suspendStat.allPots)
    invertSides = suspendStat.invertSides

    setupConfigs()
  }
}

//Pause
var paused = false,
  pausePressed = (pauseEndPressed = false),
  pauseMessage = null,
  playingMusic = false
function pauseLoop() {
  if (btnp(pauseBtn)) {
    if (pausePressed == false) {
      paused = true
      pausePressed = true
    }
  } else pausePressed = false
  if (paused) {
    echoT("PAUSED", 10, 20, [shadowColor, 2], 1, false)
    echoT("Press [B] to resume", 20, 30, [bgColor, 15], 1, false)
    echoT("Press [X] to suspend game", 20, 40, [bgColor, 15], 1, false)
    echoT("Press [Y] to toggle music", 20, 50, [bgColor, 15], 1, false)
    if (pauseMessage != null)
      echoT(
        pauseMessage.msg,
        pauseMessage.x,
        pauseMessage.y,
        rt % 60 > 30 ? [bgColor, 15] : [bgColor, 9]
      )
    if (btnp(5)) {
      //B
      if (pauseEndPressed == false) {
        paused = false
        pauseEndPressed = true
        if (pauseMessage != null) pauseMessage = null
      }
    } else pauseEndPressed = false
    if (btnp(6)) toggleSuspend()
    if (btnp(7)) {
      if (playingMusic) music()
      else music(0)
      playingMusic = !playingMusic
    }
  } else {
    pauseEndPressed = true
  }
}
function msg(s, x, y) {
  sfx(4, 30)
  pauseMessage = {
    msg: s,
    x: x,
    y: y,
  }
  paused = true
}

var showingControls = false
function showControls() {
  showingControls = true
}
function hideControls() {
  showingControls = false
}
function parseKey(key) {
  switch (key) {
    case 0:
      return "Up"
    case 1:
      return "Down"
    case 2:
      return "Left"
    case 3:
      return "Right"
    case 4:
      return "A"
    case 5:
      return "B"
    case 6:
      return "X"
    case 7:
      return "Y"
  }
}

function drawControls() {
  var x = 20,
    y = 2
  const gap = 8
  function a(name, keys) {
    function b(name, keys, act) {
      function c(name, key) {
        echoT(name + " - " + parseKey(key), x + 20, y, [bgColor, 0], null, true)
        y += gap
      }
      echoT(name, x + gap, y, [bgColor, 9])
      y += gap
      c("Walk forward", keys.forward)
      c("Walk back", keys.back)
      if (act) c("Action", keys.action)
    }
    echoT(name, x, y, [bgColor, 2])
    y += gap
    b("Player one (dropper)", keys[0], true)
    b("Player two (collector)", keys[1])
    //y+=gap
  }
  a("Singleplayer", keybinds[1])
  a("Multiplayer", keybinds[2])

  if (btn(5)) hideControls()
}
pots.init()
getMem()
music(0)
// LOOP
function TIC() {
  cls(0)
  //map(0,17,30,17,0,0,0,1)
  map(0, 0, 30, 17, 0, 0, 0, 1)

  if (gameStarted) {
    if (!canAuto) {
      autoPickup = false
      autoDrop = false
    }
    if (!paused) {
      updateBalls()
      players.update()
    }
    players.draw()
    drawBalls()
    pauseLoop()
    hudLoop()
  } else {
    autoPickup = true
    autoDrop = true
    if (showingControls) {
      drawControls()
    } else updateMenu()
    players.draw()
    players.update()
    updateBalls()
    drawBalls()
  }
  pots.draw()
  //increment the `tick` and `realTick`
  if (!paused) t += 1
  rt += 1
}

// <TILES>
// 001:000222220022ffff022ffeee02ffee2202ffee22022ffeee0022ffff00022222
// 002:22222000ffff2200eeeff22022eeff2022eeff20eeeff220ffff220022222000
// 003:0000000000aaaa000aaffaa0aaffffaaaffeeffaafeeeefaafeaaefaafeaaefa
// 004:000000000000000000000000000fffff000fcccc000fcccc000fcccc000fcccc
// 005:000000000000000000000000ffffffffcccccccccccccccccccccccccccccccc
// 006:000000000000000000000000fffff000ccccf000ccccf000ccccf000ccccf000
// 016:00dddd000d2222d0d222222dd222222dd222222dd222222d0d2222d000dddd00
// 017:0000000000000000d0000000d2222222dd2222220d2222220d2222220ddddddd
// 018:00000000000000000000000d2222222d222222dd222222d0222222d0ddddddd0
// 019:afeaaefaafeaaefaafeeeefaaffeeffaaaffffaa0aaffaa000aaaa0000000000
// 020:000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc
// 021:ccccccccccbcccccccccccacccccccccccccccccc9ccccccccccc8cccccccccc
// 022:ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000
// 032:00dddd000d6666d0d666666dd666666dd666666dd666666d0d6666d000dddd00
// 033:0000000000000000d0000000d6666666dd6666660d6666660d6666660ddddddd
// 034:00000000000000000000000d6666666d666666dd666666d0666666d0ddddddd0
// 036:000fcccc000fcccc000fcccc000fcccc000fffff000000000000000000000000
// 037:ccccccccccccccccccccccccccccccccffffffff000000000000000000000000
// 038:ccccf000ccccf000ccccf000ccccf000fffff000000000000000000000000000
// 044:cccccccccccccccccccccccccccfffffcccf0000cccf0000cccf0000cccf0000
// 045:ccccccccccccccccccccccccffffffff00000b000000a000000b0000000a0000
// 046:ccccccccccccccccccccccccfffffccc0000fccc0000fccc0000fccc0000fccc
// 048:00dddd000daaaad0daaaaaaddaaaaaaddaaaaaaddaaaaaad0daaaad000dddd00
// 049:0000000000000000d0000000daaaaaaaddaaaaaa0daaaaaa0daaaaaa0ddddddd
// 050:00000000000000000000000daaaaaaadaaaaaaddaaaaaad0aaaaaad0ddddddd0
// 051:00dddd000dccccd0dccccccddccccccddccccccddccccccd0dccccd000dddd00
// 056:000000000000000000000000000fffff000fcccc000fcccc000fcccc000fcccc
// 057:000000000000000000000000ffffffffcccccccccccccccccccccccccccccccc
// 058:000000000000000000000000fffff000ccccf000ccccf000ccccf000ccccf000
// 060:cccf0000cccfa000cccf0b00cccf0a00cccf0b00cccfa000cccf0000cccf0000
// 061:000b00000000a00000000b0000000a0000000b000000a000000b0000000a0000
// 062:000bfccc0000fccc0000fccc0000fccc0000fccc0000fccc000bfccc000afccc
// 064:00dddd000d3333d0d333333dd333333dd333333dd333333d0d3333d000dddd00
// 065:0000000000000000d0000000d3333333dd3333330d3333330d3333330ddddddd
// 066:00000000000000000000000d3333333d333333dd333333d0333333d0ddddddd0
// 072:000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc
// 073:cc8ccccccc9cccccccacba98ccbccccccccccbcc89abcaccccccc9ccccccc8cc
// 074:ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000
// 076:cccf0000cccf0000cccf0000cccf0000cccfffffcccccccccccccccccccccccc
// 077:000b00000000a00000000b0000000a00ffffffffcccccccccccccccccccccccc
// 078:0000fccc0000fccc0000fccc0000fcccfffffccccccccccccccccccccccccccc
// 080:00dddd000d4444d0d444444dd444444dd444444dd444444d0d4444d000dddd00
// 081:0000000000000000d0000000d4444444dd4444440d4444440d4444440ddddddd
// 082:00000000000000000000000d4444444d444444dd444444d0444444d0ddddddd0
// 088:000fcccc000fcccc000fcccc000fcccc000fffff000000000000000000000000
// 089:ccccccccccccccccccccccccccccccccffffffff000000000000000000000000
// 090:ccccf000ccccf000ccccf000ccccf000fffff000000000000000000000000000
// 096:00dddd000d7777d0d777777dd777777dd777777dd777777d0d7777d000dddd00
// 097:0000000000000000d0000000d7777777dd7777770d7777770d7777770ddddddd
// 098:00000000000000000000000d7777777d777777dd777777d0777777d0ddddddd0
// 108:000000000000000000000000000fffff000fcccc000fcccc000fcccc000fcccc
// 109:000000000000000000000000ffffffffcccccccccccccccccccccccccccccccc
// 110:000000000000000000000000fffff000ccccf000ccccf000ccccf000ccccf000
// 112:00dddd000dbbbbd0dbbbbbbddbbbbbbddbbbbbbddbbbbbbd0dbbbbd000dddd00
// 113:0000000000000000d0000000dbbbbbbbddbbbbbb0dbbbbbb0dbbbbbb0ddddddd
// 114:00000000000000000000000dbbbbbbbdbbbbbbddbbbbbbd0bbbbbbd0ddddddd0
// 120:000000000000000000000000000fffff000fcccc000fcccc000fcccc000fcccc
// 121:000000000000000000000000ffffffffcccccccccccccccccccccccccccccccc
// 122:000000000000000000000000fffff000ccccf000ccccf000ccccf000ccccf000
// 124:000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc
// 125:cc9cccccccacccccccbccba9cccccccccccccccc9abccbcccccccaccccccc9cc
// 126:ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000
// 128:00dddd000dffffd0dffffffddffffffddffffffddffffffd0dffffd000dddd00
// 129:0000000000000000d0000000dfffffffddffffff0dffffff0dffffff0ddddddd
// 130:00000000000000000000000dfffffffdffffffddffffffd0ffffffd0ddddddd0
// 136:000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc000fcccc
// 137:ccccccccccbcccccccccccacccccccccccccccccc9ccccccccccc8cccccccccc
// 138:ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000ccccf000
// 140:000fcccc000fcccc000fcccc000fcccc000fffff000000000000000000000000
// 141:ccccccccccccccccccccccccccccccccffffffff000000000000000000000000
// 142:ccccf000ccccf000ccccf000ccccf000fffff000000000000000000000000000
// 144:00dddd000d1111d0d111111dd111111dd111111dd111111d0d1111d000dddd00
// 145:0000000000000000d0000000d1111111dd1111110d1111110d1111110ddddddd
// 146:00000000000000000000000d1111111d111111dd111111d0111111d0ddddddd0
// 152:000fcccc000fcccc000fcccc000fcccc000fffff000000000000000000000000
// 153:ccccccccccccccccccccccccccccccccffffffff000000000000000000000000
// 154:ccccf000ccccf000ccccf000ccccf000fffff000000000000000000000000000
// 175:cc9cccccccacccccccbccba9cccccccccccccccc9abccbcccccccaccccccc9cc
// 184:000000000000000000000000000fffff000fccdc000fdccd000fccec000fcecc
// 185:000000000000000000000000ffffffffcdcccdccdccdcccececcdceccceccdcc
// 186:000000000000000000000000fffff000ccdcf000ecccf000cecdf000ccdcf000
// 188:000000000000000000000000000fffff000fcccc000fcccc000fcccc000fcccc
// 189:000000000000000000000000ffffffffcccccbccccccaccccccbcccccccacccc
// 190:000000000000000000000000fffff000ccccf000ccccf000ccccf000ccccf000
// 200:000fcecc000fccec000fdccd000fccdc000fcdcc000fccce000fdcec000fcdcc
// 201:cceccdccceccdcecdccdcccecdcccdccccdcccdcecccdccdcecdccecccdccecc
// 202:ccecf000ceccf000dccdf000cdccf000ccdcf000ecccf000cecdf000ccdcf000
// 204:000fcccc000faccc000fcbcc000fcacc000fcbcc000faccc000fcccc000fcccc
// 205:cccbccccccccaccccccccbcccccccacccccccbccccccaccccccbcccccccacccc
// 206:cccbf000ccccf000ccccf000ccccf000ccccf000ccccf000cccbf000cccaf000
// 216:000fcdcc000fdcec000fccce000fcdcc000fffff000000000000000000000000
// 217:cceccdccceccdcecdccdcccecdcccdccffffffff000000000000000000000000
// 218:ccecf000ceccf000dccdf000cdccf000fffff000000000000000000000000000
// 220:000fcccc000fcccc000fcccc000fcccc000fffff000000000000000000000000
// 221:cccbccccccccaccccccccbcccccccaccffffffff000000000000000000000000
// 222:ccccf000ccccf000ccccf000ccccf000fffff000000000000000000000000000
// 240:0000000000000000d0000000dcccccccddcccccc0dcccccc0dcccccc0ddddddd
// 241:00000000000000000000000dcccccccdccccccddccccccd0ccccccd0ddddddd0
// 248:ccccccccccbcccccccccccacccccccccccccccccc9ccccccccccc8cccccccccc
// 249:ccccaccccccbccccccacccccccbcccccccaccccccccbccccccccacccccccbccc
// 250:ccccdccccccdccccccdcccccccdcccccccdccccccccdccccccccdcccccccdccc
// 251:cccdccccccdccccccdcccccccdccccccccdccccccccdcccccccdcccccccdcccc
// 252:ccce7cdcccc7ecccdcceecccccce7cccccceecccccc7eccdccc7eccccdce7ccc
// 253:c1ccccccc1ccccccc1ccccccc1ccccccc1ccccccc1ccccccc1ccccccc1cccccc
// 254:cdccccdcdcccccddccdddcccccdccdccccdccdcccccdddccddcccccdcdccccdc
// 255:00d00d0000d00eddddf0000000000000000000000000edddde00d0000d00d000
// </TILES>

// <MAP>
// 000:4050505050505050505050505050505050505050505050505050505050600010203000000000000000000000000000000000000000000000000000bf000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 001:41515151515151515151515151515151515151515151515151515151516101112131000000000000008090a0b0c0d0d0e0e2f2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 002:41515151515151515151515151515151515151515151515151515151516102122232000000000000008191a100c1d1e1d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 003:415151515151515151515151515151515151515151515151515151515161031323334353630000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 004:415151515151515151515151515151515151515151515151515151515161041424000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 005:4151515151515151515151515151515151515151515151515151515151610515250000000000000000000000000000000000f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 006:415151515151515151515151515151515151515151515151515151515161061626000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 007:415151515151515151515151515151515151515151515151515151515161071727000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 008:415151515151515151515151515151515151515151515151515151515161081828000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 009:415151515151515151515151515151515151515151515151515151515161091929000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 010:4151515151515151515151515151515151515151515151515151515151610a1a2a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 011:4151515151515151515151515151515151515151515151515151515151610b1b2b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 012:415151515151515151515151515151515151515151515151515151515161001c2c354500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 013:415151515151515151515151515151515151515151515151515151515161001d2d364600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 014:415151515151515151515151515151515151515151515151515151515161001e2e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 015:415151515151515151515151515151515151515151515151515151515161000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 016:425252525252525252525252525252525252525252525252525252525262000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 025:00000000d200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 026:e2f20000000000000000000000000000000000000000000000000000e2f2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </MAP>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:ffecca9877788888888889abbccddeef
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:0002001f101f102ff02ff02ff030f055f040f030f0a5f020e020e0b0f090f0c4e043e0b3e012e03ff001f0a0f0a0f027f097f011f011f016f017f011509000000000
// 001:01f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f001f0505000000000
// 002:0017000500040003000200010000000f000e000d300c300b500a70099008a008b000c000e000f000f000f000f000f000f000f000f000f000f000f00060a000000000
// 003:0060006000600060006000600060006060b060b060b060b000f000f000f000f000f000f000f000f000f000f000f000f0f000f000f000f000f000f00023a000000000
// 004:0060006000600060006000600060006060b060b060b060b000f000f000f000f000f000f000f000f000f000f000f000f0f000f000f000f000f000f000370000000000
// 005:0060006000600060006000600060006060b060b060b060b000f000f000f000f000f000f000f000f000f000f000f000f0f000f000f000f000f000f000509000000000
// 006:0160016001600160016001600160016061b061b061b061b061b061b001f001f001f001f001f001f001f001f001f001f0f100f100f100f100f100f100416000000000
// 007:01a001a001a001a001a001a001a001a06160616061606160616061600120012001200120012001200120012001200120f100f100f100f100f100f100515000000000
// 008:01600160016001600160016001600160f100f100f100f10061d061d061d061d061d061d061d0f100f100f100f100f100f100f100f100f100f100f100504000000000
// 051:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000525000000000
// </SFX>

// <PATTERNS>
// 000:000010400016600014000000900014000000b00014000010000000900014b00014000000900014000000000010900014b00014000000000000900014000000b00014000010000000900014b00014000000900014000000000010900014b00014000000000000000000400014600014000000900014000000b00014000010000000900014b00014000000900014000000000010900014100010000000000000000000000000000000000000000000000000000000000000000000000000000000
// 001:000000400016600016000000900016000000b00016000010000000900016b00016000000900016000000000010900016b00016000000000000900016000000b00016000010000000900016b00016000000900016000000000010900016b00016000000000000000000400016600016000000900016000000b00016000010000000900016b00016000000900016000000000010900016100010000000000000000000000000000000000000000000000000000000000000000000000000000000
// 002:000000000000000000600016000000000000000010000000000000000000700016000010000010000000000000000000000000000000000000000000000010000000600016000000000000000000000000000010000000700016000010000010000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// 003:700014000010800014000020900014000000b00014000010000000900014b00014000000900014000000000010900014b00014000000000000900014000000b00014000010000000900014b00014000000900014000000000010900014b00014000000000000000000400014600014000000900014000000b00014000010000000900014b00014000000900014000000000010900014100010000000000000000000000000000000000000000000000000000000000000000000000000000000
// 004:00000000000000000000002000000000000000001000000000000000000000002000001000001000000000000000000000000000000000000000000000001000000060002a00000000000000000000000000001000000070002a000010000010000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </PATTERNS>

// <TRACKS>
// 000:1000001800001c00004803004803004803004803004c00004000000000000000000000000000000000000000000000002e0200
// </TRACKS>

// <PALETTE>
// 000:1a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57
// 001:000000000000000000000000000000000000000000000000000000000000000000000000040000000404000000000000
// </PALETTE>
