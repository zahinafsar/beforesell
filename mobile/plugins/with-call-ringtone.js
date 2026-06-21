const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Copies assets/ringtone.mp3 into android/app/src/main/res/raw so notifee can use
// it as the incoming-call channel sound. Survives `expo prebuild` regenerating
// the native android/ directory.
module.exports = function withCallRingtone(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const src = path.join(cfg.modRequest.projectRoot, 'assets', 'ringtone.mp3');
      const rawDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'raw',
      );
      if (fs.existsSync(src)) {
        fs.mkdirSync(rawDir, { recursive: true });
        fs.copyFileSync(src, path.join(rawDir, 'ringtone.mp3'));
      }
      return cfg;
    },
  ]);
};
