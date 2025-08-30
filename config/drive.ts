/**
 * Config source: https://git.io/JBt3o
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { driveConfig } from '@adonisjs/core/build/config'
import Application from '@ioc:Adonis/Core/Application'

/*
|--------------------------------------------------------------------------
| Drive Config
|--------------------------------------------------------------------------
|
| The `DriveConfig` relies on the `DisksList` interface which is
| defined inside the `contracts` directory.
|
*/

export default driveConfig({
  /*
  |--------------------------------------------------------------------------
  | Disque par défaut (Le "Switch")
  |--------------------------------------------------------------------------
  | On lit la variable d'environnement STORAGE_DISK.
  | Si elle n'est pas définie (comme en développement), on utilise 'dev_storage' par défaut.
  */
  disk: Env.get('STORAGE_DISK', 'dev_storage'),

  /*
  |--------------------------------------------------------------------------
  | Disques disponibles
  |--------------------------------------------------------------------------
  */
  disks: {
    // Disque pour le développement local (`yarn run dev`)
    dev_storage: {
      driver: 'local',
      visibility: 'private',
      // Il pointe vers le dossier tmp/ à la racine de votre projet.
      root: Application.publicPath('storage'),
      // Les fichiers de travail ne doivent pas être servis publiquement.
      serveFiles: false,
    },

    // Disque pour la production (Docker)
    prod_storage: {
      driver: 'local',
      visibility: 'private',
      // Il pointe vers un dossier 'storage/' qui sera rendu persistant par un volume Docker.
      // Ce chemin est à l'intérieur du conteneur.
      root: Application.publicPath('storage'),
      serveFiles: false,
    },
    /*
    |--------------------------------------------------------------------------
    | S3 Driver
    |--------------------------------------------------------------------------
    |
    | Uses the S3 cloud storage to manage files. Make sure to install the s3
    | drive separately when using it.
    |
    |**************************************************************************
    | npm i @adonisjs/drive-s3
    |**************************************************************************
    |
    */
    // s3: {
    //   driver: 's3',
    //   visibility: 'public',
    //   key: Env.get('S3_KEY'),
    //   secret: Env.get('S3_SECRET'),
    //   region: Env.get('S3_REGION'),
    //   bucket: Env.get('S3_BUCKET'),
    //   endpoint: Env.get('S3_ENDPOINT'),
    //
    //  // For minio to work
    //  // forcePathStyle: true,
    // },

    /*
    |--------------------------------------------------------------------------
    | GCS Driver
    |--------------------------------------------------------------------------
    |
    | Uses the Google cloud storage to manage files. Make sure to install the GCS
    | drive separately when using it.
    |
    |**************************************************************************
    | npm i @adonisjs/drive-gcs
    |**************************************************************************
    |
    */
    // gcs: {
    //   driver: 'gcs',
    //   visibility: 'public',
    //   keyFilename: Env.get('GCS_KEY_FILENAME'),
    //   bucket: Env.get('GCS_BUCKET'),

    /*
      |--------------------------------------------------------------------------
      | Uniform ACL - Google cloud storage only
      |--------------------------------------------------------------------------
      |
      | When using the Uniform ACL on the bucket, the "visibility" option is
      | ignored. Since, the files ACL is managed by the google bucket policies
      | directly.
      |
      |**************************************************************************
      | Learn more: https://cloud.google.com/storage/docs/uniform-bucket-level-access
      |**************************************************************************
      |
      | The following option just informs drive whether your bucket is using uniform
      | ACL or not. The actual setting needs to be toggled within the Google cloud
      | console.
      |
      */
    //   usingUniformAcl: false,
    // },
  },
})
