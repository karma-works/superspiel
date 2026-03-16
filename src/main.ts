import * as ex from 'excalibur'
import { GRAVITY } from './config'
import { MainMenu } from './scenes/MainMenu'
import { Level1 } from './scenes/Level1'
import { Level2 } from './scenes/Level2'
import { Level3 } from './scenes/Level3'
import { Level4 } from './scenes/Level4'
import { Level5 } from './scenes/Level5'
import { startMusic } from './music'

const game = new ex.Engine({
  width: 800,
  height: 450,
  displayMode: ex.DisplayMode.FitScreen,
  pixelArt: true,
  antialiasing: false,
  backgroundColor: ex.Color.fromHex('#29b6f6'),
  physics: {
    gravity: ex.vec(0, GRAVITY),
    solver: ex.SolverStrategy.Arcade,
  },
})

game.addScene('mainmenu', new MainMenu())
game.addScene('level1', new Level1())
game.addScene('level2', new Level2())
game.addScene('level3', new Level3())
game.addScene('level4', new Level4())
game.addScene('level5', new Level5())

game.goToScene('mainmenu')
game.start()
startMusic()
