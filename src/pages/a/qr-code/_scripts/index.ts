import database from "./core/database"
import settings from "./core/settings"
import share from "./core/share"
import generate from "./features/generate"
import scan from "./features/scan"

database()
settings()
share()
generate()
scan()