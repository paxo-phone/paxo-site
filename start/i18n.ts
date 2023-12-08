import Event from '@ioc:Adonis/Core/Event'
import I18n from '@ioc:Adonis/Addons/I18n'

/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

Event.on('i18n:missing:translation', I18n.prettyPrint)
