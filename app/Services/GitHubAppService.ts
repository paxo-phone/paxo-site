import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import Env from '@ioc:Adonis/Core/Env'
import fs from 'fs/promises'
import fg from 'fast-glob'
import App from 'App/Models/App'
import Release from 'App/Models/Release'

type GitFile = {
  path: string
  mode: '100644'
  type: 'blob'
  sha: string
}

class GitHubAppService {
  private owner = Env.get('GITHUB_REPO_OWNER')
  private repo = Env.get('GITHUB_REPO_NAME')
  private branch = 'main'

  private async getAuthenticatedClient(): Promise<Octokit> {
    const auth = createAppAuth({
      appId: Env.get('GITHUB_APP_ID'),
      // Elle utilise la clé en Base64, qui est bien définie dans votre .env
      privateKey: Buffer.from(Env.get('GITHUB_PRIVATE_KEY_BASE64'), 'base64').toString('utf-8'),
      installationId: Env.get('GITHUB_INSTALLATION_ID'),
    });

    const installationAuthentication = await auth({ type: 'installation' });
    return new Octokit({ auth: installationAuthentication.token });
  }

  /**
   * Crée un commit sur GitHub. C'est la fonction de base que les autres utiliseront.
   */
  private async commit(tree: GitFile[], message: string) {
    const octokit = await this.getAuthenticatedClient()
    const { data: refData } = await octokit.git.getRef({ owner: this.owner, repo: this.repo, ref: `heads/${this.branch}` })
    const parentCommitSha = refData.object.sha

    const { data: treeData } = await octokit.git.createTree({ owner: this.owner, repo: this.repo, tree, base_tree: parentCommitSha })
    const { data: commitData } = await octokit.git.createCommit({ owner: this.owner, repo: this.repo, message, tree: treeData.sha, parents: [parentCommitSha] })
    
    await octokit.git.updateRef({ owner: this.owner, repo: this.repo, ref: `heads/${this.branch}`, sha: commitData.sha })
  }

  /**
   * Lit les fichiers locaux et les transforme en blobs pour l'API Git.
   */
  private async createBlobsForDirectory(octokit: Octokit, localPath: string, repoPathPrefix: string): Promise<GitFile[]> {
    const filePaths = await fg('**/*', { cwd: localPath, onlyFiles: true })
    if (filePaths.length === 0) return []

    return Promise.all(
      filePaths.map(async (filePath) => {
        const content = await fs.readFile(`${localPath}/${filePath}`, 'base64')
        const { data: blobData } = await octokit.git.createBlob({ owner: this.owner, repo: this.repo, content, encoding: 'base64' })
        return {
          path: `${repoPathPrefix}/${filePath}`,
          sha: blobData.sha,
          mode: '100644' as const,
          type: 'blob' as const,
        }
      })
    )
  }

  /**
   * ACTION 1 : Ajoute une NOUVELLE application dans le dossier "Pending".
   */
  public async commitNewApp(app: App, localDirectoryPath: string) {
    try {
      const octokit = await this.getAuthenticatedClient();

      // --- 1. Récupérer le README.md actuel ---
      let currentReadmeContent = '';
      try {
        const { data: readmeData } = await octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: 'README.md',
        });
        // Le contenu est en Base64, il faut le décoder
        if ('content' in readmeData) {
          currentReadmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
        }
      } catch (error) {
        // Si le README n'existe pas (404), on en crée un nouveau avec un en-tête de tableau.
        if (error.status === 404) {
          console.log('README.md non trouvé, un nouveau sera créé.');
          currentReadmeContent = '# Annuaire des applications du Paxo Store\n\n| UUID | Auteur | Nom de l\'application |\n|---|---|---|\n';
        } else {
          throw error; // On propage les autres erreurs (ex: problème de permission)
        }
      }

      // --- 2. Préparer le nouveau contenu du README ---
      // On s'assure que le contenu actuel se termine bien par un saut de ligne
      if (currentReadmeContent && !currentReadmeContent.endsWith('\n')) {
        currentReadmeContent += '\n';
      }
      // On ajoute la nouvelle ligne de log au format table Markdown
      const newLogLine = `${app.uuid} - ${app.author.username} - ${app.name} <br>`;
      const updatedReadmeContent = currentReadmeContent + newLogLine;

      // --- 3. Préparer les "arbres" de fichiers pour le commit ---
      // Arbre pour les fichiers de l'application
      const repoPathPrefix = `Pending/${app.uuid}/${app.name}`;
      const appFileTree = await this.createBlobsForDirectory(octokit, localDirectoryPath, repoPathPrefix);
      if (appFileTree.length === 0) {
        throw new Error("Aucun fichier d'application trouvé à commiter.");
      }

      // Arbre pour le README mis à jour
      const { data: readmeBlobData } = await octokit.git.createBlob({
        owner: this.owner,
        repo: this.repo,
        content: updatedReadmeContent,
        encoding: 'utf-8',
      });
      
      const readmeTree = {
        path: 'README.md',
        sha: readmeBlobData.sha,
        mode: '100644' as const,
        type: 'blob' as const,
      };

      // On combine les deux arbres
      const finalTree = [...appFileTree, readmeTree];

      // --- 4. Exécuter le commit ---
      await this.commit(finalTree, `feat(pending): Add new app "${app.name}" (ID: ${app.id})`);
      
      console.log(`Nouvelle app ${app.name} sauvegardée dans Pending/ et README mis à jour.`);

    } catch (error) {
      console.error(`Échec du backup pour la nouvelle application ${app.name}:`, error);
      // On propage l'erreur pour que le contrôleur puisse la logger
      throw error;
    }
  }

  /**
   * ACTION 2 : Déplace une application d'un statut à un autre (ex: Pending -> Published).
   */
  public async moveApp(app: App, fromStatus: 'Pending' , toStatus: 'Published' | 'Rejected') {
    const octokit = await this.getAuthenticatedClient()
    const sourcePath = `${fromStatus}/${app.uuid}/${app.name}`
    const destinationPath = `${toStatus}/${app.uuid}/${app.name}`

    // 1. Récupérer l'arbre de fichiers complet du dernier commit
    const { data: refData } = await octokit.git.getRef({ owner: this.owner, repo: this.repo, ref: `heads/${this.branch}` })
    const { data: treeData } = await octokit.git.getTree({ owner: this.owner, repo: this.repo, tree_sha: refData.object.sha, recursive: 'true' })

    // 2. Construire le nouvel arbre en incluant les déplacements ET les suppressions
    const newTree = treeData.tree.reduce((accumulator, currentFile) => {
      // On vérifie si le fichier actuel fait partie du dossier que l'on veut déplacer
      if (currentFile.path?.startsWith(sourcePath)) {
        
        // A) On ajoute l'instruction pour CRÉER le fichier au nouvel emplacement
        accumulator.push({
          path: currentFile.path.replace(sourcePath, destinationPath),
          mode: currentFile.mode as '100644',
          type: currentFile.type as 'blob',
          sha: currentFile.sha,
        });

        // B) On ajoute l'instruction pour SUPPRIMER l'ancien fichier
        // En mettant le sha à null, on dit à Git de le supprimer.
        accumulator.push({
          path: currentFile.path,
          mode: '100644', // Le mode est requis même pour une suppression
          type: 'blob',
          sha: null,
        });

      } else {
        // Si le fichier ne fait pas partie du déplacement, on le garde tel quel
        accumulator.push(currentFile as GitFile);
      }
      
      return accumulator;
    }, [] as any[]); // On initialise avec un tableau vide

    if (newTree.length === 0) {
      console.warn(`Aucun fichier trouvé à déplacer pour l'app ${app.name} depuis ${fromStatus}`)
      return
    }

    // 3. On crée le commit avec ce nouvel arbre complet
    await this.commit(newTree, `chore(status): Move app "${app.name}" from ${fromStatus} to ${toStatus}`)
    console.log(`App ${app.name} déplacée de ${fromStatus}/ à ${toStatus}/`)
  }

  public async commitNewRelease(release: Release, localDirectoryPath: string) {
    try {
      const octokit = await this.getAuthenticatedClient();
      const app = release.app; // L'application parente

      // --- 1. Définir les chemins dans le dépôt ---
      const appRepoPath = `Published/${app.uuid}/${app.name}`;
      const releaseRepoPath = `${appRepoPath}/Releases/Pending/${release.uuid}`;
      const changelogPath = `${appRepoPath}/CHANGELOG.md`;

      // --- 2. Gérer le CHANGELOG.md de l'application ---
      let currentChangelog = '';
      try {
        const { data: changelogData } = await octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: changelogPath,
        });
        if ('content' in changelogData) {
          currentChangelog = Buffer.from(changelogData.content, 'base64').toString('utf-8');
        }
      } catch (error) {
        if (error.status === 404) {
          console.log(`CHANGELOG.md non trouvé pour ${app.name}, un nouveau sera créé.`);
          currentChangelog = `# Historique des versions de ${app.name}\n\n`;
        } else {
          throw error;
        }
      }

      // On ajoute la nouvelle entrée au changelog
      const newChangelogEntry = `${release.uuid} - ${app.uuid} - ${app.author.username} - ${app.name}<br>`;
      const updatedChangelog = newChangelogEntry + currentChangelog;

      // --- 3. Préparer les "arbres" de fichiers pour le commit ---
      // Arbre pour les fichiers de la release
      const releaseFileTree = await this.createBlobsForDirectory(octokit, localDirectoryPath, releaseRepoPath);
      if (releaseFileTree.length === 0) {
        throw new Error("Aucun fichier de release trouvé à commiter.");
      }

      // Arbre pour le CHANGELOG.md mis à jour
      const { data: changelogBlobData } = await octokit.git.createBlob({
        owner: this.owner,
        repo: this.repo,
        content: updatedChangelog,
        encoding: 'utf-8',
      });
      
      const changelogTree = {
        path: changelogPath,
        sha: changelogBlobData.sha,
        mode: '100644' as const,
        type: 'blob' as const,
      };

      const { data: gitkeepBlobData } = await octokit.git.createBlob({ owner: this.owner, repo: this.repo, content: '', encoding: 'utf-8' });
      
      // On crée les entrées de l'arbre pour les dossiers Published et Rejected
       const pendingPlaceholder = {
        path: `${appRepoPath}/Releases/Pending/.gitkeep`,
        sha: gitkeepBlobData.sha,
        mode: '100644' as const,
        type: 'blob' as const,
      };
      const publishedPlaceholder = {
        path: `${appRepoPath}/Releases/Published/.gitkeep`,
        sha: gitkeepBlobData.sha,
        mode: '100644' as const,
        type: 'blob' as const,
      };
      const rejectedPlaceholder = {
        path: `${appRepoPath}/Releases/Rejected/.gitkeep`,
        sha: gitkeepBlobData.sha,
        mode: '100644' as const,
        type: 'blob' as const,
      };

      // On combine les deux arbres
      const finalTree = [
        ...releaseFileTree,
        changelogTree,
        publishedPlaceholder,
        rejectedPlaceholder,
        pendingPlaceholder,
      ];

      // --- 4. Exécuter le commit ---
      await this.commit(finalTree, `feat(release): Add new release "${release.version}" for app "${app.name}"`);
      
      console.log(`Nouvelle release ${release.version} pour ${app.name} sauvegardée dans .../Releases/Pending/`);

    } catch (error) {
      console.error(`Échec du backup pour la nouvelle release de ${release.app.name}:`, error);
      throw error;
    }
  }

  public async moveRelease(release: Release, fromStatus: 'Pending', toStatus: 'Published' | 'Rejected') {
    try {
      const octokit = await this.getAuthenticatedClient();
      // On s'assure que l'application parente est chargée pour avoir son nom et son UUID
      await release.load('app');
      const app = release.app;

      // 1. Définir les chemins source et destination dans le dépôt
      const sourcePathPrefix = `Published/${app.uuid}/${app.name}/Releases/${fromStatus}/${release.uuid}`;
      const destinationPathPrefix = `Published/${app.uuid}/${app.name}/Releases/${toStatus}/${release.uuid}`;

      // 2. Récupérer l'arbre de fichiers complet du dernier commit
      const { data: refData } = await octokit.git.getRef({ owner: this.owner, repo: this.repo, ref: `heads/${this.branch}` });
      const { data: treeData } = await octokit.git.getTree({ owner: this.owner, repo: this.repo, tree_sha: refData.object.sha, recursive: 'true' });

      // 3. Construire le nouvel arbre qui inclut le déplacement (ajout + suppression)
      const newTree = treeData.tree.reduce((accumulator, currentFile) => {
        if (currentFile.path?.startsWith(sourcePathPrefix)) {
          // A) On ajoute l'instruction pour CRÉER le fichier au nouvel emplacement
          accumulator.push({
            path: currentFile.path.replace(sourcePathPrefix, destinationPathPrefix),
            mode: currentFile.mode as '100644',
            type: currentFile.type as 'blob',
            sha: currentFile.sha,
          });

          // B) On ajoute l'instruction pour SUPPRIMER l'ancien fichier
          accumulator.push({
            path: currentFile.path,
            mode: '100644',
            type: 'blob',
            sha: null, // Mettre le sha à null = suppression
          });
        } else {
          // Si le fichier n'est pas concerné, on le garde tel quel
          accumulator.push(currentFile as GitFile);
        }
        return accumulator;
      }, [] as any[]);

      if (newTree.length === treeData.tree.length) {
        console.warn(`Aucun fichier trouvé à déplacer pour la release ${release.id} depuis ${fromStatus}`);
        return;
      }

      // 4. Créer le commit avec ce nouvel arbre
      await this.commit(newTree, `chore(release): Move release "${release.version}" to ${toStatus}`);
      console.log(`Release ${release.version} déplacée de ${fromStatus}/ à ${toStatus}/`);

    } catch (error) {
      console.error(`Échec du déplacement GitHub pour la release ${release.id}:`, error);
      throw error;
    }
  }
}

export default new GitHubAppService()