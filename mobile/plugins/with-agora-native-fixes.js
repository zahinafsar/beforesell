const { withDangerousMod, withAppBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// react-native-agora (Video SDK) and agora-react-native-rtm (Signaling SDK) both
// ship a library named `aosl` (aosl.xcframework on iOS, libaosl.so on Android).
// Bundling both fails the build with a duplicate-name conflict. These hooks keep
// one copy on each platform, and survive `expo prebuild` regenerating native dirs.

const POD_MARKER = '# agora-aosl-dedupe';
const POD_BLOCK = `
${POD_MARKER}
pre_install do |installer|
  rtm_pod_path = File.join(installer.sandbox.root, 'AgoraRtm')
  aosl_xcframework_path = File.join(rtm_pod_path, 'aosl.xcframework')
  if File.exist?(aosl_xcframework_path)
    puts "Deleting duplicate aosl.xcframework from #{aosl_xcframework_path}"
    FileUtils.rm_rf(aosl_xcframework_path)
  end
end
`;

function withIosAoslFix(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (!contents.includes(POD_MARKER)) {
        contents += `\n${POD_BLOCK}\n`;
        fs.writeFileSync(podfile, contents);
      }
      return cfg;
    },
  ]);
}

function withAndroidAoslFix(config) {
  return withAppBuildGradle(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (!src.includes('libaosl.so')) {
      // Inject pickFirsts into the existing packagingOptions { jniLibs { ... } } block.
      src = src.replace(
        /(packagingOptions\s*\{\s*jniLibs\s*\{)/,
        `$1\n            pickFirsts += ['**/libaosl.so']`,
      );
      cfg.modResults.contents = src;
    }
    return cfg;
  });
}

module.exports = function withAgoraNativeFixes(config) {
  return withAndroidAoslFix(withIosAoslFix(config));
};
