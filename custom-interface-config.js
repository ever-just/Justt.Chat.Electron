/* eslint-disable no-unused-vars, no-var, max-len */
/* eslint sort-keys: ["error", "asc", {"caseSensitive": false}] */

/**
 * EVERJUST Custom Interface Configuration
 * This file overrides the default Jitsi Meet interface configuration
 * to remove Jitsi branding and apply EVERJUST branding
 */

var interfaceConfig = {
    APP_NAME: 'EVERJUST Video Call',
    AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)',
    AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)',

    /**
     * A UX mode where the last screen share participant is automatically
     * pinned. Valid values are the string "remote-only" so remote participants
     * get pinned but not local, otherwise any truthy value for all participants,
     * and any falsy value to disable the feature.
     */
    AUTO_PIN_LATEST_SCREEN_SHARE: 'remote-only',
    BRAND_WATERMARK_LINK: '',

    CLOSE_PAGE_GUEST_HINT: false, // A html text to be shown to guests on the close page, false disables it

    DEFAULT_BACKGROUND: '#040404',
    DEFAULT_WELCOME_PAGE_LOGO_URL: '', // Remove default Jitsi logo

    DISABLE_DOMINANT_SPEAKER_INDICATOR: false,

    /**
     * If true, notifications regarding joining/leaving are no longer displayed.
     */
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,

    /**
     * If true, presence status: busy, calling, connected etc. is not displayed.
     */
    DISABLE_PRESENCE_STATUS: false,

    /**
     * Whether the speech to text transcription subtitles panel is disabled.
     */
    DISABLE_TRANSCRIPTION_SUBTITLES: false,

    /**
     * Whether or not the blurred video background for large video should be
     * displayed on browsers that can support it.
     */
    DISABLE_VIDEO_BACKGROUND: false,

    DISPLAY_WELCOME_FOOTER: true,
    DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
    DISPLAY_WELCOME_PAGE_CONTENT: false,
    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,

    ENABLE_DIAL_OUT: true,

    FILM_STRIP_MAX_HEIGHT: 120,

    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: true,

    /**
     * Hide the invite prompt in the header when alone in the meeting.
     */
    HIDE_INVITE_MORE_HEADER: true,

    JITSI_WATERMARK_LINK: '', // Remove Jitsi watermark link

    LANG_DETECTION: true, // Allow i18n to detect the system language
    LOCAL_THUMBNAIL_RATIO: 16 / 9, // 16:9

    /**
     * Maximum coefficient of the ratio of the large video to the visible area
     * after the large video is scaled to fit the window.
     */
    MAXIMUM_ZOOMING_COEFFICIENT: 1.3,

    /**
     * Whether the mobile app Jitsi Meet is to be promoted to participants
     * attempting to join a conference in a mobile Web browser.
     */
    MOBILE_APP_PROMO: false, // Disable Jitsi mobile app promotion

    // Names of browsers which should show a warning stating the current browser
    // has a suboptimal experience. Browsers which are not listed as optimal or
    // unsupported are considered suboptimal. Valid values are:
    // chrome, chromium, electron, firefox , safari, webkit
    OPTIMAL_BROWSERS: [ 'chrome', 'chromium', 'firefox', 'electron', 'safari', 'webkit' ],

    POLICY_LOGO: null,
    PROVIDER_NAME: 'EVERJUST', // Change from Jitsi to EVERJUST

    /**
     * If true, will display recent list
     */
    RECENT_LIST_ENABLED: true,
    REMOTE_THUMBNAIL_RATIO: 1, // 1:1

    SETTINGS_SECTIONS: [ 'devices', 'language', 'moderator', 'profile', 'calendar', 'sounds', 'more' ],

    /**
     * Specify which sharing features should be displayed. If the value is not set
     * all sharing features will be shown. You can set [] to disable all.
     */
    // SHARING_FEATURES: ['email', 'url', 'dial-in', 'embed'],

    SHOW_BRAND_WATERMARK: false, // Hide brand watermark

    /**
     * Decides whether the chrome extension banner should be rendered on the landing page and during the meeting.
     */
    SHOW_CHROME_EXTENSION_BANNER: false,

    SHOW_JITSI_WATERMARK: false, // CRITICAL: Hide Jitsi watermark/logo
    SHOW_POWERED_BY: false,
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,

    /*
     * If indicated some of the error dialogs may point to the support URL for
     * help.
     */
    SUPPORT_URL: 'https://everjust.com/support',

    // Browsers, in addition to those which do not fully support WebRTC, that
    // are not supported and should show the unsupported browser page.
    UNSUPPORTED_BROWSERS: [],

    /**
     * Whether to show thumbnails in filmstrip as a column instead of as a row.
     */
    VERTICAL_FILMSTRIP: true,

    // Determines how the video would fit the screen. 'both' would fit the whole
    // screen, 'height' would fit the original video height to the height of the
    // screen, 'width' would fit the original video width to the width of the
    // screen respecting ratio, 'nocrop' would make the video as large as
    // possible and preserve aspect ratio without cropping.
    VIDEO_LAYOUT_FIT: 'both',

    /**
     * If true, hides the video quality label indicating the resolution status
     * of the current large video.
     */
    VIDEO_QUALITY_LABEL_DISABLED: false,

    /**
     * How many columns the tile view can expand to. The respected range is
     * between 1 and 5.
     */
    // TILE_VIEW_MAX_COLUMNS: 5,

    // Allow all above example options to include a trailing comma and
    // prevent fear when commenting out the last value.
    // eslint-disable-next-line sort-keys
    makeJsonParserHappy: 'even if last key had a trailing comma'

    // No configuration value should follow this line.
};

/* eslint-enable no-unused-vars, no-var, max-len */
