const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAssistant(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];

    // Ensure activities array exists
    if (!app.activity) app.activity = [];

    // Find main activity
    const mainActivity = app.activity.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      if (!mainActivity['intent-filter']) mainActivity['intent-filter'] = [];

      // Add ASSIST intent filter
      const hasAssist = mainActivity['intent-filter'].some((f) =>
        f.action?.some((a) => a.$['android:name'] === 'android.intent.action.ASSIST')
      );

      if (!hasAssist) {
        mainActivity['intent-filter'].push({
          action: [{ $: { 'android:name': 'android.intent.action.ASSIST' } }],
          category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        });
      }

      // Add VOICE_COMMAND intent filter
      const hasVoice = mainActivity['intent-filter'].some((f) =>
        f.action?.some((a) => a.$['android:name'] === 'android.intent.action.VOICE_COMMAND')
      );

      if (!hasVoice) {
        mainActivity['intent-filter'].push({
          action: [{ $: { 'android:name': 'android.intent.action.VOICE_COMMAND' } }],
          category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        });
      }
    }

    // Add VoiceInteractionService metadata
    if (!app['meta-data']) app['meta-data'] = [];
    const hasMeta = app['meta-data'].some(
      (m) => m.$['android:name'] === 'android.voice_interaction'
    );
    if (!hasMeta) {
      app['meta-data'].push({
        $: {
          'android:name': 'android.voice_interaction',
          'android:value': 'true',
        },
      });
    }

    return config;
  });
};
