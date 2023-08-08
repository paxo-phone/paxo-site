# Software

Le PaxOS est le système d'exploitation utilisé par le PaxoPhone.

Il est entièrement codé en C++.

## L'architecture

main.hpp :

     void setup() : initialise le paxos v8 en configurant divers composants et fonctionnalités tels que l'interface graphique, le shell, le stockage, la lumière de l'écran, le GSM, le bouton d'accueil et le lanceur.
     void loop() : fonction de boucle principale qui ne contient aucun code.

interface/interface.hpp :

Inclut divers fichiers d'en-tête qui définissent les composants de l'interface.
interface/bouton.hpp :

Définit une classe HomeButton qui représente un bouton d'accueil physique sur l'interface.

     void init() : initialise le bouton d'accueil en définissant son mode de broche et son intervalle de mise à jour.
     void update() : met à jour l'état du bouton d'accueil.
     void clear() : Efface l'état du bouton d'accueil.
     bool pressed() : renvoie si le bouton d'accueil est enfoncé.
     Plusieurs autres méthodes liées au mode veille.

interface/GSM/Sim800L.hpp :

Définit la classe GSM chargée de gérer la communication GSM.

     Diverses méthodes pour initialiser le module GSM, envoyer et recevoir des données, analyser les réponses et gérer l'état du réseau et les messages.

interface/lights.hpp :

Définit une classe ScreenLight qui représente le rétroéclairage de l'écran.

     void analog(int state) : règle l'intensité du rétroéclairage.
     void ON() : Active le rétroéclairage.
     void OFF() : Éteint le rétroéclairage.
     void init() : Initialise la lumière de l'écran.

tâches/tâches.hpp :

Définit diverses classes et fonctions liées à la gestion des tâches, des événements, des délais d'attente et des intervalles.

     class CallbackClass : une classe de base pour les fonctions de rappel.
     classe ConditionClass : une classe de base pour les fonctions de vérification de condition.
     Classes de modèles telles que CallbackMethod, ConditionMethod, Callback et Condition pour encapsuler les fonctions de rappel et de condition.
     classe Event, classe Timeout, classe Interval : classes pour les mécanismes de planification basés sur les événements.
     classe EventHandler : gère les événements, les délais d'attente et les intervalles.
     Diverses fonctions pour ajouter, supprimer et gérer des événements, des délais d'attente et des intervalles.

widgets/gui.hpp :

Définit la classe Gui, qui sert de classe de base pour créer des éléments d'interface utilisateur graphique.

     Diverses méthodes et attributs liés au rendu, à la mise à jour, à l'alignement, à la couleur, à la taille, aux enfants, aux événements et aux rappels.
     Fonctions virtuelles à remplacer dans les classes dérivées pour un comportement personnalisé.

widgets/gui/window.hpp :

Définit la classe Window, une classe dérivée de Gui, représentant une fenêtre graphique avec diverses fonctionnalités.

     Constructeur pour créer une fenêtre avec un titre et des dimensions spécifiques.
     Méthodes de mise à jour des modules, de rendu et de gestion des événements.
     Attributs liés à la barre de titre, à l'étiquette d'heure, à la qualité du réseau et au niveau de la batterie.

widgets/gui/étiquette.hpp :

Définit la classe Label, une classe dérivée de Gui, représentant un élément d'étiquette de texte.

     Constructeurs pour créer une étiquette avec différents attributs comme la position, la largeur, la hauteur et le texte.
     Méthodes de dessin, de mise à jour et de gestion des événements liés à l'étiquette.
     Attributs liés au texte, à la police, à la couleur, à l'alignement et au lien vers un clavier.

widgets/gui/clavier.hpp :

Définit la classe Keyboard, une classe dérivée de Gui, représentant un clavier à l'écran.

     Constructeurs pour créer un élément de clavier.
     Méthodes de dessin, de mise à jour et de gestion des pressions sur les touches.
     Attributs pour différents modes de clavier, liaison d'étiquettes et entrées de caractères.

widgets/gui/image.hpp :

Définit la classe Image, une classe dérivée de Gui, représentant un élément image.

     Constructeurs pour créer une image avec un chemin de fichier et des dimensions spécifiés.
     Méthodes de chargement, de déchargement et de dessin d'images.
     Méthodes statiques pour analyser les en-têtes de différents formats d'image.
     Attributs liés au chemin et au format du fichier de l'image.

widgets/gui/box.hpp :

Définit la classe Box, une classe dérivée de Gui, représentant un simple élément de boîte rectangulaire.

     Constructeurs pour créer une boîte avec une position et des dimensions spécifiques.
     Méthodes pour dessiner la boîte.
     Pas d'attributs spécifiques en dehors de la position et des dimensions.

## Applications

Description:

Le fichier gui.hpp fournit une collection de classes et d'utilitaires pour créer des éléments d'interface utilisateur graphique (GUI) et gérer leurs interactions. Il définit les classes de base et les méthodes requises pour créer des interfaces utilisateur et des applications avec des composants graphiques.
interface graphique de classe:
Description:

La classe Gui est la classe de base pour tous les éléments de l'interface utilisateur graphique. Il fournit des méthodes et des attributs pour le rendu, la mise à jour et la gestion des interactions utilisateur pour divers composants de l'interface graphique.
Méthodes:

     init(int x, int y, int width, int height): Initialise l'élément GUI avec sa position et ses dimensions.
     draw(): rend l'élément GUI à l'écran.
     update(): gère les interactions de l'utilisateur et met à jour l'état de l'élément. Renvoie vrai si l'état de l'élément a changé en raison de l'interaction.

Application de classe:
Description:

La classe App est une classe de base pour créer des applications composées de plusieurs éléments d'interface graphique. Il fournit une structure pour définir la logique principale de l'application.
Méthodes:

     main() : La méthode principale de l'application où la logique de base est implémentée. Cette méthode contient généralement une boucle qui met à jour les éléments de l'interface graphique, gère les interactions de l'utilisateur et gère le comportement de l'application.

fenêtre de classe (dérivée de Gui):
Description:

La classe Window représente un élément de fenêtre graphique qui peut contenir d'autres éléments d'interface graphique. Il fournit un cadre pour créer des composants de type conteneur pour organiser d'autres éléments.
Méthodes:

     addChild(Gui* child): ajoute un élément d'interface graphique enfant à la fenêtre.
     updateAll(): met à jour tous les éléments de l'interface graphique enfant dans la fenêtre.

Étiquette de classe (dérivée de Gui):
Description:

La classe Label représente un élément d'étiquette de texte qui peut afficher du texte à l'écran. Il est souvent utilisé pour afficher du texte statique ou changeant dynamiquement.
Méthodes:

     setText(const std::string& text): définit le contenu textuel de l'étiquette.

bouton de classe (dérivé de Gui):
Description:

La classe Button représente un élément bouton cliquable. Il est utilisé pour créer des boutons interactifs qui peuvent déclencher des actions lorsqu'ils sont pressés.
Méthodes:

     setText(const std::string& text): définit le contenu textuel du bouton.
     isTouched(): renvoie vrai si le bouton est touché ou cliqué.

classe Box (dérivée de Gui):
Description:

La classe Box représente un élément de boîte rectangulaire qui peut être utilisé à des fins de mise en page et d'organisation. Il est souvent utilisé pour regrouper et organiser d'autres éléments de l'interface graphique.
Méthodes:

     addChild(Gui* child): ajoute un élément d'interface graphique enfant à la boîte.

image de classe (dérivée de Gui):
Description:

La classe Image représente un élément image qui peut afficher des images à l'écran. Il est utilisé pour afficher le contenu visuel dans l'interface graphique.
Méthodes:

     load(): charge l'image à partir du chemin de fichier spécifié.

Clavier de classe:
Description:

La classe Keyboard représente un élément de clavier à l'écran qui peut être utilisé pour saisir du texte.
Méthodes:

     link(Label* targetLabel) : relie le clavier à une étiquette cible où le texte saisi sera affiché.
     getKey(): renvoie le caractère de la touche qui a été enfoncée sur le clavier.

Intégration avec l'application téléphonique:

La classe d'application Phone fournie montre comment utiliser les éléments GUI définis dans gui.hpp pour créer une interface de numérotation téléphonique fonctionnelle. La classe Phone hérite de la classe App et remplace la méthode main() pour définir sa fonctionnalité.

La classe Phone utilise divers éléments d'interface graphique tels que Window, Box, Label, Button et Image pour créer l'interface du numéroteur, afficher les numéros et interagir avec les entrées de l'utilisateur. Il gère les interactions tactiles sur les boutons et les étiquettes pour mettre à jour le numéro affiché et effectuer des actions telles que l'accès aux contacts et les appels.

La boucle principale de la classe Phone met continuellement à jour les éléments de l'interface graphique, vérifie les interactions tactiles et répond aux actions de l'utilisateur. L'application utilise l'instance home_button pour quitter l'application lorsque le bouton d'accueil physique est enfoncé.

La classe Phone comprend également des méthodes supplémentaires telles que make_a_call(), during_calling() et get_a_call() qui peuvent être utilisées pour gérer les fonctionnalités liées aux appels.

Dans l'ensemble, la classe Phone montre comment tirer parti des éléments de l'interface graphique et de leurs interactions pour créer une interface utilisateur fonctionnelle et interactive pour l'application de numérotation téléphonique.

## Contribuer

Le code du PaxOS est libre. Ce statut confère à l'utilisateur les quatres libertés suivantes : 

0. la liberté d'exécuter le programme, pour tous les usages ;
1. la liberté d'étudier le fonctionnement du programme et de l'adapter à ses besoins ;
2. la liberté de redistribuer des copies du programme (ce qui implique la possibilité aussi bien de donner que de vendre des copies) ;
3. la liberté d'améliorer le programme et de distribuer ces améliorations au public, pour en faire profiter toute la communauté.

Le code du PaxOS est hébergé sur [github](https://www.github.com) et est ouvert à la contribution.
