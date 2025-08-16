'use strict';

var contextMenu = {
	cut: "&Wytnij",
	copy: "&Kopiuj",
	paste: "Wk&lej",
	selectAll: "Z&aznacz wszystko",
	undo: "&Cofnij",
	redo: "&Ponów",
	spellingLanguages: "Sprawdzanie pisowni",
	moreSpellingSuggestions: "Więcej propozycji pisowni",
	noSpellingSuggestions: "Brak sugestii",
	copyLinkAddress: "Kopiuj adres odnośnika",
	copyLinkText: "Kopiuj tekst odnośnika",
	openLink: "Otwórz odnośnik",
	saveImageAs: "Zapisz obraz jako..."
};
var dialog = {
	about: {
		title: "O {{- appName}}",
		version: "Wersja: <1>{{-version}}</1>",
		checkUpdates: "Sprawdź aktualizacje",
		checkUpdatesOnStart: "Sprawdzanie aktualizacji przy uruchomieniu",
		noUpdatesAvailable: "Brak dostępnych aktualizacji.",
		copyright: "Prawa autorskie {{copyright}}",
		errorWhenLookingForUpdates: "Wystąpił błąd podczas wyszukiwania aktualizacji",
		updateChannel: {
			label: "Kanał aktualizacji",
			latest: "Stabilny",
			beta: "Beta",
			alpha: "Alfa (Eksperymentalny)"
		}
	},
	addServer: {
		title: "Dodaj Serwer",
		message: "Chcesz dodać \"{{- host}}\" do swojej listy serwerów?",
		add: "Dodaj",
		cancel: "Anuluj"
	},
	addServerError: {
		title: "Niepoprawny host",
		message: "Serwer \"{{- host}}\" nie mógł być zweryfikowany, więc nie został dodany."
	},
	certificateError: {
		title: "Błąd certyfikatu",
		message: "Chcesz zaufać certyfikatowi od \"{{- issuerName}}\"?",
		yes: "Tak",
		no: "Nie"
	},
	resetAppData: {
		title: "Reset danych aplikacji",
		message: "Spowoduje to wylogowanie ze wszystkich zespołów i przywrócenie pierwotnych ustawień aplikacji. Tego nie da się cofnąć.",
		yes: "Tak",
		cancel: "Anuluj"
	},
	screenshare: {
		title: "Udostępnij swój ekran",
		announcement: "Wybierz ekran do udostępnienia"
	},
	update: {
		title: "Dostępna aktualizacja",
		announcement: "Nowa aktualizacja jest dostępna",
		message: "Nowa wersja aplikacji Rocket.Chat Desktop jest dostępna!",
		currentVersion: "Bieżąca wersja:",
		newVersion: "Nowa wersja:",
		install: "Zainstaluj aktualizację",
		remindLater: "Przypomnij mi później",
		skip: "Pomiń tę wersję"
	},
	updateDownloading: {
		title: "Pobieranie aktualizacji",
		message: "Zostaniesz poinformowany gdy aktualizacja będzie gotowa do zainstalowania",
		ok: "OK"
	},
	updateInstallLater: {
		title: "Instalowanie później",
		message: "Aktualizacja zostanie zainstalowana kiedy wyjdziesz z programu",
		ok: "OK"
	},
	updateReady: {
		title: "Aktualizacja gotowa do instalacji",
		message: "Aktualizacja została pobrana",
		installNow: "Zainstaluj teraz",
		installLater: "Zainstaluj później"
	},
	updateSkip: {
		title: "Pomiń aktualizację",
		message: "Powiadomimy Cię gdy będzie dostępna następna aktualizacja\nJeśli zmienisz zdanie możesz sprawdzić aktualizacje z menu O programie.",
		ok: "OK"
	},
	selectClientCertificate: {
		announcement: "Wybierz Certyfikat",
		select: "Wybierz",
		validDates: "Ważny od {{-validStart,}} do {{-validExpiry,}}"
	},
	mediaPermission: {
		title: "Wymagane Uprawnienie Mediów",
		message: "Dostęp do {{- permissionType}} jest obecnie wyłączony w ustawieniach systemu.",
		detail: "Aby włączyć funkcje rozmów wideo, proszę zezwolić na dostęp w ustawieniach prywatności systemu, a następnie uruchomić ponownie aplikację.",
		openSettings: "Otwórz Ustawienia",
		cancel: "Anuluj",
		microphone: "Mikrofon",
		camera: "Kamera",
		both: "Mikrofon i Kamera"
	}
};
var settings = {
	title: "Ustawienia",
	general: "Ogólne",
	options: {
		trayIcon: {
			title: "Ikona zasobnika",
			description: "Wyświetla ikonę w zasobniku systemowym. Gdy ikona zasobnika jest aktywna, aplikacja będzie minimalizowana do zasobnika przy zamykaniu. W przeciwnym razie aplikacja zostanie zamknięta."
		},
		availableBrowsers: {
			title: "Domyślna przeglądarka",
			description: "Wybierz, która przeglądarka będzie otwierać linki zewnętrzne z tej aplikacji. Ustawienie domyślne systemu używa ustawień Twojego systemu operacyjnego.",
			systemDefault: "Domyślna systemu",
			loading: "Ładowanie przeglądarek...",
			current: "Aktualnie używana:"
		}
	}
};
var error = {
	authNeeded: "Wymagane uwierzytelnienie, spróbuj <strong>{{- auth}}</strong>",
	connectTimeout: "Przekroczony czas oczekiwania podczas próby połączenia",
	differentCertificate: "Certyfikat jest inny od poprzedniego.\n\n {{- detail}}",
	noValidServerFound: "Nie znaleziono prawidłowego serwera pod podanym URL",
	offline: "Sprawdź połączenie z Internetem!"
};
var landing = {
	invalidUrl: "Nieprawidłowy url",
	validating: "Sprawdzanie...",
	inputUrl: "Wprowadź adres swojego serwera",
	connect: "Połącz"
};
var menus = {
	about: "O programie {{- appName}}",
	addNewServer: "Dodaj &nowy serwer",
	back: "W&stecz",
	clearTrustedCertificates: "Wyczyść zaufane certyfikaty",
	close: "Zamknij",
	copy: "&Kopiuj",
	cut: "&Wytnij",
	developerMode: "Tryb programisty",
	documentation: "Dokumentacja",
	editMenu: "&Edycja",
	fileMenu: "&Plik",
	forward: "&Do przodu",
	helpMenu: "Po&moc",
	hide: "Ukryj {{- appName}}",
	hideOthers: "Ukryj pozostałych",
	learnMore: "Dowiedz się więcej",
	minimize: "Minimalizacja",
	openDevTools: "Otwórz &Narzędzia deweloperskie",
	paste: "Wk&lej",
	quit: "Wy&jdź {{- appName}}",
	redo: "P&onów",
	reload: "P&rzeładuj",
	reportIssue: "Raportowanie błędu",
	resetAppData: "Reset danych aplikacji",
	resetZoom: "Reset zoomu",
	selectAll: "&Zaznacz wszystko",
	services: "Usługi",
	showFullScreen: "Pełny ekran",
	showMenuBar: "Pasek menu",
	showOnUnreadMessage: "Pokaż nieprzeczytane wiadomości",
	showServerList: "Lista serwerów",
	showTrayIcon: "Ikona zasobnika",
	toggleDevTools: "Przełącz &Narzędzia deweloperskie",
	undo: "&Cofnij",
	unhide: "Pokaż wszystko",
	viewMenu: "&Widok",
	windowMenu: "&Okno",
	zoomIn: "Przybliż",
	zoomOut: "Oddal"
};
var loadingError = {
	title: "Błąd ładowania serwera",
	announcement: "Hjuston, mamy problem",
	reload: "Przeładuj"
};
var selfxss = {
	title: "Stop!",
	description: "To jest funkcja przeglądarki dedykowana programistom. Jeśli ktoś powiedział Ci, by skopiować i wkleić coś tutaj aby włączyć funcjonalność Rocket.Chata lub \"zhackować\" czyjeś konto, to jest to oszustwo a Ty dasz temu komuś dostęp do swojego konta Rocket.Chat.",
	moreInfo: "Wejdź tutaj https://go.rocket.chat/i/xss po więcej informacji."
};
var sidebar = {
	addNewServer: "Dodaj nowy serwer",
	item: {
		reload: "Przeładuj serwer",
		remove: "Usuń serwer",
		openDevTools: "Otwórz Narzędzia deweloperskie"
	}
};
var touchBar = {
	formatting: "Formatowanie",
	selectServer: "Wybierz serwer"
};
var tray = {
	menu: {
		show: "Pokaż",
		hide: "Ukryj",
		quit: "Wyjdź"
	},
	tooltip: {
		noUnreadMessage: "{{- appName}}: Brak nieprzeczytanych wiadomości",
		unreadMention: "{{- appName}}: Masz nieprzeczytaną wzmiankę/wiadomość",
		unreadMention_plural: "{{- appName}}: Masz {{- count}} nieprzeczytanych wiadomości/wzmianek",
		unreadMessage: "{{- appName}}: Masz nieprzeczytane wiadomości"
	},
	balloon: {
		stillRunning: {
			title: "{{- appName}} wciąż działa",
			content: "{{- appName }} jest ustawiony aby działał w zasobniku systemowym/obszarze powiadomień."
		}
	}
};
var taskbar = {
	unreadMessage: "Nieprzeczytane wiadomości",
	unreadMention: "Nieprzeczytane wzmianki",
	noUnreadMessage: "Brak nieprzeczytanych wiadomości"
};
var screenSharing = {
	permissionDenied: "Odmowa uprawnień do nagrywania ekranu",
	permissionRequired: "Uprawnienie do nagrywania ekranu jest wymagane, aby udostępnić ekran.",
	permissionInstructions: "Włącz je w preferencjach systemowych i spróbuj ponownie.",
	title: "Udostępnij swój ekran",
	entireScreen: "Cały ekran",
	applicationWindow: "Okno aplikacji",
	noScreensFound: "Nie znaleziono ekranów",
	noWindowsFound: "Nie znaleziono okien",
	cancel: "Anuluj",
	share: "Udostępnij"
};
var pl_i18n = {
	contextMenu: contextMenu,
	dialog: dialog,
	settings: settings,
	error: error,
	landing: landing,
	menus: menus,
	loadingError: loadingError,
	selfxss: selfxss,
	sidebar: sidebar,
	touchBar: touchBar,
	tray: tray,
	taskbar: taskbar,
	screenSharing: screenSharing
};

exports.contextMenu = contextMenu;
exports.default = pl_i18n;
exports.dialog = dialog;
exports.error = error;
exports.landing = landing;
exports.loadingError = loadingError;
exports.menus = menus;
exports.screenSharing = screenSharing;
exports.selfxss = selfxss;
exports.settings = settings;
exports.sidebar = sidebar;
exports.taskbar = taskbar;
exports.touchBar = touchBar;
exports.tray = tray;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGwuaTE4bi1NRmE4SjBiUS5qcyIsInNvdXJjZXMiOltdLCJzb3VyY2VzQ29udGVudCI6W10sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9
