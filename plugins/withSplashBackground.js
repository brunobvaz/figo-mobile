const { withFinalizedMod } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');
const { parseStringPromise, Builder } = require('xml2js');

// Match the React splash before JavaScript starts, and preserve this on prebuild.
module.exports = function withSplashBackground(config) {
  return withFinalizedMod(config, ['ios', async (config) => {
    const root = path.join(config.modRequest.platformProjectRoot, config.modRequest.projectName);
    const asset = path.join(root, 'Images.xcassets', 'SplashIllustration.imageset');
    await fs.mkdir(asset, { recursive: true });
    await fs.copyFile(path.join(config.modRequest.projectRoot, 'assets/splash-mobile-transparent.png'), path.join(asset, 'image.png'));
    await fs.writeFile(path.join(asset, 'Contents.json'), JSON.stringify({
      images: [{ idiom: 'universal', filename: 'image.png' }],
      info: { version: 1, author: 'xcode' },
    }, null, 2));
    const file = path.join(root, 'SplashScreen.storyboard');
    const xml = await parseStringPromise(await fs.readFile(file, 'utf8'));
    const view = xml.document.scenes[0].scene[0].objects[0].viewController[0].view[0];
    const id = 'APP-SplashBackground';
    const views = view.subviews[0].imageView;
    view.subviews[0].imageView = views.filter(item => item.$.id !== id);
    view.subviews[0].imageView.unshift({ $: {
      id, image: 'SplashIllustration', contentMode: 'scaleAspectFill',
      clipsSubviews: 'YES', userInteractionEnabled: 'NO', translatesAutoresizingMaskIntoConstraints: 'NO',
    } });
    const constraints = view.constraints[0].constraint.filter(item => item.$.firstItem !== id);
    for (const edge of ['top', 'bottom', 'leading', 'trailing']) {
      constraints.push({ $: { firstItem: id, firstAttribute: edge,
        secondItem: view.$.id, secondAttribute: edge, id: `APP-Splash-${edge}` } });
    }
    view.constraints[0].constraint = constraints;
    const resources = xml.document.resources[0];
    resources.image = resources.image.filter(item => item.$.name !== 'SplashIllustration');
    resources.image.push({ $: { name: 'SplashIllustration', width: '841', height: '1870' } });
    await fs.writeFile(file, new Builder().buildObject(xml));
    return config;
  }]);
};
