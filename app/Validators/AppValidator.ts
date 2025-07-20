import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AppCategory } from 'App/Models/App' // Importez votre enum AppCategory


const appCategories = Object.keys(AppCategory).filter((key) => !isNaN(Number(key)))

export default class AppValidator {
  constructor(protected ctx: HttpContextContract) {}
  /*
   * Define schema to validate the form data.
   */
  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.minLength(0),
      rules.maxLength(100),
      rules.unique({ table: 'apps', column: 'name' }), // Assure que le nom de l'app est unique
    ]),
    desc: schema.string({ trim: true }, [
      rules.minLength(0),
      rules.maxLength(500),
    ]),
    category: schema.enum(appCategories),
    // Validation pour le fichier .zip
    // Assurez-vous que le nom de l'input dans votre formulaire est 'app_zip'
    app_zip: schema.file({
      size: '50mb', // Taille maximale du fichier (ajustez selon vos besoins)
      extnames: ['zip'], // Extensions de fichier autorisées
    }),
    // Si vous avez un champ pour une image/logo, ajoutez sa validation ici
    // app_logo: schema.file.optional({
    //   size: '2mb',
    //   extnames: ['jpg', 'jpeg', 'png', 'gif'],
    // }),
  })

  public schemaIcon = schema.create({
        icon: schema.file({
          size: '2mb',
          extnames: ['png', 'jpg', 'jpeg', 'svg'],
        }),
      })
  /**
   * Custom messages for validation failures. You can make them here.
   */
  public messages : CustomMessages = {
    'required': 'Le champ {{ field }} est requis.',
    'name.minLength': 'Le nom de l\'application doit comporter au moins 3 caractères.',
    'name.maxLength': 'Le nom de l\'application ne doit pas dépasser 100 caractères.',
    'name.unique': 'Ce nom d\'application est déjà utilisé.',
    'desc.minLength': 'La description doit comporter au moins 10 caractères.',
    'desc.maxLength': 'La description ne doit pas dépasser 1000 caractères.',
    'category.enum': 'Veuillez sélectionner une catégorie valide.',
    'ext_url.url': 'Veuillez fournir une URL valide pour le lien externe.',
    'ext_url.maxLength': 'L\'URL du lien externe ne doit pas dépasser 255 caractères.',
    'app_zip.size': 'Le fichier .zip ne doit pas dépasser 50MB.',
    'app_zip.extnames': 'Le fichier doit être une archive .zip valide (extension .zip).',
    // 'app_logo.size': 'L\'image du logo ne doit pas dépasser 2MB.',
    // 'app_logo.extnames': 'Le logo doit être une image de type jpg, png, ou gif.',
  }
}