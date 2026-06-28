import actions from "./core/actions"
import database from "./core/database"
import minify from "./core/minify"
import settings from "./core/settings"
import share from "./core/share"
import slider from "./core/slider"

database()
settings()
share()
slider()
actions()
minify()