// Szczury — interactive architecture map. Data is generated from the project's C# sources
// (class references), curated into 68 nodes; edges mean "A references B".
const ARCH = {"nodes": [{"id": "ServiceLocator", "label": "ServiceLocator", "layer": "core", "patterns": ["locator"], "role": "Static registry: any system asks it for a service instead of holding a direct reference.", "file": "Core/ServiceLocator.cs"}, {"id": "PatternsBootstrapper", "label": "PatternsBootstrapper", "layer": "core", "patterns": ["locator", "factory"], "role": "Composition root: builds the pool, registries, launcher and factories, then registers them.", "file": "Core/PatternsBootstrapper.cs"}, {"id": "PersistentSingleton", "label": "PersistentSingleton<T>", "layer": "core", "patterns": ["singleton"], "role": "Base class for managers that survive scene loads (GameManager, AudioManager).", "file": "Core/Singletons/PersistentSingleton.cs"}, {"id": "DestroyableSingleton", "label": "DestroyableSingleton<T>", "layer": "core", "patterns": ["singleton"], "role": "Base class for per-scene managers that die with the scene.", "file": "Core/Singletons/DestroyableSingleton.cs"}, {"id": "PoolingService", "label": "PoolingService", "layer": "core", "patterns": ["pool"], "role": "Hands out and takes back pooled prefabs so waves of rats never allocate.", "file": "Core/Pooling/PoolingService.cs"}, {"id": "PrefabPool", "label": "PrefabPool", "layer": "core", "patterns": ["pool"], "role": "One pool per prefab: a stack of inactive instances ready to be reused.", "file": "Core/Pooling/PrefabPool.cs"}, {"id": "StateMachine", "label": "StateMachine", "layer": "core", "patterns": ["state"], "role": "Tiny FSM: holds the current IState, calls Exit on the old one and Enter on the new.", "file": "Core/Patterns/StateMachine.cs"}, {"id": "IState", "label": "IState", "layer": "core", "patterns": ["state"], "role": "Enter / Update / Exit — the contract every enemy state implements.", "file": "Core/Patterns/IState.cs"}, {"id": "IPrototype", "label": "IPrototype<T>", "layer": "core", "patterns": ["prototype"], "role": "Clone() contract for objects that copy themselves instead of being re-built.", "file": "Core/Patterns/IPrototype.cs"}, {"id": "GameManager", "label": "GameManager", "layer": "systems", "patterns": ["singleton", "observer"], "role": "Owns the game phase (Prepare, Wave, Won, Lost) and broadcasts changes.", "file": "Systems/Game/GameManager.cs"}, {"id": "TimeScaleController", "label": "TimeScaleController", "layer": "systems", "patterns": [], "role": "1× / 2× / 3× game speed and pause through Time.timeScale.", "file": "Systems/Game/TimeScaleController.cs"}, {"id": "GameInput", "label": "GameInput", "layer": "systems", "patterns": [], "role": "Wraps the generated New Input System actions and exposes them to the game.", "file": "Systems/Input/GameInput.cs"}, {"id": "TowerSlotInputHandler", "label": "TowerSlotInputHandler", "layer": "systems", "patterns": [], "role": "Turns clicks and hotkeys into slot selection on TowerManager.", "file": "UI/InputHandlers/TowerSlotInputHandler.cs"}, {"id": "CommandInvokerInputHandler", "label": "CommandInvokerInputHandler", "layer": "systems", "patterns": ["command"], "role": "Ctrl+Z / Ctrl+Y → CommandInvoker.Undo / Redo.", "file": "Systems/Input/CommandInvokerInputHandler.cs"}, {"id": "CommandInvoker", "label": "CommandInvoker", "layer": "systems", "patterns": ["command", "singleton"], "role": "Runs ICommands and keeps undo / redo stacks.", "file": "Systems/Command/CommandInvoker.cs"}, {"id": "ICommand", "label": "ICommand", "layer": "systems", "patterns": ["command"], "role": "Execute() returns success; Undo() reverses it.", "file": "Systems/Command/ICommand.cs"}, {"id": "AudioManager", "label": "AudioManager", "layer": "systems", "patterns": ["singleton"], "role": "Plays SFX by id and crossfades music tracks from the AudioLibrary.", "file": "Systems/Audio/AudioManager.cs"}, {"id": "AudioLibrary", "label": "AudioLibrary", "layer": "systems", "patterns": [], "role": "ScriptableObject mapping SfxId and MusicTrack to clips — the 15 sounds we recorded.", "file": "Systems/Audio/AudioLibrary.cs"}, {"id": "DynamicMusicController", "label": "DynamicMusicController", "layer": "systems", "patterns": ["observer"], "role": "Listens to game phase and base health and switches the music accordingly.", "file": "Systems/Audio/DynamicMusicController.cs"}, {"id": "AudioListeners", "label": "Audio listeners ×3", "layer": "systems", "patterns": ["observer"], "role": "Tower, enemy and game-flow listeners subscribe to events and ask AudioManager to play.", "file": "Systems/Audio/*AudioListener.cs"}, {"id": "Camera", "label": "Camera rig + input", "layer": "systems", "patterns": [], "role": "Pan, zoom and rotate the isometric camera from input actions.", "file": "Systems/Camera/"}, {"id": "TutorialManager", "label": "TutorialManager", "layer": "systems", "patterns": ["singleton", "observer"], "role": "Steps through TutorialStep assets, watching the game for each step’s completion condition.", "file": "Systems/Tutorial/TutorialManager.cs"}, {"id": "TutorialStep", "label": "TutorialStep", "layer": "systems", "patterns": [], "role": "ScriptableObject: message, highlight target and the condition that completes the step.", "file": "Systems/Tutorial/TutorialStep.cs"}, {"id": "TowerManager", "label": "TowerManager", "layer": "towers", "patterns": ["singleton", "observer"], "role": "Selection, build, upgrade and sell logic; fires events the UI and audio listen to.", "file": "Gameplay/Towers/TowerManager.cs"}, {"id": "TowerFactory", "label": "TowerFactory", "layer": "towers", "patterns": ["factory"], "role": "Creates towers from a type, a config or a prototype.", "file": "Gameplay/Towers/TowerFactory.cs"}, {"id": "TowerPrototype", "label": "TowerPrototype", "layer": "towers", "patterns": ["prototype"], "role": "A ready-made tower that clones itself into a slot.", "file": "Gameplay/Towers/TowerPrototype.cs"}, {"id": "TowerFlyweightRegistry", "label": "TowerFlyweightRegistry", "layer": "towers", "patterns": ["flyweight"], "role": "One shared TowerConfig per TowerType — stats are never duplicated per instance.", "file": "Gameplay/Towers/TowerFlyweightRegistry.cs"}, {"id": "TowerConfig", "label": "TowerConfig", "layer": "towers", "patterns": ["flyweight"], "role": "ScriptableObject with damage, range, fire rate, tiers, projectile and targeting priority.", "file": "Gameplay/Towers/TowerConfig.cs"}, {"id": "Tower", "label": "Tower", "layer": "towers", "patterns": ["strategy", "observer"], "role": "Finds a target through its strategy, fires through the launcher, raises OnTowerFired.", "file": "Gameplay/Towers/Tower.cs"}, {"id": "PoisonTower", "label": "PoisonTower", "layer": "towers", "patterns": [], "role": "Tower variant: damage over time.", "file": "Gameplay/Towers/PoisonTower.cs"}, {"id": "SlowTower", "label": "SlowTower", "layer": "towers", "patterns": [], "role": "Tower variant: slows rats on hit.", "file": "Gameplay/Towers/SlowTower.cs"}, {"id": "TowerSlot", "label": "TowerSlot", "layer": "towers", "patterns": [], "role": "A buildable spot on the map; knows whether it holds a tower.", "file": "Gameplay/Towers/TowerSlot.cs"}, {"id": "BuildTowerCommand", "label": "BuildTowerCommand", "layer": "towers", "patterns": ["command"], "role": "Execute builds on a slot; Undo refunds the cost and removes the tower.", "file": "Gameplay/Towers/Commands/BuildTowerCommand.cs"}, {"id": "UpgradeTowerCommand", "label": "UpgradeTowerCommand", "layer": "towers", "patterns": ["command"], "role": "Execute raises the tier; Undo drops it back and refunds.", "file": "Gameplay/Towers/Commands/UpgradeTowerCommand.cs"}, {"id": "SellTowerCommand", "label": "SellTowerCommand", "layer": "towers", "patterns": ["command"], "role": "Execute sells for a partial refund; Undo rebuilds it.", "file": "Gameplay/Towers/Commands/SellTowerCommand.cs"}, {"id": "TargetingStrategyFlyweights", "label": "TargetingStrategyFlyweights", "layer": "towers", "patterns": ["strategy", "flyweight"], "role": "One shared instance per strategy type, handed to towers on demand.", "file": "Gameplay/Towers/Targeting/TargetingStrategyFlyweights.cs"}, {"id": "ITargetingStrategy", "label": "ITargetingStrategy", "layer": "towers", "patterns": ["strategy"], "role": "SelectTarget(candidates, origin) — swap the rule, keep the tower.", "file": "Gameplay/Towers/Targeting/ITargetingStrategy.cs"}, {"id": "ClosestTargetingStrategy", "label": "ClosestTargetingStrategy", "layer": "towers", "patterns": ["strategy"], "role": "Picks the rat nearest to the tower.", "file": "Gameplay/Towers/Targeting/ClosestTargetingStrategy.cs"}, {"id": "WeakestTargetingStrategy", "label": "WeakestTargetingStrategy", "layer": "towers", "patterns": ["strategy"], "role": "Picks the rat with the least health left.", "file": "Gameplay/Towers/Targeting/WeakestTargetingStrategy.cs"}, {"id": "ProjectileLauncher", "label": "ProjectileLauncher", "layer": "towers", "patterns": ["pool"], "role": "Takes a projectile from the pool, aims it and fires.", "file": "Gameplay/Projectiles/ProjectileLauncher.cs"}, {"id": "Projectile", "label": "Projectile", "layer": "towers", "patterns": ["pool"], "role": "Flies to its target, deals damage, returns itself to the pool.", "file": "Gameplay/Projectiles/Projectile.cs"}, {"id": "WaveManager", "label": "WaveManager", "layer": "enemies", "patterns": ["singleton", "observer"], "role": "Runs waves as coroutines, counts remaining rats, announces wave start and end.", "file": "Gameplay/Waves/WaveManager.cs"}, {"id": "WaveConfig", "label": "WaveConfig", "layer": "enemies", "patterns": [], "role": "ScriptableObject: spawn groups (type, count, interval) for one wave.", "file": "Gameplay/Waves/WaveConfig.cs"}, {"id": "EnemyFactory", "label": "EnemyFactory", "layer": "enemies", "patterns": ["factory", "pool"], "role": "Builds a prototype per enemy type once, then clones it out of the pool.", "file": "Gameplay/Enemies/EnemyFactory.cs"}, {"id": "EnemyPrototype", "label": "EnemyPrototype", "layer": "enemies", "patterns": ["prototype"], "role": "Config + prefab pair that clones into a live rat.", "file": "Gameplay/Enemies/EnemyPrototype.cs"}, {"id": "EnemyFlyweightRegistry", "label": "EnemyFlyweightRegistry", "layer": "enemies", "patterns": ["flyweight"], "role": "Shared EnemyConfig per EnemyType.", "file": "Gameplay/Enemies/EnemyFlyweightRegistry.cs"}, {"id": "EnemyConfig", "label": "EnemyConfig", "layer": "enemies", "patterns": ["flyweight"], "role": "ScriptableObject: health, speed, damage, reward for one rat type.", "file": "Gameplay/Enemies/EnemyConfig.cs"}, {"id": "EnemyBase", "label": "EnemyBase", "layer": "enemies", "patterns": ["state", "observer", "pool"], "role": "The rat: health, slow effects, a StateMachine, OnDied event, returns to the pool.", "file": "Gameplay/Enemies/EnemyBase.cs"}, {"id": "TankEnemy", "label": "TankEnemy", "layer": "enemies", "patterns": [], "role": "Slow, lots of health.", "file": "Gameplay/Enemies/TankEnemy.cs"}, {"id": "FastEnemy", "label": "FastEnemy", "layer": "enemies", "patterns": [], "role": "Fragile, very quick.", "file": "Gameplay/Enemies/FastEnemy.cs"}, {"id": "DivaEnemy", "label": "DivaEnemy", "layer": "enemies", "patterns": [], "role": "Dramatic. Has her own entrance.", "file": "Gameplay/Enemies/DivaEnemy.cs"}, {"id": "EnemyMoveState", "label": "EnemyMoveState", "layer": "enemies", "patterns": ["state"], "role": "Follow the waypoints; switch to Attack at the base.", "file": "Gameplay/Enemies/States/EnemyMoveState.cs"}, {"id": "EnemyAttackState", "label": "EnemyAttackState", "layer": "enemies", "patterns": ["state"], "role": "Chew on the base until it or the rat is gone.", "file": "Gameplay/Enemies/States/EnemyAttackState.cs"}, {"id": "EnemyDeathState", "label": "EnemyDeathState", "layer": "enemies", "patterns": ["state"], "role": "Play death, pay the reward, release to the pool.", "file": "Gameplay/Enemies/States/EnemyDeathState.cs"}, {"id": "WaypointPath", "label": "WaypointPath", "layer": "enemies", "patterns": [], "role": "The route rats follow, as a list of transforms.", "file": "Gameplay/Paths/WaypointPath.cs"}, {"id": "BaseHealth", "label": "BaseHealth", "layer": "enemies", "patterns": ["observer"], "role": "Health of the base you defend; raises change and death events.", "file": "Gameplay/Base/BaseHealth.cs"}, {"id": "ResourceManager", "label": "ResourceManager", "layer": "enemies", "patterns": ["singleton", "observer"], "role": "Crystals: pay for towers, earn for kills, announce every change.", "file": "Gameplay/Economy/ResourceManager.cs"}, {"id": "UI_TowerBuild", "label": "TowerBuild P · V", "layer": "ui", "patterns": ["mvp", "observer"], "role": "Build picker: presenter listens to TowerManager, view only draws.", "file": "UI/MVP/*/TowerBuild*.cs"}, {"id": "UI_TowerUpgrade", "label": "TowerUpgrade P · V", "layer": "ui", "patterns": ["mvp", "observer", "command"], "role": "Upgrade / sell panel; every button becomes a command on the invoker.", "file": "UI/MVP/*/TowerUpgrade*.cs"}, {"id": "UI_WaveControl", "label": "WaveControl P · V", "layer": "ui", "patterns": ["mvp", "observer"], "role": "The “start wave” button and its enabled state.", "file": "UI/MVP/*/WaveControl*.cs"}, {"id": "UI_WaveCounter", "label": "WaveCounter P · V", "layer": "ui", "patterns": ["mvp", "observer"], "role": "Wave 7 / 10.", "file": "UI/MVP/*/WaveCounter*.cs"}, {"id": "UI_WavePreview", "label": "WavePreview P · V", "layer": "ui", "patterns": ["mvp", "observer"], "role": "Icons of what the next wave brings, read from the flyweight registry.", "file": "UI/MVP/*/WavePreview*.cs"}, {"id": "UI_Resource", "label": "Resource P · V", "layer": "ui", "patterns": ["mvp", "observer"], "role": "Crystal counter.", "file": "UI/MVP/*/Resource*.cs"}, {"id": "UI_BaseHealth", "label": "BaseHealth P · V", "layer": "ui", "patterns": ["mvp", "observer"], "role": "Base health bar.", "file": "UI/MVP/*/BaseHealth*.cs"}, {"id": "UI_EnemyHealthBar", "label": "EnemyHealthBar", "layer": "ui", "patterns": ["mvp", "observer"], "role": "Spawns a bar above each rat and follows it.", "file": "UI/Components/EnemyHealthBarSpawner.cs"}, {"id": "UI_GameOver", "label": "GameOver P · V", "layer": "ui", "patterns": ["mvp", "observer"], "role": "Win / lose screen driven by GameManager.", "file": "UI/MVP/*/GameOver*.cs"}, {"id": "UI_Tooltip", "label": "Tooltip P · V", "layer": "ui", "patterns": ["mvp"], "role": "Hover info for towers and tutorial hints.", "file": "UI/MVP/*/Tooltip*.cs"}, {"id": "UI_Tutorial", "label": "Tutorial P · V", "layer": "ui", "patterns": ["mvp", "observer"], "role": "Shows the current tutorial step and highlight.", "file": "UI/MVP/*/Tutorial*.cs"}], "edges": [["AudioListeners", "AudioManager"], ["AudioListeners", "EnemyBase"], ["AudioListeners", "GameManager"], ["AudioListeners", "Tower"], ["AudioListeners", "TowerManager"], ["AudioListeners", "WaveManager"], ["AudioManager", "AudioLibrary"], ["AudioManager", "PersistentSingleton"], ["BuildTowerCommand", "ICommand"], ["BuildTowerCommand", "ResourceManager"], ["BuildTowerCommand", "TowerConfig"], ["BuildTowerCommand", "TowerManager"], ["BuildTowerCommand", "TowerSlot"], ["Camera", "GameInput"], ["ClosestTargetingStrategy", "EnemyBase"], ["ClosestTargetingStrategy", "ITargetingStrategy"], ["CommandInvoker", "DestroyableSingleton"], ["CommandInvoker", "GameManager"], ["CommandInvoker", "ICommand"], ["CommandInvokerInputHandler", "CommandInvoker"], ["CommandInvokerInputHandler", "GameInput"], ["DivaEnemy", "EnemyBase"], ["DynamicMusicController", "AudioManager"], ["DynamicMusicController", "BaseHealth"], ["DynamicMusicController", "GameManager"], ["EnemyAttackState", "EnemyBase"], ["EnemyAttackState", "IState"], ["EnemyBase", "BaseHealth"], ["EnemyBase", "EnemyAttackState"], ["EnemyBase", "EnemyConfig"], ["EnemyBase", "EnemyDeathState"], ["EnemyBase", "EnemyMoveState"], ["EnemyBase", "IState"], ["EnemyBase", "PoolingService"], ["EnemyBase", "StateMachine"], ["EnemyBase", "WaypointPath"], ["EnemyDeathState", "EnemyBase"], ["EnemyDeathState", "IState"], ["EnemyFactory", "BaseHealth"], ["EnemyFactory", "EnemyBase"], ["EnemyFactory", "EnemyFlyweightRegistry"], ["EnemyFactory", "EnemyPrototype"], ["EnemyFactory", "PoolingService"], ["EnemyFactory", "WaypointPath"], ["EnemyFlyweightRegistry", "EnemyBase"], ["EnemyFlyweightRegistry", "EnemyConfig"], ["EnemyMoveState", "EnemyBase"], ["EnemyMoveState", "IState"], ["EnemyMoveState", "StateMachine"], ["EnemyPrototype", "EnemyBase"], ["EnemyPrototype", "EnemyConfig"], ["EnemyPrototype", "IPrototype"], ["FastEnemy", "EnemyBase"], ["GameManager", "BaseHealth"], ["GameManager", "PersistentSingleton"], ["ITargetingStrategy", "EnemyBase"], ["PatternsBootstrapper", "EnemyFactory"], ["PatternsBootstrapper", "EnemyFlyweightRegistry"], ["PatternsBootstrapper", "PoolingService"], ["PatternsBootstrapper", "ProjectileLauncher"], ["PatternsBootstrapper", "ServiceLocator"], ["PatternsBootstrapper", "TargetingStrategyFlyweights"], ["PatternsBootstrapper", "Tower"], ["PatternsBootstrapper", "TowerConfig"], ["PatternsBootstrapper", "TowerFactory"], ["PatternsBootstrapper", "TowerFlyweightRegistry"], ["PoisonTower", "EnemyBase"], ["PoisonTower", "Tower"], ["PoolingService", "PrefabPool"], ["Projectile", "EnemyBase"], ["Projectile", "PoolingService"], ["ProjectileLauncher", "EnemyBase"], ["ProjectileLauncher", "PoolingService"], ["ProjectileLauncher", "Projectile"], ["ResourceManager", "DestroyableSingleton"], ["ResourceManager", "EnemyBase"], ["SellTowerCommand", "ICommand"], ["SellTowerCommand", "ResourceManager"], ["SellTowerCommand", "TowerConfig"], ["SellTowerCommand", "TowerManager"], ["SellTowerCommand", "TowerSlot"], ["SlowTower", "EnemyBase"], ["SlowTower", "Tower"], ["StateMachine", "IState"], ["TankEnemy", "EnemyBase"], ["TargetingStrategyFlyweights", "ClosestTargetingStrategy"], ["TargetingStrategyFlyweights", "ITargetingStrategy"], ["TargetingStrategyFlyweights", "WeakestTargetingStrategy"], ["TimeScaleController", "GameInput"], ["TimeScaleController", "GameManager"], ["Tower", "ClosestTargetingStrategy"], ["Tower", "EnemyBase"], ["Tower", "GameManager"], ["Tower", "ITargetingStrategy"], ["Tower", "PoolingService"], ["Tower", "Projectile"], ["Tower", "ProjectileLauncher"], ["Tower", "TargetingStrategyFlyweights"], ["Tower", "TowerConfig"], ["Tower", "TowerManager"], ["Tower", "TowerSlot"], ["Tower", "WaveManager"], ["TowerConfig", "Projectile"], ["TowerFactory", "Tower"], ["TowerFactory", "TowerConfig"], ["TowerFactory", "TowerFlyweightRegistry"], ["TowerFactory", "TowerPrototype"], ["TowerFactory", "TowerSlot"], ["TowerFlyweightRegistry", "TowerConfig"], ["TowerManager", "DestroyableSingleton"], ["TowerManager", "GameManager"], ["TowerManager", "ResourceManager"], ["TowerManager", "Tower"], ["TowerManager", "TowerConfig"], ["TowerManager", "TowerFactory"], ["TowerManager", "TowerPrototype"], ["TowerManager", "TowerSlot"], ["TowerPrototype", "IPrototype"], ["TowerPrototype", "Tower"], ["TowerPrototype", "TowerConfig"], ["TowerSlot", "GameManager"], ["TowerSlot", "Tower"], ["TowerSlot", "TowerManager"], ["TowerSlotInputHandler", "GameInput"], ["TowerSlotInputHandler", "Tower"], ["TowerSlotInputHandler", "TowerManager"], ["TowerSlotInputHandler", "TowerSlot"], ["TutorialManager", "DestroyableSingleton"], ["TutorialManager", "GameInput"], ["TutorialManager", "GameManager"], ["TutorialManager", "ResourceManager"], ["TutorialManager", "TowerManager"], ["TutorialManager", "TutorialStep"], ["TutorialManager", "WaveManager"], ["UI_BaseHealth", "BaseHealth"], ["UI_EnemyHealthBar", "EnemyBase"], ["UI_GameOver", "GameManager"], ["UI_Resource", "ResourceManager"], ["UI_Tooltip", "TowerManager"], ["UI_Tooltip", "TutorialManager"], ["UI_Tooltip", "TutorialStep"], ["UI_TowerBuild", "GameManager"], ["UI_TowerBuild", "ResourceManager"], ["UI_TowerBuild", "Tower"], ["UI_TowerBuild", "TowerConfig"], ["UI_TowerBuild", "TowerManager"], ["UI_TowerBuild", "TowerSlot"], ["UI_TowerUpgrade", "BuildTowerCommand"], ["UI_TowerUpgrade", "CommandInvoker"], ["UI_TowerUpgrade", "GameManager"], ["UI_TowerUpgrade", "ResourceManager"], ["UI_TowerUpgrade", "SellTowerCommand"], ["UI_TowerUpgrade", "Tower"], ["UI_TowerUpgrade", "TowerConfig"], ["UI_TowerUpgrade", "TowerManager"], ["UI_TowerUpgrade", "TowerSlot"], ["UI_TowerUpgrade", "TutorialManager"], ["UI_TowerUpgrade", "TutorialStep"], ["UI_TowerUpgrade", "UpgradeTowerCommand"], ["UI_Tutorial", "TutorialManager"], ["UI_Tutorial", "TutorialStep"], ["UI_WaveControl", "GameManager"], ["UI_WaveControl", "TutorialManager"], ["UI_WaveControl", "TutorialStep"], ["UI_WaveControl", "WaveManager"], ["UI_WaveCounter", "GameManager"], ["UI_WaveCounter", "WaveManager"], ["UI_WavePreview", "EnemyFlyweightRegistry"], ["UI_WavePreview", "GameManager"], ["UI_WavePreview", "WaveManager"], ["UpgradeTowerCommand", "ICommand"], ["UpgradeTowerCommand", "ResourceManager"], ["UpgradeTowerCommand", "TowerManager"], ["UpgradeTowerCommand", "TowerSlot"], ["WaveConfig", "EnemyBase"], ["WaveManager", "BaseHealth"], ["WaveManager", "DestroyableSingleton"], ["WaveManager", "EnemyBase"], ["WaveManager", "EnemyFactory"], ["WaveManager", "EnemyFlyweightRegistry"], ["WaveManager", "GameManager"], ["WaveManager", "WaveConfig"], ["WaveManager", "WaypointPath"], ["WeakestTargetingStrategy", "EnemyBase"], ["WeakestTargetingStrategy", "ITargetingStrategy"]], "patterns": [{"id": "factory", "name": "Factory", "text": "TowerFactory and EnemyFactory are the only places that know how a tower or a rat comes into existence."}, {"id": "prototype", "name": "Prototype", "text": "Towers and enemies are built once as prototypes and then cloned — a new rat is a copy, not a rebuild."}, {"id": "pool", "name": "Object Pool", "text": "Rats and projectiles come from PoolingService and go back when they die. Fifty rats, zero allocations."}, {"id": "flyweight", "name": "Flyweight", "text": "Every tower of a type shares one TowerConfig; every rat of a type shares one EnemyConfig. Stats live once."}, {"id": "mvp", "name": "MVP", "text": "Ten presenters, thirteen views. Views only draw; presenters subscribe to the game and tell views what to show."}, {"id": "state", "name": "State", "text": "Each rat runs a StateMachine: Move → Attack → Death. Behaviour lives in states, not in a giant Update()."}, {"id": "strategy", "name": "Strategy", "text": "How a tower picks its target is a swappable ITargetingStrategy: closest or weakest, decided by config."}, {"id": "command", "name": "Command", "text": "Build, upgrade and sell are commands on CommandInvoker — which is why the game has undo and redo."}, {"id": "observer", "name": "Observer", "text": "Managers raise C# events; UI, audio and music subscribe. Nobody polls."}, {"id": "singleton", "name": "Singleton", "text": "Two base classes: persistent across scenes or destroyable with the scene. Used only for managers."}, {"id": "locator", "name": "Service Locator", "text": "PatternsBootstrapper builds the factories, registries and pool, then registers them for everyone to find."}], "traces": [{"id": "build", "name": "Build a tower", "steps": [{"n": "GameInput", "t": "You click a free slot."}, {"n": "TowerSlotInputHandler", "t": "The input handler resolves which slot you meant."}, {"n": "TowerManager", "t": "TowerManager selects the slot and raises OnSlotSelectionChanged."}, {"n": "UI_TowerUpgrade", "t": "The panel presenter hears it and shows the build options."}, {"n": "CommandInvoker", "t": "You pick a tower: the presenter hands a BuildTowerCommand to the invoker."}, {"n": "BuildTowerCommand", "t": "Execute() runs — and the command is pushed on the undo stack."}, {"n": "ResourceManager", "t": "Crystals are spent. ResourceManager announces the new balance."}, {"n": "TowerManager", "t": "TowerManager asks the factory for a tower."}, {"n": "TowerFactory", "t": "The factory finds the prototype for this tower type."}, {"n": "TowerFlyweightRegistry", "t": "Stats come from the one shared TowerConfig — nothing is copied."}, {"n": "TowerPrototype", "t": "The prototype clones itself into the slot."}, {"n": "Tower", "t": "A live Tower starts looking for rats."}, {"n": "AudioListeners", "t": "The tower audio listener hears OnTowerBuilt…"}, {"n": "AudioManager", "t": "…and AudioManager plays the “built” sound we recorded."}]}, {"id": "wave", "name": "Start a wave", "steps": [{"n": "UI_WaveControl", "t": "You press “Start wave”."}, {"n": "WaveManager", "t": "WaveManager starts the next wave as a coroutine."}, {"n": "WaveConfig", "t": "The WaveConfig says which rats, how many, how often."}, {"n": "EnemyFactory", "t": "For each spawn, EnemyFactory is asked for a rat."}, {"n": "EnemyFlyweightRegistry", "t": "Shared EnemyConfig for that type — health, speed, reward."}, {"n": "EnemyPrototype", "t": "The prototype clones…"}, {"n": "PoolingService", "t": "…out of the pool, so no new GameObject is allocated."}, {"n": "EnemyBase", "t": "The rat wakes up with a fresh StateMachine."}, {"n": "EnemyMoveState", "t": "Move state: follow the waypoints."}, {"n": "WaypointPath", "t": "The path is a list of transforms on the map."}, {"n": "EnemyAttackState", "t": "At the base the rat switches to Attack."}, {"n": "BaseHealth", "t": "BaseHealth drops and raises an event."}, {"n": "UI_BaseHealth", "t": "The health bar presenter updates its view."}, {"n": "GameManager", "t": "At zero, GameManager flips the phase to Lost…"}, {"n": "UI_GameOver", "t": "…and the game-over presenter shows the screen."}]}, {"id": "fire", "name": "A tower fires", "steps": [{"n": "Tower", "t": "Every frame the tower checks its cooldown and range."}, {"n": "TargetingStrategyFlyweights", "t": "It asks the registry for its strategy — one shared instance."}, {"n": "ClosestTargetingStrategy", "t": "Closest strategy picks the nearest rat (or Weakest, by config)."}, {"n": "ProjectileLauncher", "t": "The launcher takes a projectile…"}, {"n": "PoolingService", "t": "…from the pool."}, {"n": "Projectile", "t": "The projectile flies and lands."}, {"n": "EnemyBase", "t": "The rat takes damage. Health hits zero."}, {"n": "EnemyDeathState", "t": "Death state: play the animation, pay the reward."}, {"n": "ResourceManager", "t": "ResourceManager adds crystals and announces it."}, {"n": "UI_Resource", "t": "The crystal counter updates."}, {"n": "AudioListeners", "t": "The enemy audio listener hears OnDied…"}, {"n": "AudioManager", "t": "…and plays the squeak."}, {"n": "PoolingService", "t": "The rat and the projectile return to the pool."}]}, {"id": "undo", "name": "Undo (Ctrl+Z)", "steps": [{"n": "CommandInvokerInputHandler", "t": "Ctrl+Z is an input action."}, {"n": "CommandInvoker", "t": "The invoker pops the last command off the undo stack."}, {"n": "BuildTowerCommand", "t": "BuildTowerCommand.Undo() runs."}, {"n": "ResourceManager", "t": "The crystals come back."}, {"n": "TowerManager", "t": "The tower is removed without a refund (it was already refunded)."}, {"n": "UI_TowerUpgrade", "t": "The panel redraws. Ctrl+Y would replay the command from the redo stack."}]}], "layers": [{"id": "core", "name": "Core", "hint": "patterns & plumbing"}, {"id": "systems", "name": "Systems", "hint": "game, input, audio, tutorial"}, {"id": "towers", "name": "Towers", "hint": "build, target, fire"}, {"id": "enemies", "name": "Enemies & economy", "hint": "waves, rats, crystals"}, {"id": "ui", "name": "UI · MVP", "hint": "presenters & views"}]};

(function () {
  const root = document.getElementById("arch");
  if (!root) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";

  const COL_W = 224, COL_GAP = 10, NODE_W = 200, NODE_H = 26, PITCH = 33, HEAD = 44, PAD_X = 16, PAD_Y = 14;
  const layers = ARCH.layers;
  const colIndex = Object.fromEntries(layers.map((l, i) => [l.id, i]));
  const nodes = ARCH.nodes;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const perCol = {};
  nodes.forEach((n) => { (perCol[n.layer] ||= []).push(n); n.col = colIndex[n.layer]; n.row = perCol[n.layer].length - 1; });
  const rows = Math.max(...Object.values(perCol).map((a) => a.length));
  const W = PAD_X * 2 + layers.length * COL_W + (layers.length - 1) * COL_GAP;
  const H = HEAD + PAD_Y + rows * PITCH + PAD_Y;
  nodes.forEach((n) => { n.x = PAD_X + n.col * (COL_W + COL_GAP) + (COL_W - NODE_W) / 2; n.y = HEAD + PAD_Y + n.row * PITCH; });

  const uses = {}, usedBy = {};
  ARCH.edges.forEach(([a, b]) => { (uses[a] ||= []).push(b); (usedBy[b] ||= []).push(a); });

  // ---- DOM scaffold ----
  root.innerHTML = `
    <div class="arch__bar">
      <div class="arch__chips" data-role="patterns"></div>
      <div class="arch__traces" data-role="traces"></div>
    </div>
    <div class="arch__stage"><svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Class map of Szczury"></svg></div>
    <div class="arch__panel" data-role="panel"></div>`;
  const svg = root.querySelector("svg");
  const chipsBox = root.querySelector('[data-role="patterns"]');
  const tracesBox = root.querySelector('[data-role="traces"]');
  const panel = root.querySelector('[data-role="panel"]');

  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    (parent || svg).append(e);
    return e;
  };

  // Column headers
  layers.forEach((l, i) => {
    const x = PAD_X + i * (COL_W + COL_GAP);
    const g = el("g", { class: "arch__col arch__col--" + l.id });
    el("rect", { x, y: 0, width: COL_W, height: H, rx: 0 }, g);
    el("text", { x: x + 12, y: 22, class: "arch__colname" }, g).textContent = l.name.toUpperCase();
    el("text", { x: x + 12, y: 36, class: "arch__colhint" }, g).textContent = l.hint;
  });

  // Edges
  const edgeEls = [];
  const edgeKey = (a, b) => a + "→" + b;
  const edgeMap = {};
  function pathFor(a, b) {
    const ax = a.x, ay = a.y + NODE_H / 2, bx = b.x, by = b.y + NODE_H / 2;
    if (b.col > a.col) {
      const x1 = ax + NODE_W, x2 = bx, dx = (x2 - x1) * 0.5;
      return `M${x1},${ay} C${x1 + dx},${ay} ${x2 - dx},${by} ${x2},${by}`;
    }
    if (b.col < a.col) {
      const x1 = ax, x2 = bx + NODE_W, dx = (x1 - x2) * 0.5;
      return `M${x1},${ay} C${x1 - dx},${ay} ${x2 + dx},${by} ${x2},${by}`;
    }
    const x1 = ax + NODE_W, bulge = 28 + Math.abs(by - ay) * 0.12;
    return `M${x1},${ay} C${x1 + bulge},${ay} ${x1 + bulge},${by} ${x1},${by}`;
  }
  const edgeLayer = el("g", { class: "arch__edges" });
  ARCH.edges.forEach(([a, b]) => {
    const p = el("path", { d: pathFor(byId[a], byId[b]), class: "arch__edge" }, edgeLayer);
    p.dataset.a = a; p.dataset.b = b;
    edgeEls.push(p); edgeMap[edgeKey(a, b)] = p;
  });
  const traceLayer = el("g", { class: "arch__trace-edges" });

  // Nodes
  const nodeEls = {};
  const nodeLayer = el("g", { class: "arch__nodes" });
  nodes.forEach((n) => {
    const g = el("g", { class: "arch__node arch__node--" + n.layer, transform: `translate(${n.x},${n.y})`, tabindex: 0, role: "button" }, nodeLayer);
    g.dataset.id = n.id;
    el("rect", { width: NODE_W, height: NODE_H, rx: 2 }, g);
    const t = el("text", { x: 10, y: 17 }, g); t.textContent = n.label;
    if (n.patterns.length) {
      n.patterns.slice(0, 4).forEach((p, i) => el("circle", { cx: NODE_W - 10 - i * 9, cy: NODE_H / 2, r: 2.6, class: "arch__dot arch__dot--" + p }, g));
    }
    nodeEls[n.id] = g;
    g.addEventListener("click", () => select(n.id));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.id); } });
    g.addEventListener("mouseenter", () => { if (!state.sel && !state.trace && !state.pattern) emphasize(n.id, false); });
    g.addEventListener("mouseleave", () => { if (!state.sel && !state.trace && !state.pattern) clearEmphasis(); });
  });

  // ---- State & highlighting ----
  const state = { sel: null, pattern: null, trace: null, timer: null, step: 0 };

  function clearEmphasis() {
    Object.values(nodeEls).forEach((g) => g.classList.remove("is-sel", "is-nb", "is-dim", "is-done", "is-on"));
    edgeEls.forEach((p) => p.classList.remove("is-hl", "is-dim", "is-in", "is-out"));
    traceLayer.innerHTML = "";
  }
  function emphasize(id, lock) {
    clearEmphasis();
    const nb = new Set([...(uses[id] || []), ...(usedBy[id] || [])]);
    Object.values(nodeEls).forEach((g) => {
      const i = g.dataset.id;
      g.classList.toggle("is-sel", i === id);
      g.classList.toggle("is-nb", nb.has(i));
      g.classList.toggle("is-dim", i !== id && !nb.has(i));
    });
    edgeEls.forEach((p) => {
      const out = p.dataset.a === id, inn = p.dataset.b === id;
      p.classList.toggle("is-out", out);
      p.classList.toggle("is-in", inn);
      p.classList.toggle("is-hl", out || inn);
      p.classList.toggle("is-dim", !(out || inn));
    });
    if (lock) nodeEls[id].scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function chip(id, label, cls) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "arch__chip " + (cls || ""); b.textContent = label; b.dataset.id = id;
    return b;
  }
  function tagHtml(p) { const d = ARCH.patterns.find((x) => x.id === p); return `<button type="button" class="arch__tag arch__tag--${p}" data-pattern="${p}">${d ? d.name : p}</button>`; }
  function refHtml(id) { const n = byId[id]; return `<button type="button" class="arch__ref arch__ref--${n.layer}" data-node="${id}">${n.label}</button>`; }

  function renderIntro() {
    panel.innerHTML = `
      <div class="arch__intro">
        <p class="arch__title">106 scripts, 11 patterns, one map.</p>
        <p>Click any class to see what it does, what it uses and who uses it. Pick a pattern to light up every class that takes part in it. Or press play on a trace and watch one click travel through the code.</p>
        <p class="arch__legend">${layers.map((l) => `<span class="arch__key arch__key--${l.id}">${l.name}</span>`).join("")}</p>
      </div>`;
  }
  function renderNode(n) {
    const u = (uses[n.id] || []).filter((x) => x !== "PersistentSingleton" && x !== "DestroyableSingleton");
    const b = usedBy[n.id] || [];
    const base = (uses[n.id] || []).find((x) => x === "PersistentSingleton" || x === "DestroyableSingleton");
    panel.innerHTML = `
      <div class="arch__detail">
        <div class="arch__detail-main">
          <span class="arch__layer arch__layer--${n.layer}">${layers[n.col].name}${base ? " · " + base.replace("Singleton", " singleton").toLowerCase() : ""}</span>
          <h3 class="arch__name">${n.label}</h3>
          <p class="arch__role">${n.role}</p>
          <div class="arch__tags">${n.patterns.map(tagHtml).join("") || '<span class="arch__none">no named pattern — plain gameplay code</span>'}</div>
          <p class="arch__file">${n.file}</p>
        </div>
        <div class="arch__detail-refs">
          <p class="arch__refs-h">Uses <span>${u.length}</span></p>
          <div class="arch__refs">${u.map(refHtml).join("") || '<span class="arch__none">nothing — a leaf</span>'}</div>
          <p class="arch__refs-h">Used by <span>${b.length}</span></p>
          <div class="arch__refs">${b.map(refHtml).join("") || '<span class="arch__none">nobody references it directly (resolved via ServiceLocator or events)</span>'}</div>
        </div>
      </div>`;
  }
  function renderPattern(p) {
    const members = nodes.filter((n) => n.patterns.includes(p.id));
    panel.innerHTML = `
      <div class="arch__detail">
        <div class="arch__detail-main">
          <span class="arch__layer">Pattern</span>
          <h3 class="arch__name"><span class="arch__swatch arch__swatch--${p.id}"></span>${p.name}</h3>
          <p class="arch__role">${p.text}</p>
        </div>
        <div class="arch__detail-refs">
          <p class="arch__refs-h">In Szczury <span>${members.length}</span></p>
          <div class="arch__refs">${members.map((n) => refHtml(n.id)).join("")}</div>
        </div>
      </div>`;
  }
  function renderTrace(tr, i) {
    const s = tr.steps[i];
    panel.innerHTML = `
      <div class="arch__detail arch__detail--trace">
        <div class="arch__detail-main">
          <span class="arch__layer">Trace · ${tr.name} · step ${i + 1} / ${tr.steps.length}</span>
          <h3 class="arch__name">${byId[s.n].label}</h3>
          <p class="arch__role">${s.t}</p>
          <div class="arch__trace-ctl">
            <button type="button" class="arch__chip" data-trace-ctl="prev" ${i === 0 ? "disabled" : ""}>← Back</button>
            <button type="button" class="arch__chip" data-trace-ctl="next">${i === tr.steps.length - 1 ? "Replay" : "Next →"}</button>
            <button type="button" class="arch__chip arch__chip--quiet" data-trace-ctl="stop">Stop</button>
            <span class="arch__trace-auto">${state.timer ? "auto-playing" : "paused"}</span>
          </div>
        </div>
        <div class="arch__detail-refs">
          <p class="arch__refs-h">Path</p>
          <ol class="arch__steps">${tr.steps.map((st, k) => `<li class="${k < i ? "is-done" : k === i ? "is-now" : ""}"><button type="button" data-trace-go="${k}">${byId[st.n].label}</button></li>`).join("")}</ol>
        </div>
      </div>`;
  }

  // ---- Actions ----
  function stopTrace() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null; state.trace = null; state.step = 0;
    tracesBox.querySelectorAll(".arch__chip").forEach((c) => c.classList.remove("is-active"));
  }
  function select(id) {
    stopTrace();
    state.pattern = null; chipsBox.querySelectorAll(".arch__chip").forEach((c) => c.classList.remove("is-active"));
    if (state.sel === id) { state.sel = null; clearEmphasis(); renderIntro(); return; }
    state.sel = id; emphasize(id, true); renderNode(byId[id]);
  }
  function selectPattern(pid) {
    stopTrace(); state.sel = null;
    chipsBox.querySelectorAll(".arch__chip").forEach((c) => c.classList.toggle("is-active", c.dataset.id === pid && state.pattern !== pid));
    if (state.pattern === pid) { state.pattern = null; clearEmphasis(); renderIntro(); return; }
    state.pattern = pid; clearEmphasis();
    const members = new Set(nodes.filter((n) => n.patterns.includes(pid)).map((n) => n.id));
    Object.values(nodeEls).forEach((g) => { const on = members.has(g.dataset.id); g.classList.toggle("is-on", on); g.classList.toggle("is-dim", !on); });
    edgeEls.forEach((p) => { const on = members.has(p.dataset.a) && members.has(p.dataset.b); p.classList.toggle("is-hl", on); p.classList.toggle("is-dim", !on); });
    renderPattern(ARCH.patterns.find((p) => p.id === pid));
  }
  function showStep(tr, i) {
    state.step = i;
    clearEmphasis();
    const ids = tr.steps.map((s) => s.n);
    Object.values(nodeEls).forEach((g) => g.classList.add("is-dim"));
    for (let k = 0; k <= i; k++) {
      const g = nodeEls[ids[k]]; g.classList.remove("is-dim"); g.classList.add(k === i ? "is-sel" : "is-done");
      if (k > 0) {
        const a = ids[k - 1], b = ids[k];
        const e = edgeMap[edgeKey(a, b)] || edgeMap[edgeKey(b, a)];
        if (e) { e.classList.remove("is-dim"); e.classList.add("is-hl", k === i ? "is-now" : "is-trace"); }
        else {
          const p = el("path", { d: pathFor(byId[a], byId[b]), class: "arch__edge is-hl is-virtual " + (k === i ? "is-now" : "is-trace") }, traceLayer);
        }
      }
    }
    edgeEls.forEach((p) => { if (!p.classList.contains("is-hl")) p.classList.add("is-dim"); });
    renderTrace(tr, i);
    if (!reduceMotion) nodeEls[ids[i]].scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  function startTrace(tid) {
    const tr = ARCH.traces.find((t) => t.id === tid);
    if (state.trace && state.trace.id === tid) { stopTrace(); clearEmphasis(); renderIntro(); return; }
    stopTrace(); state.sel = null; state.pattern = null;
    chipsBox.querySelectorAll(".arch__chip").forEach((c) => c.classList.remove("is-active"));
    tracesBox.querySelectorAll(".arch__chip").forEach((c) => c.classList.toggle("is-active", c.dataset.id === tid));
    state.trace = tr;
    if (!reduceMotion) {
      state.timer = setInterval(() => {
        if (state.step >= tr.steps.length - 1) { clearInterval(state.timer); state.timer = null; renderTrace(tr, state.step); return; }
        showStep(tr, state.step + 1);
      }, 1500);
    }
    showStep(tr, 0);
  }

  // ---- Toolbar ----
  chipsBox.append(Object.assign(document.createElement("span"), { className: "arch__bar-label", textContent: "Patterns" }));
  ARCH.patterns.forEach((p) => {
    const c = chip(p.id, p.name, "arch__chip--" + p.id); chipsBox.append(c);
    c.addEventListener("click", () => selectPattern(p.id));
  });
  tracesBox.append(Object.assign(document.createElement("span"), { className: "arch__bar-label", textContent: "Traces" }));
  ARCH.traces.forEach((t) => {
    const c = chip(t.id, "▶ " + t.name, "arch__chip--trace"); tracesBox.append(c);
    c.addEventListener("click", () => startTrace(t.id));
  });

  panel.addEventListener("click", (e) => {
    const ref = e.target.closest("[data-node]"); if (ref) { select(ref.dataset.node); return; }
    const tag = e.target.closest("[data-pattern]"); if (tag) { selectPattern(tag.dataset.pattern); return; }
    const go = e.target.closest("[data-trace-go]"); if (go && state.trace) { if (state.timer) { clearInterval(state.timer); state.timer = null; } showStep(state.trace, Number(go.dataset.traceGo)); return; }
    const ctl = e.target.closest("[data-trace-ctl]"); if (ctl && state.trace) {
      const tr = state.trace; if (state.timer) { clearInterval(state.timer); state.timer = null; }
      if (ctl.dataset.traceCtl === "stop") { stopTrace(); clearEmphasis(); renderIntro(); }
      else if (ctl.dataset.traceCtl === "prev") showStep(tr, Math.max(0, state.step - 1));
      else showStep(tr, state.step >= tr.steps.length - 1 ? 0 : state.step + 1);
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { stopTrace(); state.sel = null; state.pattern = null; clearEmphasis(); renderIntro(); chipsBox.querySelectorAll(".arch__chip").forEach((c) => c.classList.remove("is-active")); } });

  renderIntro();

  // Attract mode: one slow pulse through the "build" trace until the visitor touches anything.
  if (!reduceMotion && "IntersectionObserver" in window) {
    let touched = false;
    root.addEventListener("pointerdown", () => { touched = true; }, { once: true, capture: true });
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || touched) return;
      io.disconnect();
      const tr = ARCH.traces[0]; let k = 0;
      const t = setInterval(() => {
        if (touched || state.sel || state.pattern || state.trace) { clearInterval(t); if (!state.sel && !state.pattern && !state.trace) { clearEmphasis(); } return; }
        if (k >= tr.steps.length) { clearInterval(t); clearEmphasis(); return; }
        clearEmphasis();
        const ids = tr.steps.map((s) => s.n);
        for (let j = Math.max(0, k - 3); j <= k; j++) {
          nodeEls[ids[j]].classList.add(j === k ? "is-sel" : "is-done");
          if (j > 0) { const e = edgeMap[edgeKey(ids[j - 1], ids[j])] || edgeMap[edgeKey(ids[j], ids[j - 1])]; if (e) e.classList.add("is-hl", "is-trace"); }
        }
        k++;
      }, 700);
    }, { threshold: 0.4 });
    io.observe(root);
  }
})();
