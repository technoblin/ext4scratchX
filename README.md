# ext4scratchX
Afin de permettre aux élèves de concevoir, réaliser et programmer la maquette d’un système automatisé, j’ai conçu cet ensemble d’outils en m’inspirant du service Xi d’Alan Yorinks, qui existe pour de nombreux systèmes.
L’ensemble se découpe en trois parties :
- L’extension ext4scratchX qui permet d’ajouter des blocs au logiciel ScratchX. Ces blocs permettront de piloter la future maquette.
- Le simulateur, qui permet de créer une maquette virtuelle à partir du code. Elle permet non seulement de faire quelques tests rudimentaires, mais également de guider les élèves pour l’assemblage des différents modules.
- Le service extServer pour Raspberry-Pi qui permet de recevoir les ordres transmis par l’extension et de les exécuter. La communication est bi-directionnelle, ce qui permet au service de renseigner les postes clients sur l’état des capteurs qui composent la maquette.

Les élèves sur un poste informatique, se connectent sur le logiciel en ligne ScratchX avec l’extension ext4scratchX, et réalisent un programme. Par l’utilisation d’un bloc de connexion, ils transmettent des ordres via le réseau informatique au service lancé sur le Raspberry-Pi qui les interprète.

L’ensemble des Raspbery Pi peut être commandé par chacun des postes élèves.
Le service supporte pour le moment 3 shields qui peuvent être utilisés simultanément :
- Le shield GrovePi+ qui permet la connexion de capteurs et d’actionneurs Grove.
- Le shield TS neo LEDs qui permet la connexion d’une matrice de LEDs de type ws2812b.
- Le shield Adafruit PWM PiHat ! qui permet la connexion de 16 servo-moteurs.
