# Hardware

Cette documentation décrit en profondeur les spécifications materielles du PaxoPhone. 

De même que le système d'exploitation, les plans du PaxoPhone sont disponibles sous license libre, conférant à l'utilisateur les mêmes libertés que celles décrites dans la section Software/Contribuer.

## Généralités

Le PaxoPhone est conçu comme un projet novateur visant à créer un téléphone économique et fonctionnel en utilisant des composants abordables. Il repose sur six composantes essentielles, chacune jouant un rôle crucial dans son fonctionnement global.

## L'ESP32

L'ESP32 est un microcontrôleur 2 cœurs cadencés à 240 MHz, fabriqué par Espressif Systems. Il agit comme le cerveau du PaxoPhone, assumant la responsabilité des calculs, du fonctionnement du système d'exploitation et de la coordination de tous les composants. En plus de générer les rendus d'écran, il facilite la synchronisation entre les différentes parties du téléphone.

## Le SIM800L

Le SIM800L est un module de communication cellulaire 2G fabriqué par SIMCom Wireless Solutions. Il permet l'accès au réseau 2G, en prenant en charge les appels téléphoniques grâce à l'utilisation du microphone et du haut-parleur. De plus, il assure la synchronisation de l'heure en fonction de la localisation et surveille la charge de la batterie.
Ce composant deviendra obsolète en France a partir de 2025 et sera donc changé pour un autre module 4G LTE (pas encore séléctionné)

## Le CH340C

Le CH340C est un convertisseur USB vers TTL fabriqué par WCH. Il joue le rôle de pont de communication entre l'ESP32 et un ordinateur via le port USB. Cela facilite les mises à jour du téléphone et la surveillance en temps réel des calculs réalisés par l'ESP32.

## L'alimentation

Le système d'alimentation se compose de trois éléments distincts. Le module de charge de batterie, basé sur un composant tel que le TP4056, gère la charge de la batterie via le port USB. Un circuit de gestion de batterie comme le DW01 permet une charge et une décharge sécurisées pour prolonger la durée de vie de la batterie. Enfin, un régulateur de tension convertit l'énergie de la batterie en un voltage approprié pour alimenter l'ensemble du circuit.

## La mémoire SPI

La mémoire SPI est réalisée au moyen d'une carte micro SD, un dispositif de stockage amovible fabriqué par divers fabricants. Étant donné que l'ESP32 dispose d'un espace de stockage limité, cette mémoire externe est essentielle pour stocker des messages, des images et d'autres données nécessaires au fonctionnement du téléphone.

## L'écran

L'écran du PaxoPhone est de type 320x480 avec une technologie tactile résistive. Bien que considérée comme une option économique, cette technologie fonctionnelle permet d'afficher l'interface utilisateur et offre à l'utilisateur la possibilité d'interagir avec le système d'exploitation.
La technologie va probablement évoluer vers  un écran classique capacitif dans les prochaines versions.

## Conclusion

Le PaxoPhone est le résultat d'un projet ambitieux visant à créer un téléphone fonctionnel à faible coût. En utilisant des composants bien sélectionnés tels que l'ESP32, le SIM800L, le CH340C, et en intégrant une mémoire SPI et un écran tactile, le PaxoPhone offre une expérience utilisateur de base mais satisfaisante. Les schémas du circuit sont disponibles pour consultation, permettant aux enthousiastes et aux développeurs de contribuer à l'amélioration continue du projet.
Le shéma du PCB est disponible ici: https://oshwlab.com/gabriel.rochet/prototype-1
